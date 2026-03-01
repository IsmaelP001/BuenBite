import {
  ChallengeType,
  GamificationAction,
  MasteryCategory,
} from "../../domain/gamification.model";

// ─── Event DTOs ─────────────────────────────────────────────────────

export interface EmitGamificationEventDto {
  userId: string;
  action: GamificationAction;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
}

// ─── Points History DTOs ────────────────────────────────────────────

export interface GetPointsHistoryDto {
  userId: string;
  action?: GamificationAction;
  masteryCategory?: MasteryCategory;
  fromDate?: string;    // ISO date string
  toDate?: string;      // ISO date string
  page?: number;
  limit?: number;
}

// ─── Leaderboard DTOs ───────────────────────────────────────────────

export interface GetLeaderboardDto {
  period: "week" | "month" | "all";
  page?: number;
  limit?: number;
}

// ─── Challenge DTOs ─────────────────────────────────────────────────

export interface GetChallengesDto {
  type?: ChallengeType;
  activeOnly?: boolean;
}

export interface JoinChallengeDto {
  userId: string;
  challengeId: string;
}

export interface ClaimChallengeDto {
  userId: string;
  challengeId: string;
}

export interface CreateChallengeDto {
  name: string;
  description: string;
  icon: string;
  type: ChallengeType;
  action: GamificationAction;
  targetValue: number;
  xpReward: number;
  startDate: string;    // ISO date string
  endDate: string;      // ISO date string
}
