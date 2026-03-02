import { HttpClient } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types";
import {
  Achievement,
  CreateCommentDto,
  ExploreData,
  ExploreFilters,
  FeedFilters,
  FollowRelation,
  FollowUser,
  NotificationFilters,
  RecipeSocialData,
  SearchUser,
  SearchUsersFilters,
  ShareRecipeDto,
  SharedRecipe,
  SocialComment,
  SocialInsight,
  SocialGamificationSummary,
  SocialNotification,
  SocialPost,
  SocialProfile,
  SocialStats,
  TrendingRecipe,
  UpdatePostDto,
  UserAchievement,
} from "@/types/models/social";

export class SocialService {
  constructor(private httpClient: HttpClient) {}

  // ─── Feed ───────────────────────────────────────────────────────────────
  async getFeed(filters?: FeedFilters): Promise<ApiResponse<SocialPost[]>> {
    return this.httpClient.get<SocialPost[]>("social/feed", {
      queryParams: filters as Record<string, string>,
    });
  }

  // ─── Posts ──────────────────────────────────────────────────────────────
  async createPost(data: FormData): Promise<ApiResponse<SocialPost>> {
    return this.httpClient.post<SocialPost>("social/posts", data, {
      isFormDataType: true,
    });
  }

  async updatePost(postId: string, data: UpdatePostDto): Promise<ApiResponse<SocialPost>> {
    return this.httpClient.put<SocialPost>(`social/posts/${postId}`, data);
  }

  async deletePost(postId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`social/posts/${postId}`);
  }

  async getPost(postId: string): Promise<ApiResponse<SocialPost>> {
    return this.httpClient.get<SocialPost>(`social/posts/${postId}`);
  }

  async getUserPosts(userId: string, page?: string, limit?: string): Promise<ApiResponse<SocialPost[]>> {
    return this.httpClient.get<SocialPost[]>(`social/posts/user/${userId}`, {
      queryParams: { ...(page && { page }), ...(limit && { limit }) },
    });
  }

  // ─── Comments ───────────────────────────────────────────────────────────
  async addComment(postId: string, data: CreateCommentDto): Promise<ApiResponse<SocialComment>> {
    return this.httpClient.post<SocialComment>(`social/posts/${postId}/comments`, data);
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`social/comments/${commentId}`);
  }

  async getComments(postId: string, page?: string, limit?: string): Promise<ApiResponse<SocialComment[]>> {
    return this.httpClient.get<SocialComment[]>(`social/posts/${postId}/comments`, {
      queryParams: { ...(page && { page }), ...(limit && { limit }) },
    });
  }

  // ─── Likes ──────────────────────────────────────────────────────────────
  async likePost(postId: string): Promise<ApiResponse<void>> {
    return this.httpClient.post<void>(`social/posts/${postId}/like`);
  }

  async unlikePost(postId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`social/posts/${postId}/like`);
  }

  async likeComment(commentId: string): Promise<ApiResponse<void>> {
    return this.httpClient.post<void>(`social/comments/${commentId}/like`);
  }

  async unlikeComment(commentId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`social/comments/${commentId}/like`);
  }

  // ─── Follows ────────────────────────────────────────────────────────────
  async followUser(userId: string): Promise<ApiResponse<FollowRelation>> {
    return this.httpClient.post<FollowRelation>(`social/follow/${userId}`);
  }

  async unfollowUser(userId: string): Promise<ApiResponse<void>> {
    return this.httpClient.delete<void>(`social/follow/${userId}`);
  }

  async getFollowers(userId: string, page?: string, limit?: string): Promise<ApiResponse<FollowUser[]>> {
    return this.httpClient.get<FollowUser[]>(`social/followers/${userId}`, {
      queryParams: { ...(page && { page }), ...(limit && { limit }) },
    });
  }

  async getFollowing(userId: string, page?: string, limit?: string): Promise<ApiResponse<FollowUser[]>> {
    return this.httpClient.get<FollowUser[]>(`social/following/${userId}`, {
      queryParams: { ...(page && { page }), ...(limit && { limit }) },
    });
  }

  // ─── Profile & Stats ───────────────────────────────────────────────────
  async getProfile(userId: string): Promise<ApiResponse<SocialProfile>> {
    return this.httpClient.get<SocialProfile>(`social/profile/${userId}`);
  }

  async getStats(userId: string): Promise<ApiResponse<SocialStats>> {
    return this.httpClient.get<SocialStats>(`social/profile/${userId}/stats`);
  }

  async getGamificationSummary(userId: string): Promise<ApiResponse<SocialGamificationSummary>> {
    return this.httpClient.get<SocialGamificationSummary>(`social/profile/${userId}/gamification`);
  }

  async updateBio(bio: string): Promise<ApiResponse<void>> {
    return this.httpClient.put<void>("social/profile/bio", { bio });
  }

  // ─── Achievements ──────────────────────────────────────────────────────
  async getAllAchievements(): Promise<ApiResponse<Achievement[]>> {
    return this.httpClient.get<Achievement[]>("social/achievements");
  }

  async getUserAchievements(userId: string): Promise<ApiResponse<UserAchievement[]>> {
    return this.httpClient.get<UserAchievement[]>(`social/achievements/${userId}`);
  }

  // ─── Notifications ─────────────────────────────────────────────────────
  async getNotifications(filters?: NotificationFilters): Promise<ApiResponse<SocialNotification[]>> {
    return this.httpClient.get<SocialNotification[]>("social/notifications", {
      queryParams: filters as Record<string, string>,
    });
  }

  async markNotificationRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.httpClient.put<void>(`social/notifications/${notificationId}/read`);
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    return this.httpClient.put<void>("social/notifications/read-all");
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.httpClient.get<{ count: number }>("social/notifications/unread-count");
  }

  // ─── Explore & Trending ────────────────────────────────────────────────
  async getExplore(filters?: ExploreFilters): Promise<ApiResponse<ExploreData>> {
    return this.httpClient.get<ExploreData>("social/explore", {
      queryParams: filters as Record<string, string>,
    });
  }

  async getTrendingRecipes(limit?: string, period?: string): Promise<ApiResponse<TrendingRecipe[]>> {
    return this.httpClient.get<TrendingRecipe[]>("social/trending/recipes", {
      queryParams: { ...(limit && { limit }), ...(period && { period }) },
    });
  }

  // ─── Recipe Social Layer ───────────────────────────────────────────────
  async getRecipeSocial(recipeId: string): Promise<ApiResponse<RecipeSocialData>> {
    return this.httpClient.get<RecipeSocialData>(`social/recipe/${recipeId}`);
  }

  // ─── Share ──────────────────────────────────────────────────────────────
  async shareRecipe(data: ShareRecipeDto): Promise<ApiResponse<SharedRecipe>> {
    return this.httpClient.post<SharedRecipe>("social/share", data);
  }

  async getSharedRecipe(token: string): Promise<ApiResponse<SharedRecipe>> {
    return this.httpClient.get<SharedRecipe>(`social/shared/${token}`);
  }

  // ─── Smart Social ──────────────────────────────────────────────────────
  async getInsights(): Promise<ApiResponse<SocialInsight[]>> {
    return this.httpClient.get<SocialInsight[]>("social/insights");
  }

  // ─── Search ─────────────────────────────────────────────────────────────
  async searchUsers(filters: SearchUsersFilters): Promise<ApiResponse<SearchUser[]>> {
    return this.httpClient.get<SearchUser[]>("social/search/users", {
      queryParams: filters as unknown as Record<string, string>,
    });
  }
}
