"use client";
import {
  getGamificationProfile,
  getGamificationUserProfile,
  getGamificationSummary,
  getGamificationUserSummary,
  getMyStreaks,
  getUserStreaks,
  getMyMasteries,
  getUserMasteries,
  getMyMilestones,
  getUserMilestones,
  getAllMilestones,
  getMyWeeklyTitle,
  getMyWeeklyTitleHistory,
  getPointsHistory,
  getLeaderboard,
  getActiveChallenges,
  getMyChallenges,
  joinChallenge,
  claimChallengeReward,
  getGamificationAlerts,
  dismissGamificationAlert,
  dismissAllGamificationAlerts,
  emitGamificationEvent,
} from "@/actions/gamification";
import { useAppMutation } from "@/hooks/useAppMutation";
import {
  EmitGamificationEventDto,
  LeaderboardFilters,
  PointsHistoryFilters,
  ChallengeFilters,
} from "@/types/models/gamification";
import { useQuery } from "@tanstack/react-query";

// ─── Profile ──────────────────────────────────────────────────────────────────

export function useGamificationProfile(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "profile"],
    queryFn: async () => getGamificationProfile(),
    enabled,
    select: (data) => data.data,
  });
}

export function useGamificationUserProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["gamification", "profile", userId],
    queryFn: async () => getGamificationUserProfile(userId),
    enabled,
    select: (data) => data.data,
  });
}

// ─── Summary (lightweight) ────────────────────────────────────────────────

export function useGamificationSummary(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "summary"],
    queryFn: async () => getGamificationSummary(),
    enabled,
    select: (data) => data.data,
  });
}

export function useGamificationUserSummary(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["gamification", "summary", userId],
    queryFn: async () => getGamificationUserSummary(userId),
    enabled,
    select: (data) => data.data,
  });
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export function useMyStreaks(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "streaks"],
    queryFn: async () => getMyStreaks(),
    enabled,
    select: (data) => data.data,
  });
}

export function useUserStreaks(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["gamification", "streaks", userId],
    queryFn: async () => getUserStreaks(userId),
    enabled,
    select: (data) => data.data,
  });
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function useAllMilestones(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "milestones"],
    queryFn: async () => getAllMilestones(),
    enabled,
    select: (data) => data.data,
  });
}

export function useMyMilestones(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "milestones", "user"],
    queryFn: async () => getMyMilestones(),
    enabled,
    select: (data) => data.data,
  });
}

export function useUserMilestones(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["gamification", "milestones", "user", userId],
    queryFn: async () => getUserMilestones(userId),
    enabled,
    select: (data) => data.data,
  });
}

// ─── Mastery ──────────────────────────────────────────────────────────────────

export function useMyMasteries(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "mastery"],
    queryFn: async () => getMyMasteries(),
    enabled,
    select: (data) => data.data,
  });
}

export function useUserMasteries(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["gamification", "mastery", userId],
    queryFn: async () => getUserMasteries(userId),
    enabled,
    select: (data) => data.data,
  });
}

// ─── Weekly Titles ────────────────────────────────────────────────────────────

export function useMyWeeklyTitle(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "weekly-title"],
    queryFn: async () => getMyWeeklyTitle(),
    enabled,
    select: (data) => data.data,
  });
}

export function useMyWeeklyTitleHistory(limit?: string) {
  return useQuery({
    queryKey: ["gamification", "weekly-title", "history", limit],
    queryFn: async () => getMyWeeklyTitleHistory(limit),
    select: (data) => data.data,
  });
}

// ─── Points History ───────────────────────────────────────────────────────────

export function usePointsHistory(filters?: PointsHistoryFilters) {
  return useQuery({
    queryKey: ["gamification", "points", "history", filters],
    queryFn: async () => getPointsHistory(filters),
    select: (data) => data.data,
  });
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function useLeaderboard(filters?: LeaderboardFilters) {
  return useQuery({
    queryKey: ["gamification", "leaderboard", filters],
    queryFn: async () => getLeaderboard(filters),
    select: (data) => data.data,
  });
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export function useActiveChallenges(filters?: ChallengeFilters) {
  return useQuery({
    queryKey: ["gamification", "challenges", filters],
    queryFn: async () => getActiveChallenges(filters),
    select: (data) => data.data,
  });
}

export function useMyChallenges(activeOnly?: string) {
  return useQuery({
    queryKey: ["gamification", "challenges", "user", activeOnly],
    queryFn: async () => getMyChallenges(activeOnly),
    select: (data) => data.data,
  });
}

export function useJoinChallenge() {
  return useAppMutation(
    async (challengeId: string) => joinChallenge(challengeId),
    {
      invalidateQueries: ["gamification"],
      toastConfig: {
        success: "¡Te uniste al reto!",
        error: "Error al unirte al reto",
      },
    }
  );
}

export function useClaimChallengeReward() {
  return useAppMutation(
    async (challengeId: string) => claimChallengeReward(challengeId),
    {
      invalidateQueries: ["gamification"],
      toastConfig: {
        success: "¡Recompensa reclamada!",
        error: "Error al reclamar la recompensa",
      },
    }
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export function useGamificationAlerts(enabled = true) {
  return useQuery({
    queryKey: ["gamification", "alerts"],
    queryFn: async () => getGamificationAlerts(),
    enabled,
    select: (data) => data.data,
    refetchInterval: 60000,
  });
}

export function useDismissAlert() {
  return useAppMutation(
    async (alertId: string) => dismissGamificationAlert(alertId),
    {
      invalidateQueries: ["gamification", "alerts"],
      toastConfig: {
        error: "No se pudo descartar la alerta",
      },
      toastVisibility: { showSuccess: false, showLoading: false, showError: true },
    }
  );
}

export function useDismissAllAlerts() {
  return useAppMutation(
    async () => dismissAllGamificationAlerts(),
    {
      invalidateQueries: ["gamification", "alerts"],
      toastConfig: { success: "Alertas descartadas" },
    }
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────

export function useEmitGamificationEvent() {
  return useAppMutation(
    async (data: EmitGamificationEventDto) => emitGamificationEvent(data),
    {
      invalidateQueries: ["gamification"],
      toastConfig: {
        error: "No se pudo registrar el evento de gamificación",
      },
      toastVisibility: { showSuccess: false, showLoading: false, showError: true },
    }
  );
}
