"use server";
import { ApiClient } from "@/services/apiClient";
import {
  CreateCommentDto,
  ExploreFilters,
  FeedFilters,
  NotificationFilters,
  SearchUsersFilters,
  ShareRecipeDto,
  UpdatePostDto,
} from "@/types/models/social";

const apiClient = new ApiClient();

// ─── Feed ─────────────────────────────────────────────────────────────────────
export async function getSocialFeed(filters?: FeedFilters) {
  return apiClient.socialService.getFeed(filters);
}

// ─── Posts ─────────────────────────────────────────────────────────────────────
export async function createSocialPost(data: FormData) {
  return apiClient.socialService.createPost(data);
}

export async function updateSocialPost(postId: string, data: UpdatePostDto) {
  return apiClient.socialService.updatePost(postId, data);
}

export async function deleteSocialPost(postId: string) {
  return apiClient.socialService.deletePost(postId);
}

export async function getSocialPost(postId: string) {
  return apiClient.socialService.getPost(postId);
}

export async function getUserSocialPosts(userId: string, page?: string, limit?: string) {
  return apiClient.socialService.getUserPosts(userId, page, limit);
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export async function addSocialComment(postId: string, data: CreateCommentDto) {
  return apiClient.socialService.addComment(postId, data);
}

export async function deleteSocialComment(commentId: string) {
  return apiClient.socialService.deleteComment(commentId);
}

export async function getSocialComments(postId: string, page?: string, limit?: string) {
  return apiClient.socialService.getComments(postId, page, limit);
}

// ─── Likes ────────────────────────────────────────────────────────────────────
export async function likeSocialPost(postId: string) {
  return apiClient.socialService.likePost(postId);
}

export async function unlikeSocialPost(postId: string) {
  return apiClient.socialService.unlikePost(postId);
}

export async function likeSocialComment(commentId: string) {
  return apiClient.socialService.likeComment(commentId);
}

export async function unlikeSocialComment(commentId: string) {
  return apiClient.socialService.unlikeComment(commentId);
}

// ─── Follows ──────────────────────────────────────────────────────────────────
export async function followSocialUser(userId: string) {
  return apiClient.socialService.followUser(userId);
}

export async function unfollowSocialUser(userId: string) {
  return apiClient.socialService.unfollowUser(userId);
}

export async function getSocialFollowers(userId: string, page?: string, limit?: string) {
  return apiClient.socialService.getFollowers(userId, page, limit);
}

export async function getSocialFollowing(userId: string, page?: string, limit?: string) {
  return apiClient.socialService.getFollowing(userId, page, limit);
}

// ─── Profile & Stats ─────────────────────────────────────────────────────────
export async function getSocialProfile(userId: string) {
  return apiClient.socialService.getProfile(userId);
}

export async function getSocialStats(userId: string) {
  return apiClient.socialService.getStats(userId);
}

export async function updateSocialBio(bio: string) {
  return apiClient.socialService.updateBio(bio);
}

// ─── Achievements ─────────────────────────────────────────────────────────────
export async function getAllAchievements() {
  return apiClient.socialService.getAllAchievements();
}

export async function getUserAchievements(userId: string) {
  return apiClient.socialService.getUserAchievements(userId);
}

// ─── Notifications ────────────────────────────────────────────────────────────
export async function getSocialNotifications(filters?: NotificationFilters) {
  return apiClient.socialService.getNotifications(filters);
}

export async function markNotificationRead(notificationId: string) {
  return apiClient.socialService.markNotificationRead(notificationId);
}

export async function markAllNotificationsRead() {
  return apiClient.socialService.markAllNotificationsRead();
}

export async function getUnreadNotificationsCount() {
  return apiClient.socialService.getUnreadCount();
}

// ─── Explore & Trending ──────────────────────────────────────────────────────
export async function getSocialExplore(filters?: ExploreFilters) {
  return apiClient.socialService.getExplore(filters);
}

export async function getSocialTrendingRecipes(limit?: string, period?: string) {
  return apiClient.socialService.getTrendingRecipes(limit, period);
}

// ─── Recipe Social Layer ─────────────────────────────────────────────────────
export async function getRecipeSocialData(recipeId: string) {
  return apiClient.socialService.getRecipeSocial(recipeId);
}

// ─── Share ────────────────────────────────────────────────────────────────────
export async function shareSocialRecipe(data: ShareRecipeDto) {
  return apiClient.socialService.shareRecipe(data);
}

export async function getSharedRecipe(token: string) {
  return apiClient.socialService.getSharedRecipe(token);
}

// ─── Smart Social ─────────────────────────────────────────────────────────────
export async function getSocialInsights() {
  return apiClient.socialService.getInsights();
}

// ─── Search ───────────────────────────────────────────────────────────────────
export async function searchSocialUsers(filters: SearchUsersFilters) {
  return apiClient.socialService.searchUsers(filters);
}
