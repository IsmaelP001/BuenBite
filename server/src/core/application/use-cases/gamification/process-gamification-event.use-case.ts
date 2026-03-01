import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { v4 as uuid } from "uuid";
import { format, subDays } from "date-fns";

import { GamificationRepository } from "../../../domain/repositories";
import {
  ACTION_POINTS,
  ACTION_TO_MASTERY,
  GamificationAction,
  GamificationAlertType,
  GamificationEvent,
  getGlobalLevel,
  getMasteryLevelForXp,
  getStreakMultiplier,
  MasteryLevel,
  Milestone,
  PointsLog,
  StreakType,
  UserMilestone,
  UserStreak,
} from "../../../domain/gamification.model";
import { RedisCacheService } from "../../services/redis-cache.service";
import { CacheKeys, CacheTTL } from "../../../../shared/cache-keys-const";
import { CheckMilestonesUseCase } from "./check-milestones.use-case";
import { ManageAlertsUseCase } from "./manage-alerts.use-case";
import { GAMIFICATION_DEFERRED_QUEUE } from "../../services/gamification-service-impl";

// Mapeo de acciones a tipo de racha
const ACTION_TO_STREAK: Partial<Record<GamificationAction, StreakType>> = {
  [GamificationAction.RECIPE_COOKED]: StreakType.COOKING,
  [GamificationAction.PANTRY_ITEM_ADDED]: StreakType.PANTRY,
  [GamificationAction.MEALPLAN_COMPLETED]: StreakType.MEALPLAN,
};

/**
 * Core gamification event pipeline.
 *
 * Optimized for minimal queries:
 * - Phase 1: Streak upsert + Mastery upsert in parallel (2 queries)
 * - Phase 2: Log points + Update mastery in parallel (2 queries)
 * - Phase 3: Atomic XP delta (1 query)
 * - Phase 4: Milestones pre-fetch (cached)
 * - Phase 5: Milestone checks + critical alerts (writes only on unlock)
 * - Phase 6: Deferred queue emission (challenges/cache invalidation)
 *
 * Critical path total: ~5-8 queries for typical events.
 */
@Injectable()
export class ProcessGamificationEventUseCase {
  private readonly logger = new Logger(ProcessGamificationEventUseCase.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
    private readonly checkMilestonesUC: CheckMilestonesUseCase,
    private readonly manageAlertsUC: ManageAlertsUseCase,
    private readonly cacheService: RedisCacheService,
    @InjectQueue(GAMIFICATION_DEFERRED_QUEUE)
    private readonly deferredQueue: Queue,
  ) {}

  async execute(event: GamificationEvent): Promise<PointsLog> {
    const { userId, action, referenceId, referenceType, metadata } = event;

    this.logger.log(`Processing gamification event: ${action} for ${userId}`);

    // ────────────────────────────────────────────────────────────────
    // Phase 1: Streak + Mastery upsert in parallel (2 queries)
    // ────────────────────────────────────────────────────────────────
    const streakType = ACTION_TO_STREAK[action];
    const masteryCategory = ACTION_TO_MASTERY[action];
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    const [prefetchedStreak, prefetchedMastery] = await Promise.all([
      streakType
        ? this.repo.upsertAndUpdateStreak(userId, streakType, today, yesterday)
        : Promise.resolve(null),
      this.repo.upsertMastery(userId, masteryCategory),
    ]);

    const streakMultiplier = prefetchedStreak
      ? getStreakMultiplier(prefetchedStreak.currentCount)
      : 1;

    // ────────────────────────────────────────────────────────────────
    // Phase 2: Log points + Update mastery in parallel (2 queries)
    // ────────────────────────────────────────────────────────────────
    const basePoints = ACTION_POINTS[action] ?? 0;
    const totalPoints = Math.round(basePoints * streakMultiplier);
    const masteryXpGained = totalPoints;

    const newMasteryXp = prefetchedMastery.currentXp + masteryXpGained;
    const newMasteryLevelConfig = getMasteryLevelForXp(masteryCategory, newMasteryXp);

    const [pointsLog] = await Promise.all([
      this.repo.logPoints({
        id: uuid(),
        userId,
        action,
        basePoints,
        streakMultiplier,
        totalPoints,
        masteryCategory,
        masteryXpGained,
        referenceId: referenceId ?? null,
        referenceType: referenceType ?? null,
        metadata: metadata ?? null,
        createdAt: new Date(),
      }),
      this.repo.updateMastery({
        id: prefetchedMastery.id,
        currentXp: newMasteryXp,
        currentLevel: newMasteryLevelConfig.level as MasteryLevel,
      }),
    ]);

    // ────────────────────────────────────────────────────────────────
    // Phase 3: Atomic XP increment + derived global level (1 query)
    // ────────────────────────────────────────────────────────────────
    const summaryAfterXp = await this.repo.applyXpDelta(userId, totalPoints);
    const newTotalXp = summaryAfterXp.totalXp;
    const previousGlobalLevel = getGlobalLevel(newTotalXp - totalPoints).level;

    // Global level-up alert (Redis + queue only)
    if (summaryAfterXp.globalLevel > previousGlobalLevel) {
      await this.manageAlertsUC.storeAlertInRedisAndQueue({
        id: uuid(),
        userId,
        alertType: GamificationAlertType.GLOBAL_LEVEL_UP,
        title: `¡Subiste de nivel!`,
        message: `Has alcanzado el nivel ${summaryAfterXp.globalLevel}: ${summaryAfterXp.globalLevelName}`,
        icon: "🎉",
        data: {
          previousLevel: previousGlobalLevel,
          newLevel: summaryAfterXp.globalLevel,
          levelName: summaryAfterXp.globalLevelName,
          totalXp: newTotalXp,
        },
        seen: false,
        createdAt: new Date(),
      });
      this.logger.log(
        `User ${userId} global level up: ${previousGlobalLevel} → ${summaryAfterXp.globalLevel} (${summaryAfterXp.globalLevelName})`,
      );
    }

    // ────────────────────────────────────────────────────────────────
    // Phase 4: Conditional milestones pre-fetch (cached)
    // ────────────────────────────────────────────────────────────────
    const actionMilestoneChecks = this.checkMilestonesUC.getMilestoneChecksForAction(action);
    const shouldCheckActionMilestones = actionMilestoneChecks.length > 0;
    const shouldCheckStreakMilestones = Boolean(streakType);
    const shouldCheckXpMilestones = newTotalXp >= 1000;
    const shouldRunMilestoneChecks =
      shouldCheckActionMilestones ||
      shouldCheckStreakMilestones ||
      shouldCheckXpMilestones;

    const [allMilestones, userMilestones, streaks] =
      await Promise.all([
        shouldRunMilestoneChecks
          ? this.cacheService.getOrSet(
              CacheKeys.GAMIFICATION.MILESTONES_ALL(),
              CacheKeys.GAMIFICATION.MILESTONES_PREFIX,
              () => this.repo.getAllMilestones(),
              CacheTTL.VERY_LONG,
            )
          : Promise.resolve<Milestone[]>([]),
        shouldRunMilestoneChecks
          ? this.repo.getUserMilestones(userId)
          : Promise.resolve<UserMilestone[]>([]),
        shouldCheckStreakMilestones
          ? this.repo.getUserStreaks(userId)
          : Promise.resolve<UserStreak[]>([]),
      ]);

    // ────────────────────────────────────────────────────────────────
    // Phase 5: Milestone checks (critical path)
    // ────────────────────────────────────────────────────────────────
    if (shouldRunMilestoneChecks) {
      await this.checkMilestonesUC.execute({
        userId,
        action,
        totalXp: newTotalXp,
        allMilestones,
        userMilestones,
        streaks,
      });
    }

    try {
      await this.deferredQueue.add("process-event-deferred", event, {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      });
    } catch (error: any) {
      this.logger.warn(
        `Failed to enqueue deferred gamification processing for user ${userId}: ${error?.message}`,
      );
    }

    // ────────────────────────────────────────────────────────────────
    // Phase 6: Deferred work enqueued
    // ────────────────────────────────────────────────────────────────
    this.logger.log(
      `Awarded ${totalPoints} XP (${basePoints} base × ${streakMultiplier} streak) to user ${userId} for ${action}`,
    );

    return pointsLog;
  }
}
