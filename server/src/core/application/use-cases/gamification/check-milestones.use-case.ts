import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { v4 as uuid } from "uuid";
import { GamificationRepository } from "../../../domain/repositories";
import {
  GamificationAction,
  GamificationAlertType,
  MasteryCategory,
  Milestone,
  MilestoneType,
  UserMilestone,
  UserStreak,
} from "../../../domain/gamification.model";
import { ActivityType } from "../../../domain/social.model";
import { ManageAlertsUseCase } from "./manage-alerts.use-case";
import {
  SOCIAL_QUEUE,
  SocialJobType,
  type SocialJobPayload,
} from "../../services/social-processor";

type MilestoneCheck = {
  type: MilestoneType;
  action: GamificationAction;
  requiredValue: number;
};

const ACTION_MILESTONE_CHECKS: Partial<
  Record<GamificationAction, MilestoneCheck[]>
> = {
  [GamificationAction.RECIPE_COOKED]: [
    {
      type: MilestoneType.FIRST_RECIPE_COOKED,
      action: GamificationAction.RECIPE_COOKED,
      requiredValue: 1,
    },
    {
      type: MilestoneType.RECIPES_COOKED_10,
      action: GamificationAction.RECIPE_COOKED,
      requiredValue: 10,
    },
    {
      type: MilestoneType.RECIPES_COOKED_50,
      action: GamificationAction.RECIPE_COOKED,
      requiredValue: 50,
    },
    {
      type: MilestoneType.RECIPES_COOKED_100,
      action: GamificationAction.RECIPE_COOKED,
      requiredValue: 100,
    },
    {
      type: MilestoneType.RECIPES_COOKED_500,
      action: GamificationAction.RECIPE_COOKED,
      requiredValue: 500,
    },
  ],
  [GamificationAction.RECIPE_CREATED]: [
    {
      type: MilestoneType.FIRST_RECIPE_CREATED,
      action: GamificationAction.RECIPE_CREATED,
      requiredValue: 1,
    },
    {
      type: MilestoneType.RECIPES_CREATED_10,
      action: GamificationAction.RECIPE_CREATED,
      requiredValue: 10,
    },
    {
      type: MilestoneType.RECIPES_CREATED_50,
      action: GamificationAction.RECIPE_CREATED,
      requiredValue: 50,
    },
  ],
  [GamificationAction.PANTRY_ITEM_ADDED]: [
    {
      type: MilestoneType.FIRST_PANTRY_ITEM,
      action: GamificationAction.PANTRY_ITEM_ADDED,
      requiredValue: 1,
    },
    {
      type: MilestoneType.PANTRY_ITEMS_50,
      action: GamificationAction.PANTRY_ITEM_ADDED,
      requiredValue: 50,
    },
  ],
  [GamificationAction.PURCHASE_REGISTERED]: [
    {
      type: MilestoneType.FIRST_PURCHASE,
      action: GamificationAction.PURCHASE_REGISTERED,
      requiredValue: 1,
    },
    {
      type: MilestoneType.PURCHASES_20,
      action: GamificationAction.PURCHASE_REGISTERED,
      requiredValue: 20,
    },
  ],
  [GamificationAction.POST_CREATED]: [
    {
      type: MilestoneType.FIRST_POST,
      action: GamificationAction.POST_CREATED,
      requiredValue: 1,
    },
  ],
  [GamificationAction.COMMENT_ADDED]: [
    {
      type: MilestoneType.FIRST_COMMENT,
      action: GamificationAction.COMMENT_ADDED,
      requiredValue: 1,
    },
  ],
  [GamificationAction.MEALPLAN_ENTRY_CREATED]: [
    {
      type: MilestoneType.FIRST_MEALPLAN,
      action: GamificationAction.MEALPLAN_ENTRY_CREATED,
      requiredValue: 1,
    },
  ],
  [GamificationAction.USED_EXPIRING_INGREDIENT]: [
    {
      type: MilestoneType.ZERO_WASTE_HERO,
      action: GamificationAction.USED_EXPIRING_INGREDIENT,
      requiredValue: 1,
    },
    {
      type: MilestoneType.ZERO_WASTE_10,
      action: GamificationAction.USED_EXPIRING_INGREDIENT,
      requiredValue: 10,
    },
  ],
};

const STREAK_MILESTONE_CHECKS: Array<{ type: MilestoneType; requiredValue: number }> =
  [
    { type: MilestoneType.STREAK_7_DAYS, requiredValue: 7 },
    { type: MilestoneType.STREAK_30_DAYS, requiredValue: 30 },
    { type: MilestoneType.STREAK_60_DAYS, requiredValue: 60 },
    { type: MilestoneType.STREAK_100_DAYS, requiredValue: 100 },
  ];

const XP_MILESTONE_CHECKS: Array<{ type: MilestoneType; requiredValue: number }> = [
  { type: MilestoneType.XP_1000, requiredValue: 1000 },
  { type: MilestoneType.XP_5000, requiredValue: 5000 },
  { type: MilestoneType.XP_10000, requiredValue: 10000 },
  { type: MilestoneType.XP_50000, requiredValue: 50000 },
];

/**
 * Params needed for milestone evaluation.
 * All pre-fetched data is passed in to avoid extra queries.
 */
export interface MilestoneCheckParams {
  userId: string;
  action: GamificationAction;
  totalXp: number;
  allMilestones: Milestone[];
  userMilestones: UserMilestone[];
  streaks: UserStreak[];
}

@Injectable()
export class CheckMilestonesUseCase {
  private readonly logger = new Logger(CheckMilestonesUseCase.name);

  constructor(
    @Inject("GamificationRepository")
    private readonly repo: GamificationRepository,
    private readonly manageAlertsUC: ManageAlertsUseCase,
    @InjectQueue(SOCIAL_QUEUE)
    private readonly socialQueue: Queue,
  ) {}

  /**
   * Evaluates all milestone types (action-based, streak, XP) in a single pass.
   *
   * Pre-fetched data avoids duplicate queries:
   * - allMilestones: Redis-cached (0 DB queries)
   * - userMilestones: pre-fetched in processGamificationEvent
   * - totalXp & streaks: reused from previous phases
   *
   * Only queries: getUserActionCounts (1 batch GROUP BY query)
   * Only writes: unlockMilestone + logPoints per new unlock (0 if none)
   */
  async execute(params: MilestoneCheckParams): Promise<void> {
    const { userId, action, totalXp, allMilestones, userMilestones, streaks } = params;

    const actionChecks = this.getMilestoneChecksForAction(action);
    const shouldCheckActionMilestones = actionChecks.length > 0;
    const shouldCheckStreakMilestones = streaks.length > 0;
    const shouldCheckXpMilestones = totalXp >= 1000;

    if (!shouldCheckActionMilestones && !shouldCheckStreakMilestones && !shouldCheckXpMilestones) {
      return;
    }

    // Build set of already-unlocked milestone types
    const milestoneById = new Map(allMilestones.map((m) => [m.id, m]));
    const milestoneByType = new Map(allMilestones.map((m) => [m.type, m]));
    const unlockedTypes = new Set<string>();
    for (const um of userMilestones) {
      const milestone = milestoneById.get(um.milestoneId);
      if (milestone) unlockedTypes.add(milestone.type);
    }

    // ── 1. Action-based milestones (1 batch query) ──
    if (shouldCheckActionMilestones) {
      const uniqueActions = [...new Set(actionChecks.map((c) => c.action))];
      const actionCounts = await this.repo.getUserActionCounts(userId, uniqueActions);

      for (const check of actionChecks) {
        if (unlockedTypes.has(check.type)) continue;
        const currentCount = actionCounts.get(check.action) ?? 0;
        if (currentCount >= check.requiredValue) {
          const milestone = milestoneByType.get(check.type);
          if (milestone) {
            await this.unlockMilestoneWithReward(userId, milestone);
            unlockedTypes.add(check.type);
          }
        }
      }
    }

    // ── 2. Streak milestones (0 queries — data pre-fetched) ──
    if (shouldCheckStreakMilestones) {
      let maxStreak = 0;
      for (const streak of streaks) {
        if (streak.currentCount > maxStreak) {
          maxStreak = streak.currentCount;
        }
      }

      for (const sm of STREAK_MILESTONE_CHECKS) {
        if (maxStreak >= sm.requiredValue && !unlockedTypes.has(sm.type)) {
          const milestone = milestoneByType.get(sm.type);
          if (milestone) {
            await this.unlockMilestoneWithReward(userId, milestone);
            unlockedTypes.add(sm.type);
          }
        }
      }
    }

    // ── 3. XP milestones (0 queries — totalXp reused) ──
    if (shouldCheckXpMilestones) {
      for (const xm of XP_MILESTONE_CHECKS) {
        if (totalXp >= xm.requiredValue && !unlockedTypes.has(xm.type)) {
          const milestone = milestoneByType.get(xm.type);
          if (milestone) {
            await this.unlockMilestoneWithReward(userId, milestone);
            unlockedTypes.add(xm.type);
          }
        }
      }
    }
  }

  /**
   * Returns the declarative milestone check table for a given action.
   */
  getMilestoneChecksForAction(
    action: GamificationAction,
  ): MilestoneCheck[] {
    return ACTION_MILESTONE_CHECKS[action] ?? [];
  }

  /**
   * Unlocks a milestone, awards XP reward, and creates alert.
   */
  private async unlockMilestoneWithReward(
    userId: string,
    milestone: Milestone,
  ): Promise<void> {
    const didUnlock = await this.repo.tryUnlockMilestone({
      id: uuid(),
      userId,
      milestoneId: milestone.id,
      unlockedAt: new Date(),
    });
    if (!didUnlock) return;

    if (milestone.xpReward > 0) {
      await Promise.all([
        this.repo.logPoints({
          id: uuid(),
          userId,
          action: GamificationAction.CHALLENGE_COMPLETED,
          basePoints: milestone.xpReward,
          streakMultiplier: 1,
          totalPoints: milestone.xpReward,
          masteryCategory:
            milestone.category === "general"
              ? MasteryCategory.CHEF
              : (milestone.category as MasteryCategory),
          masteryXpGained: milestone.xpReward,
          referenceId: milestone.id,
          referenceType: "milestone",
          metadata: {
            milestoneName: milestone.name,
            milestoneType: milestone.type,
          },
          createdAt: new Date(),
        }),
        this.repo.applyXpDelta(userId, milestone.xpReward),
      ]);
    }

    await this.manageAlertsUC.storeAlertInRedisAndQueue({
      id: uuid(),
      userId,
      alertType: GamificationAlertType.MILESTONE_UNLOCKED,
      title: `¡Hito desbloqueado!`,
      message: `Has alcanzado: ${milestone.name}`,
      icon: milestone.icon,
      data: {
        milestoneId: milestone.id,
        milestoneName: milestone.name,
        milestoneType: milestone.type,
        milestoneDescription: milestone.description,
        xpReward: milestone.xpReward,
        category: milestone.category,
      },
      seen: false,
      createdAt: new Date(),
    });

    // Emit social activity post for milestone unlock
    await this.emitActivityPost(userId, milestone);

    this.logger.log(
      `Milestone unlocked: ${milestone.name} for user ${userId}`,
    );
  }

  private async emitActivityPost(userId: string, milestone: Milestone): Promise<void> {
    try {
      const payload: SocialJobPayload = {
        type: SocialJobType.CREATE_ACTIVITY_POST,
        data: {
          userId,
          activityType: ActivityType.ACHIEVEMENT_UNLOCKED,
          metadata: {
            achievementName: milestone.name,
            achievementIcon: milestone.icon,
            milestoneType: milestone.type,
            xpReward: milestone.xpReward,
          },
        },
      };

      await this.socialQueue.add(SocialJobType.CREATE_ACTIVITY_POST, payload, {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      });
    } catch (error: any) {
      this.logger.warn(`Failed to emit activity post for milestone: ${error?.message}`);
    }
  }
}
