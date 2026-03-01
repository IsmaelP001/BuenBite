import { HttpClient } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types";
import {
  Challenge,
  ChallengeFilters,
  EmitGamificationEventDto,
  GamificationAlert,
  GamificationProfile,
  GamificationSummary,
  GamificationMilestone,
  LeaderboardFilters,
  PointsHistoryFilters,
  PointsLog,
  UserChallenge,
  UserMasteryProgress,
  UserMilestone,
  UserStreak,
  WeeklyChefTitle,
  WeeklyRanking,
} from "@/types/models/gamification";

export class GamificationService {
  constructor(private httpClient: HttpClient) {}

  // ─── Profile ────────────────────────────────────────────────────────────
  async getMyProfile(): Promise<ApiResponse<GamificationProfile>> {
    return this.httpClient.get<GamificationProfile>("gamification/profile");
  }

  async getUserProfile(userId: string): Promise<ApiResponse<GamificationProfile>> {
    return this.httpClient.get<GamificationProfile>(`gamification/profile/${userId}`);
  }

  // ─── Summary (lightweight) ───────────────────────────────────────────
  async getMySummary(): Promise<ApiResponse<GamificationSummary>> {
    return this.httpClient.get<GamificationSummary>("gamification/summary");
  }

  async getUserSummary(userId: string): Promise<ApiResponse<GamificationSummary>> {
    return this.httpClient.get<GamificationSummary>(`gamification/summary/${userId}`);
  }

  // ─── Points History ─────────────────────────────────────────────────────
  async getPointsHistory(filters?: PointsHistoryFilters): Promise<ApiResponse<PointsLog[]>> {
    return this.httpClient.get<PointsLog[]>("gamification/points/history", {
      queryParams: filters as Record<string, string>,
    });
  }

  // ─── Events ─────────────────────────────────────────────────────────────
  async emitEvent(data: EmitGamificationEventDto): Promise<ApiResponse<void>> {
    return this.httpClient.post<void>("gamification/events", data);
  }

  // ─── Streaks ────────────────────────────────────────────────────────────
  async getMyStreaks(): Promise<ApiResponse<UserStreak[]>> {
    return this.httpClient.get<UserStreak[]>("gamification/streaks");
  }

  async getUserStreaks(userId: string): Promise<ApiResponse<UserStreak[]>> {
    return this.httpClient.get<UserStreak[]>(`gamification/streaks/${userId}`);
  }

  // ─── Milestones ─────────────────────────────────────────────────────────
  async getAllMilestones(): Promise<ApiResponse<GamificationMilestone[]>> {
    return this.httpClient.get<GamificationMilestone[]>("gamification/milestones");
  }

  async getMyMilestones(): Promise<ApiResponse<UserMilestone[]>> {
    return this.httpClient.get<UserMilestone[]>("gamification/milestones/user");
  }

  async getUserMilestones(userId: string): Promise<ApiResponse<UserMilestone[]>> {
    return this.httpClient.get<UserMilestone[]>(`gamification/milestones/user/${userId}`);
  }

  // ─── Mastery ────────────────────────────────────────────────────────────
  async getMyMasteries(): Promise<ApiResponse<UserMasteryProgress[]>> {
    return this.httpClient.get<UserMasteryProgress[]>("gamification/mastery");
  }

  async getUserMasteries(userId: string): Promise<ApiResponse<UserMasteryProgress[]>> {
    return this.httpClient.get<UserMasteryProgress[]>(`gamification/mastery/${userId}`);
  }

  // ─── Weekly Titles ──────────────────────────────────────────────────────
  async getMyWeeklyTitle(): Promise<ApiResponse<WeeklyChefTitle | null>> {
    return this.httpClient.get<WeeklyChefTitle | null>("gamification/weekly-title");
  }

  async getMyWeeklyTitleHistory(limit?: string): Promise<ApiResponse<WeeklyChefTitle[]>> {
    return this.httpClient.get<WeeklyChefTitle[]>("gamification/weekly-title/history", {
      queryParams: { ...(limit && { limit }) },
    });
  }

  // ─── Leaderboard ────────────────────────────────────────────────────────
  async getLeaderboard(filters?: LeaderboardFilters): Promise<ApiResponse<WeeklyRanking[]>> {
    return this.httpClient.get<WeeklyRanking[]>("gamification/leaderboard", {
      queryParams: filters as Record<string, string>,
    });
  }

  // ─── Challenges ─────────────────────────────────────────────────────────
  async getActiveChallenges(filters?: ChallengeFilters): Promise<ApiResponse<Challenge[]>> {
    return this.httpClient.get<Challenge[]>("gamification/challenges", {
      queryParams: filters as Record<string, string>,
    });
  }

  async getMyChallenges(activeOnly?: string): Promise<ApiResponse<UserChallenge[]>> {
    return this.httpClient.get<UserChallenge[]>("gamification/challenges/user", {
      queryParams: { ...(activeOnly && { activeOnly }) },
    });
  }

  async joinChallenge(challengeId: string): Promise<ApiResponse<UserChallenge>> {
    return this.httpClient.post<UserChallenge>(`gamification/challenges/${challengeId}/join`);
  }

  async claimChallengeReward(challengeId: string): Promise<ApiResponse<UserChallenge>> {
    return this.httpClient.post<UserChallenge>(`gamification/challenges/${challengeId}/claim`);
  }

  // ─── Alerts ─────────────────────────────────────────────────────────────
  async getMyAlerts(): Promise<ApiResponse<GamificationAlert[]>> {
    return this.httpClient.get<GamificationAlert[]>("gamification/alerts");
  }

  async dismissAlert(alertId: string): Promise<ApiResponse<{ success: true }>> {
    return this.httpClient.delete<{ success: true }>(`gamification/alerts/${alertId}`);
  }

  async dismissAllAlerts(): Promise<ApiResponse<{ success: true }>> {
    return this.httpClient.delete<{ success: true }>("gamification/alerts");
  }
}
