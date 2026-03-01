import { Inject, Injectable } from "@nestjs/common";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
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
  TrendingRecipe,
  UserAchievement,
  UserFollow,
  UserStats,
} from "../../domain/social.model";
import {
  CreateCommentDto,
  CreatePostDto,
  ShareRecipeDto,
  UpdatePostDto,
} from "../dto/social.dto";
import { SocialFacade, SocialService } from "../services/interfaces/social";
import { CreatePostUseCase } from "../use-cases/social/create-post.use-case";

@Injectable()
export class SocialFacadeImpl implements SocialFacade {
  constructor(
    @Inject("SocialService")
    private readonly socialService: SocialService,
    private readonly createPostUseCase: CreatePostUseCase,
  ) {}

  // ── Feed ──────────────────────────────────────────────────────────

  getFeed(
    userId: string,
    followingOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>> {
    return this.socialService.getFeed(userId, followingOnly, pagination);
  }

  // ── Posts ─────────────────────────────────────────────────────────

  createPost(dto: CreatePostDto): Promise<SocialPost> {
    return this.createPostUseCase.execute(dto);
  }

  updatePost(dto: UpdatePostDto): Promise<SocialPost> {
    return this.socialService.updatePost(dto);
  }

  deletePost(postId: string, userId: string): Promise<void> {
    return this.socialService.deletePost(postId, userId);
  }

  getPostById(
    postId: string,
    currentUserId?: string,
  ): Promise<SocialPostWithAuthor> {
    return this.socialService.getPostById(postId, currentUserId);
  }

  getUserPosts(
    userId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>> {
    return this.socialService.getUserPosts(userId, pagination, currentUserId);
  }

  // ── Comments ──────────────────────────────────────────────────────

  addComment(dto: CreateCommentDto): Promise<PostComment> {
    return this.socialService.addComment(dto);
  }

  deleteComment(commentId: string, userId: string): Promise<void> {
    return this.socialService.deleteComment(commentId, userId);
  }

  getPostComments(
    postId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<PostCommentWithAuthor>> {
    return this.socialService.getPostComments(
      postId,
      pagination,
      currentUserId,
    );
  }

  // ── Likes ─────────────────────────────────────────────────────────

  likePost(userId: string, postId: string): Promise<void> {
    return this.socialService.likePost(userId, postId);
  }

  unlikePost(userId: string, postId: string): Promise<void> {
    return this.socialService.unlikePost(userId, postId);
  }

  likeComment(userId: string, commentId: string): Promise<void> {
    return this.socialService.likeComment(userId, commentId);
  }

  unlikeComment(userId: string, commentId: string): Promise<void> {
    return this.socialService.unlikeComment(userId, commentId);
  }

  // ── Follows ───────────────────────────────────────────────────────

  followUser(followerId: string, followingId: string): Promise<UserFollow> {
    return this.socialService.followUser(followerId, followingId);
  }

  unfollowUser(followerId: string, followingId: string): Promise<void> {
    return this.socialService.unfollowUser(followerId, followingId);
  }

  getFollowers(
    userId: string,
    pagination: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      userId: string;
      fullName: string;
      avatarUrl: string | null;
    }>
  > {
    return this.socialService.getFollowers(userId, pagination);
  }

  getFollowing(
    userId: string,
    pagination: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      userId: string;
      fullName: string;
      avatarUrl: string | null;
    }>
  > {
    return this.socialService.getFollowing(userId, pagination);
  }

  // ── Profile & Stats ───────────────────────────────────────────────

  getUserProfile(
    userId: string,
    currentUserId?: string,
  ): Promise<SocialProfile> {
    return Promise.all([
      this.socialService.getUserProfileCore(userId),
      this.socialService.getUserStats(userId),
      this.socialService.getUserAchievements(userId),
      this.socialService.getUserRecentActivity(userId, currentUserId),
      currentUserId && currentUserId !== userId
        ? this.socialService.isFollowing(currentUserId, userId)
        : Promise.resolve(false),
    ]).then(
      ([
        user,
        stats,
        achievements,
        recentActivity,
        isFollowedByCurrentUser,
      ]) => ({
        user,
        stats,
        achievements,
        isFollowedByCurrentUser,
        recentActivity,
      }),
    );
  }

  getUserGamificationSummary(
    userId: string,
  ): Promise<SocialGamificationSummary> {
    return this.socialService.getUserGamificationSummary(userId);
  }

  getUserStats(userId: string): Promise<UserStats> {
    return this.socialService.getUserStats(userId);
  }

  updateUserBio(userId: string, bio: string): Promise<void> {
    return this.socialService.updateUserBio(userId, bio);
  }

  // ── Achievements ──────────────────────────────────────────────────

  getAchievements(): Promise<Achievement[]> {
    return this.socialService.getAchievements();
  }

  getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.socialService.getUserAchievements(userId);
  }

  // ── Notifications ─────────────────────────────────────────────────

  getNotifications(
    userId: string,
    unreadOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialNotificationWithActor>> {
    return this.socialService.getNotifications(userId, unreadOnly, pagination);
  }

  markNotificationAsRead(notificationId: string): Promise<void> {
    return this.socialService.markNotificationAsRead(notificationId);
  }

  markAllNotificationsAsRead(userId: string): Promise<void> {
    return this.socialService.markAllNotificationsAsRead(userId);
  }

  getUnreadNotificationCount(userId: string): Promise<number> {
    return this.socialService.getUnreadNotificationCount(userId);
  }

  // ── Explore & Trending ────────────────────────────────────────────

  getExploreData(filter: ExploreFilter): Promise<ExploreData> {
    return this.socialService.getExploreData(filter);
  }

  getTrendingRecipes(filter: ExploreFilter): Promise<TrendingRecipe[]> {
    return this.socialService.getTrendingRecipes(filter);
  }

  // ── Recipe Social Layer ───────────────────────────────────────────

  getRecipeSocialData(
    recipeId: string,
    currentUserId?: string,
  ): Promise<RecipeSocialData> {
    return this.socialService.getRecipeSocialData(recipeId, currentUserId);
  }

  // ── Share ─────────────────────────────────────────────────────────

  shareRecipe(dto: ShareRecipeDto): Promise<SharedRecipe> {
    return this.socialService.shareRecipe(dto);
  }

  getSharedRecipeByToken(token: string): Promise<SharedRecipe> {
    return this.socialService.getSharedRecipeByToken(token);
  }

  // ── Smart Social ──────────────────────────────────────────────────

  getSocialInsights(userId: string): Promise<SocialInsight[]> {
    return this.socialService.getSocialInsights(userId);
  }

  // ── Search ────────────────────────────────────────────────────────

  searchUsers(
    query: string,
    pagination: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      userId: string;
      fullName: string;
      avatarUrl: string | null;
      level: string;
    }>
  > {
    return this.socialService.searchUsers(query, pagination);
  }
}
