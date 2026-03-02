import { PaginationParams } from "../../../../shared/dto/input";
import { PaginatedResponse } from "../../../../shared/dto/response";
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
} from "../../../domain/gamification.model";

// ─── Gamification Service Interface (pure reads + queue) ─────────────

export interface GamificationService {
  // ── Queue Emission ────────────────────────────────────────────────
  emitGamificationEvent(event: GamificationEvent): Promise<void>;

  // ── Profile ───────────────────────────────────────────────────────
  getGamificationProfile(userId: string): Promise<GamificationProfile>;

  // ── Summary (lightweight XP / level) ──────────────────────────────
  getGamificationSummary(userId: string): Promise<GamificationSummary>;
  getRecentMilestones(userId: string, limit?: number): Promise<UserMilestone[]>;
  getUserXpToday(userId: string): Promise<number>;
  getWeeklyXp(userId: string): Promise<number>;

  // ── Points History ────────────────────────────────────────────────
  getPointsHistory(
    filter: PointsLogFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<PointsLog>>;

  // ── Streaks ───────────────────────────────────────────────────────
  getUserStreaks(userId: string): Promise<UserStreak[]>;

  // ── Milestones ────────────────────────────────────────────────────
  getAllMilestones(): Promise<Milestone[]>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;

  // ── Mastery ───────────────────────────────────────────────────────
  getUserMasteries(userId: string): Promise<UserMasteryProgress[]>;

  // ── Weekly Titles ─────────────────────────────────────────────────
  getCurrentWeeklyTitle(userId: string): Promise<WeeklyChefTitle | null>;
  getWeeklyTitleHistory(userId: string, limit?: number): Promise<WeeklyChefTitle[]>;

  // ── Leaderboard ───────────────────────────────────────────────────
  getLeaderboard(
    filter: LeaderboardFilter,
  ): Promise<PaginatedResponse<WeeklyRanking>>;

  // ── Challenges ────────────────────────────────────────────────────
  getActiveChallenges(filter?: ChallengeFilter): Promise<Challenge[]>;
  getUserChallenges(userId: string, activeOnly?: boolean): Promise<UserChallenge[]>;
  joinChallenge(userId: string, challengeId: string): Promise<UserChallenge>;
  claimChallengeReward(userId: string, challengeId: string): Promise<UserChallenge>;

  // ── Cron helpers ──────────────────────────────────────────────────
  expireOldChallenges(): Promise<void>;
}

// ─── Gamification Facade Interface ───────────────────────────────────

export interface GamificationFacade {
  // ── Event Emission ────────────────────────────────────────────────
  emitGamificationEvent(event: GamificationEvent): Promise<void>;

  // ── Profile ───────────────────────────────────────────────────────
  getGamificationProfile(userId: string): Promise<GamificationProfile>;

  // ── Summary (lightweight XP / level) ──────────────────────────────
  getGamificationSummary(userId: string): Promise<GamificationSummary>;

  // ── Points History ────────────────────────────────────────────────
  getPointsHistory(
    filter: PointsLogFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<PointsLog>>;

  // ── Streaks ───────────────────────────────────────────────────────
  getUserStreaks(userId: string): Promise<UserStreak[]>;

  // ── Milestones ────────────────────────────────────────────────────
  getAllMilestones(): Promise<Milestone[]>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;

  // ── Mastery ───────────────────────────────────────────────────────
  getUserMasteries(userId: string): Promise<UserMasteryProgress[]>;

  // ── Weekly Titles ─────────────────────────────────────────────────
  getCurrentWeeklyTitle(userId: string): Promise<WeeklyChefTitle | null>;
  getWeeklyTitleHistory(userId: string, limit?: number): Promise<WeeklyChefTitle[]>;

  // ── Leaderboard ───────────────────────────────────────────────────
  getLeaderboard(
    filter: LeaderboardFilter,
  ): Promise<PaginatedResponse<WeeklyRanking>>;

  // ── Challenges ────────────────────────────────────────────────────
  getActiveChallenges(filter?: ChallengeFilter): Promise<Challenge[]>;
  getUserChallenges(userId: string, activeOnly?: boolean): Promise<UserChallenge[]>;
  joinChallenge(userId: string, challengeId: string): Promise<UserChallenge>;
  claimChallengeReward(userId: string, challengeId: string): Promise<UserChallenge>;

  // ── Alerts ────────────────────────────────────────────────────────
  getUserAlerts(userId: string): Promise<GamificationAlert[]>;
  dismissAlert(alertId: string, userId: string): Promise<void>;
  dismissAllAlerts(userId: string): Promise<void>;

  // ── Cron ──────────────────────────────────────────────────────────
  processWeeklyRankings(): Promise<void>;
  resetDailyCounters(): Promise<void>;
}
