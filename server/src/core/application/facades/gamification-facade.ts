import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import {
  Challenge,
  ChallengeFilter,
  GamificationAlert,
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
import {
  GamificationFacade,
  GamificationService,
} from "../services/interfaces/gamification";
import { ManageAlertsUseCase } from "../use-cases/gamification/manage-alerts.use-case";
import { ProcessWeeklyRankingsUseCase } from "../use-cases/gamification/process-weekly-rankings.use-case";

@Injectable()
export class GamificationFacadeImpl implements GamificationFacade {
  private readonly logger = new Logger(GamificationFacadeImpl.name);

  constructor(
    @Inject("GamificationService")
    private readonly gamificationService: GamificationService,
    private readonly manageAlertsUC: ManageAlertsUseCase,
    private readonly processWeeklyRankingsUC: ProcessWeeklyRankingsUseCase,
  ) {}

  // ── Event Emission ────────────────────────────────────────────────

  emitGamificationEvent(event: GamificationEvent): Promise<void> {
    return this.gamificationService.emitGamificationEvent(event);
  }

  // ── Profile ───────────────────────────────────────────────────────

  getGamificationProfile(userId: string): Promise<GamificationProfile> {
    return this.gamificationService.getGamificationProfile(userId);
  }

  // ── Summary (lightweight) ─────────────────────────────────────────

  getGamificationSummary(userId: string): Promise<GamificationSummary> {
    return this.gamificationService.getGamificationSummary(userId);
  }

  // ── Points History ────────────────────────────────────────────────

  getPointsHistory(
    filter: PointsLogFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<PointsLog>> {
    return this.gamificationService.getPointsHistory(filter, pagination);
  }

  // ── Streaks ───────────────────────────────────────────────────────

  getUserStreaks(userId: string): Promise<UserStreak[]> {
    return this.gamificationService.getUserStreaks(userId);
  }

  // ── Milestones ────────────────────────────────────────────────────

  getAllMilestones(): Promise<Milestone[]> {
    return this.gamificationService.getAllMilestones();
  }

  getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return this.gamificationService.getUserMilestones(userId);
  }

  // ── Mastery ───────────────────────────────────────────────────────

  getUserMasteries(userId: string): Promise<UserMasteryProgress[]> {
    return this.gamificationService.getUserMasteries(userId);
  }

  // ── Weekly Titles ─────────────────────────────────────────────────

  getCurrentWeeklyTitle(userId: string): Promise<WeeklyChefTitle | null> {
    return this.gamificationService.getCurrentWeeklyTitle(userId);
  }

  getWeeklyTitleHistory(
    userId: string,
    limit?: number,
  ): Promise<WeeklyChefTitle[]> {
    return this.gamificationService.getWeeklyTitleHistory(userId, limit);
  }

  // ── Leaderboard ───────────────────────────────────────────────────

  getLeaderboard(
    filter: LeaderboardFilter,
  ): Promise<PaginatedResponse<WeeklyRanking>> {
    return this.gamificationService.getLeaderboard(filter);
  }

  // ── Challenges ────────────────────────────────────────────────────

  getActiveChallenges(filter?: ChallengeFilter): Promise<Challenge[]> {
    return this.gamificationService.getActiveChallenges(filter);
  }

  getUserChallenges(
    userId: string,
    activeOnly?: boolean,
  ): Promise<UserChallenge[]> {
    return this.gamificationService.getUserChallenges(userId, activeOnly);
  }

  joinChallenge(
    userId: string,
    challengeId: string,
  ): Promise<UserChallenge> {
    return this.gamificationService.joinChallenge(userId, challengeId);
  }

  claimChallengeReward(
    userId: string,
    challengeId: string,
  ): Promise<UserChallenge> {
    return this.gamificationService.claimChallengeReward(userId, challengeId);
  }

  // ── Alerts (delegated to ManageAlertsUseCase) ─────────────────────

  getUserAlerts(userId: string): Promise<GamificationAlert[]> {
    return this.manageAlertsUC.getUserAlerts(userId);
  }

  dismissAlert(alertId: string, userId: string): Promise<void> {
    return this.manageAlertsUC.dismissAlert(alertId, userId);
  }

  dismissAllAlerts(userId: string): Promise<void> {
    return this.manageAlertsUC.dismissAllAlerts(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Cron Jobs (orchestrated here) ─────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_WEEK)
  async processWeeklyRankings(): Promise<void> {
    this.logger.log("Running weekly rankings cron...");
    await this.processWeeklyRankingsUC.execute();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyCounters(): Promise<void> {
    this.logger.log("Running daily counters reset...");
    await this.gamificationService.expireOldChallenges();
  }
}
