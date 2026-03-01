import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { startOfWeek, endOfWeek } from "date-fns";

import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { GamificationRepository } from "../../domain/repositories";
import {
  Challenge,
  ChallengeFilter,
  GamificationAction,
  GamificationEvent,
  GamificationProfile,
  GamificationSummary,
  LeaderboardFilter,
  Milestone,
  PointsLog,
  PointsLogFilter,
  UserChallenge,
  UserMasteryProgress,
  UserMilestone,
  UserStreak,
  WeeklyChefTitle,
  WeeklyRanking,
} from "../../domain/gamification.model";
import { GamificationService } from "./interfaces/gamification";
import { RedisCacheService } from "./redis-cache.service";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";

export const GAMIFICATION_CRITICAL_QUEUE = "gamification-critical";
export const GAMIFICATION_DEFERRED_QUEUE = "gamification-deferred";
export const GAMIFICATION_ALERTS_QUEUE = "gamification-alerts";

/**
 * Gamification Service — pure reads + queue emission.
 *
 * All write/orchestration logic lives in use cases:
 * - ProcessGamificationEventUseCase (event pipeline)
 * - CheckMilestonesUseCase (milestone evaluation)
 * - ManageAlertsUseCase (alerts lifecycle)
 * - ProcessWeeklyRankingsUseCase (cron weekly)
 *
 * The GamificationFacadeImpl orchestrates use cases directly.
 */
@Injectable()
export class GamificationServiceImpl implements GamificationService {
  private readonly logger = new Logger(GamificationServiceImpl.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
    @InjectQueue(GAMIFICATION_CRITICAL_QUEUE)
    private readonly gamificationQueue: Queue,
    private readonly cacheService: RedisCacheService,
  ) {}

  // ══════════════════════════════════════════════════════════════════
  // ── Queue Emission ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    await this.gamificationQueue.add("process-event", event, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });

    this.logger.log(
      `Gamification event emitted: ${event.action} for user ${event.userId}`,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Summary (lightweight XP / level) ──────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getGamificationSummary(userId: string): Promise<GamificationSummary> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.SUMMARY(userId),
      CacheKeys.GAMIFICATION.SUMMARY_PREFIX,
      async () => {
        const [summary, todayXp, weekXp] = await Promise.all([
          this.repo.getGamificationSummary(userId),
          this.getUserXpToday(userId),
          this.getWeeklyXp(userId),
        ]);

        return {
          userId,
          totalXp: summary?.totalXp ?? 0,
          globalLevel: summary?.globalLevel ?? 1,
          globalLevelName: summary?.globalLevelName ?? "Novato",
          weeklyRank: summary?.weeklyRank ?? null,
          pointsThisWeek: weekXp,
          pointsToday: todayXp,
        };
      },
      CacheTTL.VERY_SHORT,
    );
  }

  async getUserXpToday(userId: string): Promise<number> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.XP_TODAY(userId),
      CacheKeys.GAMIFICATION.XP_TODAY_PREFIX,
      () => this.repo.getUserXpToday(userId),
      CacheTTL.VERY_SHORT,
    );
  }

  async getWeeklyXp(userId: string): Promise<number> {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.XP_WEEK(userId),
      CacheKeys.GAMIFICATION.XP_WEEK_PREFIX,
      () => this.repo.getUserXpForPeriod(userId, weekStart, weekEnd),
      CacheTTL.VERY_SHORT,
    );
  }

  async getRecentMilestones(userId: string, limit = 5): Promise<UserMilestone[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.RECENT_MILESTONES(userId),
      CacheKeys.GAMIFICATION.RECENT_MILESTONES_PREFIX,
      () => this.repo.getRecentMilestones(userId, limit),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Profile (composed from individually cached queries) ───────────
  // ══════════════════════════════════════════════════════════════════

  async getGamificationProfile(userId: string): Promise<GamificationProfile> {
    const [
      summary, streaks, masteries, recentMilestones,
      weeklyTitle, activeChallenges,
    ] = await Promise.all([
      this.getGamificationSummary(userId),
      this.getUserStreaks(userId),
      this.getUserMasteries(userId),
      this.getRecentMilestones(userId, 5),
      this.getCurrentWeeklyTitle(userId),
      this.getUserChallenges(userId, true),
    ]);

    return {
      userId,
      totalXp: summary.totalXp,
      globalLevel: summary.globalLevel,
      globalLevelName: summary.globalLevelName,
      streaks,
      masteries,
      recentMilestones,
      weeklyTitle,
      activeChallenges,
      weeklyRank: summary.weeklyRank,
      pointsThisWeek: summary.pointsThisWeek,
      pointsToday: summary.pointsToday,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Points History ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getPointsHistory(
    filter: PointsLogFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<PointsLog>> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.POINTS_LOG(filter.userId, JSON.stringify({ ...filter, ...pagination })),
      CacheKeys.GAMIFICATION.POINTS_PREFIX,
      () => this.repo.getPointsLog(filter, pagination),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Streaks ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getUserStreaks(userId: string): Promise<UserStreak[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.STREAKS(userId),
      CacheKeys.GAMIFICATION.STREAKS_PREFIX,
      () => this.repo.getUserStreaks(userId),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Milestones ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getAllMilestones(): Promise<Milestone[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.MILESTONES_ALL(),
      CacheKeys.GAMIFICATION.MILESTONES_PREFIX,
      () => this.repo.getAllMilestones(),
      CacheTTL.VERY_LONG,
    );
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.USER_MILESTONES(userId),
      CacheKeys.GAMIFICATION.MILESTONES_PREFIX,
      () => this.repo.getUserMilestones(userId),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Mastery ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getUserMasteries(userId: string): Promise<UserMasteryProgress[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.MASTERIES(userId),
      CacheKeys.GAMIFICATION.MASTERIES_PREFIX,
      () => this.repo.getUserMasteries(userId),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Weekly Titles ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getCurrentWeeklyTitle(userId: string): Promise<WeeklyChefTitle | null> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.WEEKLY_TITLE(userId),
      CacheKeys.GAMIFICATION.WEEKLY_PREFIX,
      () => this.repo.getCurrentWeeklyTitle(userId),
      CacheTTL.MEDIUM,
    );
  }

  async getWeeklyTitleHistory(userId: string, limit?: number): Promise<WeeklyChefTitle[]> {
    return this.repo.getUserWeeklyTitleHistory(userId, limit);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Leaderboard ───────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getLeaderboard(filter: LeaderboardFilter): Promise<PaginatedResponse<WeeklyRanking>> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.LEADERBOARD(JSON.stringify(filter)),
      CacheKeys.GAMIFICATION.LEADERBOARD_PREFIX,
      () => this.repo.getLeaderboard(filter),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Challenges ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getActiveChallenges(filter?: ChallengeFilter): Promise<Challenge[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.CHALLENGES(JSON.stringify(filter ?? {})),
      CacheKeys.GAMIFICATION.CHALLENGES_PREFIX,
      () => this.repo.getActiveChallenges(filter),
      CacheTTL.MEDIUM,
    );
  }

  async getUserChallenges(userId: string, activeOnly = false): Promise<UserChallenge[]> {
    return this.cacheService.getOrSet(
      CacheKeys.GAMIFICATION.USER_CHALLENGES(userId, activeOnly),
      CacheKeys.GAMIFICATION.USER_CHALLENGES_PREFIX,
      () => this.repo.getUserChallenges(userId, activeOnly),
      CacheTTL.SHORT,
    );
  }

  async joinChallenge(userId: string, challengeId: string): Promise<UserChallenge> {
    const result = await this.repo.joinChallenge(userId, challengeId);
    await this.cacheService.invalidatePrefix(
      CacheKeys.GAMIFICATION.USER_CHALLENGES_PREFIX,
    );
    return result;
  }

  async claimChallengeReward(userId: string, challengeId: string): Promise<UserChallenge> {
    const userChallenge = await this.repo.claimChallengeReward(userId, challengeId);

    if (userChallenge?.challenge) {
      await this.emitGamificationEvent({
        userId,
        action: GamificationAction.CHALLENGE_COMPLETED,
        referenceId: challengeId,
        referenceType: "challenge",
        metadata: { challengeName: userChallenge.challenge.name },
        timestamp: new Date(),
      });
    }

    await this.cacheService.invalidatePrefix(CacheKeys.GAMIFICATION.PROFILE_PREFIX);
    await this.cacheService.invalidatePrefix(CacheKeys.GAMIFICATION.MASTERIES_PREFIX);
    await this.cacheService.invalidatePrefix(CacheKeys.GAMIFICATION.LEADERBOARD_PREFIX);
    return userChallenge;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Cron helper ───────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async expireOldChallenges(): Promise<void> {
    const expired = await this.repo.expireOldChallenges();
    if (expired > 0) {
      this.logger.log(`Expired ${expired} old challenges`);
      await this.cacheService.invalidatePrefix(
        CacheKeys.GAMIFICATION.CHALLENGES_PREFIX,
      );
    }
  }
}
