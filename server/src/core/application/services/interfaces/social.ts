import { PaginationParams } from "../../../../shared/dto/input";
import { PaginatedResponse } from "../../../../shared/dto/response";
import {
  Achievement,
  ExploreData,
  ExploreFilter,
  PostComment,
  PostCommentWithAuthor,
  RecipeSocialData,
  SharedRecipe,
  SocialInsight,
  SocialNotificationWithActor,
  SocialPost,
  SocialPostWithAuthor,
  SocialGamificationSummary,
  SocialProfile,
  TopChef,
  TrendingIngredient,
  TrendingRecipe,
  UserAchievement,
  UserFollow,
  UserStats,
} from "../../../domain/social.model";
import {
  CreateCommentDto,
  CreatePostDto,
  ShareRecipeDto,
  UpdatePostDto,
} from "../../../application/dto/social.dto";

// ─── Social Service Interface ────────────────────────────────────────

export interface SocialService {
  // ── Feed ──────────────────────────────────────────────────────────
  getFeed(
    userId: string,
    followingOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>>;

  // ── Posts ─────────────────────────────────────────────────────────
  createActivityPost(
    userId: string,
    activityType: string,
    metadata: Record<string, any>,
    recipeId?: string,
    options?: { skipGamification?: boolean },
  ): Promise<SocialPost>;
  updatePost(dto: UpdatePostDto): Promise<SocialPost>;
  deletePost(postId: string, userId: string): Promise<void>;
  getPostById(postId: string, currentUserId?: string): Promise<SocialPostWithAuthor>;
  getUserPosts(
    userId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>>;

  // ── Comments ──────────────────────────────────────────────────────
  addComment(dto: CreateCommentDto): Promise<PostComment>;
  updateComment(commentId: string, content: string, userId: string): Promise<PostComment>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  getPostComments(
    postId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<PostCommentWithAuthor>>;

  // ── Likes ─────────────────────────────────────────────────────────
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;
  likeComment(userId: string, commentId: string): Promise<void>;
  unlikeComment(userId: string, commentId: string): Promise<void>;

  // ── Follows ───────────────────────────────────────────────────────
  followUser(followerId: string, followingId: string): Promise<UserFollow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>>;
  getFollowing(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // ── Profile & Stats ───────────────────────────────────────────────
  getUserProfileCore(userId: string): Promise<SocialProfile["user"]>;
  getUserRecentActivity(
    userId: string,
    currentUserId?: string,
  ): Promise<SocialPostWithAuthor[]>;
  getUserGamificationSummary(userId: string): Promise<SocialGamificationSummary>;
  getUserStats(userId: string): Promise<UserStats>;
  updateUserBio(userId: string, bio: string): Promise<void>;

  // ── Achievements ──────────────────────────────────────────────────
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]>;

  // ── Notifications ─────────────────────────────────────────────────
  getNotifications(
    userId: string,
    unreadOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialNotificationWithActor>>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // ── Explore & Trending ────────────────────────────────────────────
  getTrendingRecipes(filter: ExploreFilter): Promise<TrendingRecipe[]>;
  getTrendingIngredients(filter: ExploreFilter): Promise<TrendingIngredient[]>;
  getTopChefs(limit?: number): Promise<TopChef[]>;
  getExploreData(filter: ExploreFilter): Promise<ExploreData>;

  // ── Recipe Social Layer ───────────────────────────────────────────
  getRecipeSocialData(recipeId: string, currentUserId?: string): Promise<RecipeSocialData>;

  // ── Share ─────────────────────────────────────────────────────────
  shareRecipe(dto: ShareRecipeDto): Promise<SharedRecipe>;
  getSharedRecipeByToken(token: string): Promise<SharedRecipe>;

  // ── Smart Social (Inteligencia Social) ────────────────────────────
  getSocialInsights(userId: string): Promise<SocialInsight[]>;

  // ── Search ────────────────────────────────────────────────────────
  searchUsers(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null; level: string }>>;
}

// ─── Social Facade Interface ─────────────────────────────────────────

export interface SocialFacade {
  // ── Feed ──────────────────────────────────────────────────────────
  getFeed(
    userId: string,
    followingOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>>;

  // ── Posts ─────────────────────────────────────────────────────────
  createPost(dto: CreatePostDto): Promise<SocialPost>;
  updatePost(dto: UpdatePostDto): Promise<SocialPost>;
  deletePost(postId: string, userId: string): Promise<void>;
  getPostById(postId: string, currentUserId?: string): Promise<SocialPostWithAuthor>;
  getUserPosts(
    userId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>>;

  // ── Comments ──────────────────────────────────────────────────────
  addComment(dto: CreateCommentDto): Promise<PostComment>;
  deleteComment(commentId: string, userId: string): Promise<void>;
  getPostComments(
    postId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<PostCommentWithAuthor>>;

  // ── Likes ─────────────────────────────────────────────────────────
  likePost(userId: string, postId: string): Promise<void>;
  unlikePost(userId: string, postId: string): Promise<void>;
  likeComment(userId: string, commentId: string): Promise<void>;
  unlikeComment(userId: string, commentId: string): Promise<void>;

  // ── Follows ───────────────────────────────────────────────────────
  followUser(followerId: string, followingId: string): Promise<UserFollow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>>;
  getFollowing(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>>;

  // ── Profile & Stats ───────────────────────────────────────────────
  getUserProfile(userId: string, currentUserId?: string): Promise<SocialProfile>;
  getUserGamificationSummary(userId: string): Promise<SocialGamificationSummary>;
  getUserStats(userId: string): Promise<UserStats>;
  updateUserBio(userId: string, bio: string): Promise<void>;

  // ── Achievements ──────────────────────────────────────────────────
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;

  // ── Notifications ─────────────────────────────────────────────────
  getNotifications(
    userId: string,
    unreadOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialNotificationWithActor>>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // ── Explore & Trending ────────────────────────────────────────────
  getExploreData(filter: ExploreFilter): Promise<ExploreData>;
  getTrendingRecipes(filter: ExploreFilter): Promise<TrendingRecipe[]>;

  // ── Recipe Social Layer ───────────────────────────────────────────
  getRecipeSocialData(recipeId: string, currentUserId?: string): Promise<RecipeSocialData>;

  // ── Share ─────────────────────────────────────────────────────────
  shareRecipe(dto: ShareRecipeDto): Promise<SharedRecipe>;
  getSharedRecipeByToken(token: string): Promise<SharedRecipe>;

  // ── Smart Social ──────────────────────────────────────────────────
  getSocialInsights(userId: string): Promise<SocialInsight[]>;

  // ── Search ────────────────────────────────────────────────────────
  searchUsers(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null; level: string }>>;
}
