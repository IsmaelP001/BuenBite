"use server";
import { ApiClient } from "@/services/apiClient";
import {
  EmitGamificationEventDto,
  PointsHistoryFilters,
  LeaderboardFilters,
  ChallengeFilters,
} from "@/types/models/gamification";

const apiClient = new ApiClient();

// ─── Profile ──────────────────────────────────────────────────────────────────
export async function getGamificationProfile() {
  return apiClient.gamificationService.getMyProfile();
}

export async function getGamificationUserProfile(userId: string) {
  return apiClient.gamificationService.getUserProfile(userId);
}

// ─── Summary (lightweight) ────────────────────────────────────────────────
export async function getGamificationSummary() {
  return apiClient.gamificationService.getMySummary();
}

export async function getGamificationUserSummary(userId: string) {
  return apiClient.gamificationService.getUserSummary(userId);
}

// ─── Points ───────────────────────────────────────────────────────────────────
export async function getPointsHistory(filters?: PointsHistoryFilters) {
  return apiClient.gamificationService.getPointsHistory(filters);
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function emitGamificationEvent(data: EmitGamificationEventDto) {
  return apiClient.gamificationService.emitEvent(data);
}

// ─── Streaks ──────────────────────────────────────────────────────────────────
export async function getMyStreaks() {
  return apiClient.gamificationService.getMyStreaks();
}

export async function getUserStreaks(userId: string) {
  return apiClient.gamificationService.getUserStreaks(userId);
}

// ─── Milestones ───────────────────────────────────────────────────────────────
export async function getAllMilestones() {
  return apiClient.gamificationService.getAllMilestones();
}

export async function getMyMilestones() {
  return apiClient.gamificationService.getMyMilestones();
}

export async function getUserMilestones(userId: string) {
  return apiClient.gamificationService.getUserMilestones(userId);
}

// ─── Mastery ──────────────────────────────────────────────────────────────────
export async function getMyMasteries() {
  return apiClient.gamificationService.getMyMasteries();
}

export async function getUserMasteries(userId: string) {
  return apiClient.gamificationService.getUserMasteries(userId);
}

// ─── Weekly Titles ────────────────────────────────────────────────────────────
export async function getMyWeeklyTitle() {
  return apiClient.gamificationService.getMyWeeklyTitle();
}

export async function getMyWeeklyTitleHistory(limit?: string) {
  return apiClient.gamificationService.getMyWeeklyTitleHistory(limit);
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
export async function getLeaderboard(filters?: LeaderboardFilters) {
  return apiClient.gamificationService.getLeaderboard(filters);
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export async function getActiveChallenges(filters?: ChallengeFilters) {
  return apiClient.gamificationService.getActiveChallenges(filters);
}

export async function getMyChallenges(activeOnly?: string) {
  return apiClient.gamificationService.getMyChallenges(activeOnly);
}

export async function joinChallenge(challengeId: string) {
  return apiClient.gamificationService.joinChallenge(challengeId);
}

export async function claimChallengeReward(challengeId: string) {
  return apiClient.gamificationService.claimChallengeReward(challengeId);
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
export async function getGamificationAlerts() {
  return apiClient.gamificationService.getMyAlerts();
}

export async function dismissGamificationAlert(alertId: string) {
  return apiClient.gamificationService.dismissAlert(alertId);
}

export async function dismissAllGamificationAlerts() {
  return apiClient.gamificationService.dismissAllAlerts();
}
