import { Inject, Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError, ValidationError } from "../../../errors/customErrors";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { SocialRepository } from "../../domain/repositories";
import {
  Achievement,
  ActivityType,
  ExploreData,
  ExploreFilter,
  NotificationType,
  PostComment,
  PostCommentWithAuthor,
  PostType,
  RecipeSocialData,
  SharedRecipe,
  SocialInsight,
  SocialNotification,
  SocialNotificationWithActor,
  SocialPost,
  SocialPostWithAuthor,
  SocialGamificationSummary,
  TopChef,
  TrendingIngredient,
  TrendingRecipe,
  UserAchievement,
  UserFollow,
  UserLevel,
  UserStats,
} from "../../domain/social.model";
import {
  CreateCommentDto,
  CreatePostDto,
  ShareRecipeDto,
  UpdatePostDto,
} from "../dto/social.dto";
import { RedisCacheService } from "./redis-cache.service";
import { SocialService } from "./interfaces/social";
import {
  SOCIAL_QUEUE,
  SocialJobType,
  SocialJobPayload,
} from "./social-processor";
import { CreatePostUseCase } from "../use-cases/social/create-post.use-case";

@Injectable()
export class SocialServiceImpl implements SocialService {
  private readonly logger = new Logger(SocialServiceImpl.name);

  constructor(
    @Inject("SocialRepository")
    private readonly socialRepository: SocialRepository,
    @InjectQueue(SOCIAL_QUEUE)
    private readonly socialQueue: Queue<SocialJobPayload>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  // ══════════════════════════════════════════════════════════════════
  // ── Feed ──────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getFeed(
    userId: string,
    followingOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.FEED(userId, followingOnly, pagination),
      CacheKeys.SOCIAL.FEED_PREFIX,
      () =>
        this.socialRepository.getFeed({ userId, followingOnly }, pagination),
      CacheTTL.VERY_SHORT,
    );
  }

  async createActivityPost(
    userId: string,
    activityType: string,
    metadata: Record<string, any>,
    recipeId?: string,
    options?: { skipGamification?: boolean },
  ): Promise<SocialPost> {
    // Create a minimal post synchronously for immediate response
    const post: SocialPost = {
      id: uuidv4(),
      userId,
      postType: PostType.ACTIVITY,
      activityType: activityType as ActivityType,
      content: null, // Will be built by processor
      image: null,
      recipeId: recipeId ?? null,
      metadata,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Emit to social queue: handles post creation, notifications, gamification points
    await this.emitSocialJob(SocialJobType.CREATE_ACTIVITY_POST, {
      userId,
      activityType: activityType as ActivityType,
      metadata,
      recipeId,
      skipGamification: options?.skipGamification ?? false,
    });

    return post;
  }

  async updatePost(dto: UpdatePostDto): Promise<SocialPost> {
    const existing = await this.socialRepository.getPostById(dto.id);
    if (!existing) throw new NotFoundError("Post no encontrado");
    if (existing.userId !== dto.userId)
      throw new ValidationError("No tienes permiso para editar este post");

    const updated = await this.socialRepository.updatePost({
      id: dto.id,
      content: dto.content,
      image: typeof dto.image === "string" ? dto.image : undefined,
      isPublic: dto.isPublic,
      updatedAt: new Date(),
    });

    await this.invalidateFeedCaches(dto.userId);
    return updated;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const existing = await this.socialRepository.getPostById(postId);
    if (!existing) throw new NotFoundError("Post no encontrado");
    if (existing.userId !== userId)
      throw new ValidationError("No tienes permiso para eliminar este post");

    await this.socialRepository.deletePost(postId);
    await this.invalidateFeedCaches(userId);
    await this.invalidateUserStatsCaches(userId, {
      postsCount: true,
    });
  }

  async getPostById(
    postId: string,
    currentUserId?: string,
  ): Promise<SocialPostWithAuthor> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.POST_BY_ID(postId, currentUserId),
      CacheKeys.SOCIAL.POSTS_PREFIX,
      async () => {
        const post = await this.socialRepository.getPostById(postId);
        if (!post) throw new NotFoundError("Post no encontrado");

        // Enrich: recipe, isLikedByCurrentUser, author level
        const enriched = await this.enrichPostWithAuthor(post, currentUserId);
        return enriched;
      },
      CacheTTL.SHORT,
    );
  }

  async getUserPosts(
    userId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.USER_POSTS(userId, pagination),
      CacheKeys.SOCIAL.POSTS_PREFIX,
      async () => {
        const result = await this.socialRepository.getUserPosts(
          userId,
          pagination,
        );
        const enrichedItems = await this.enrichPostsWithAuthors(
          result.items,
          currentUserId,
        );
        return { ...result, items: enrichedItems };
      },
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Comments ──────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async addComment(dto: CreateCommentDto): Promise<PostComment> {
    const comment: PostComment = {
      id: uuidv4(),
      postId: dto.postId,
      userId: dto.userId,
      parentCommentId: dto.parentCommentId ?? null,
      content: dto.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const created = await this.socialRepository.createComment(comment);

    // Queue: notifications + gamification points
    await this.emitSocialJob(SocialJobType.PROCESS_COMMENT, {
      userId: dto.userId,
      postId: dto.postId,
      commentId: created.id,
      content: dto.content,
      parentCommentId: dto.parentCommentId,
    });

    return created;
  }

  async updateComment(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<PostComment> {
    return this.socialRepository.updateComment({
      id: commentId,
      content,
      updatedAt: new Date(),
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    await this.socialRepository.deleteComment(commentId);
    await this.redisCacheService.invalidatePrefix(
      CacheKeys.SOCIAL.COMMENTS_PREFIX,
    );
  }

  async getPostComments(
    postId: string,
    pagination: PaginationParams,
    currentUserId?: string,
  ): Promise<PaginatedResponse<PostCommentWithAuthor>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.POST_COMMENTS(postId, pagination),
      CacheKeys.SOCIAL.COMMENTS_PREFIX,
      () =>
        this.socialRepository.getPostComments(
          { postId, limit: pagination.limit, page: pagination.page },
          currentUserId,
        ),
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Likes ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async likePost(userId: string, postId: string): Promise<void> {
    // Queue: DB write + notification + gamification points
    await this.emitSocialJob(SocialJobType.PROCESS_LIKE_POST, {
      userId,
      postId,
    });
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await this.emitSocialJob(SocialJobType.PROCESS_UNLIKE_POST, {
      userId,
      postId,
    });
  }

  async likeComment(userId: string, commentId: string): Promise<void> {
    // Queue: DB write + gamification points
    await this.emitSocialJob(SocialJobType.PROCESS_LIKE_COMMENT, {
      userId,
      commentId,
    });
  }

  async unlikeComment(userId: string, commentId: string): Promise<void> {
    await this.emitSocialJob(SocialJobType.PROCESS_UNLIKE_COMMENT, {
      userId,
      commentId,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Follows ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async followUser(
    followerId: string,
    followingId: string,
  ): Promise<UserFollow> {
    if (followerId === followingId) {
      throw new ValidationError("No puedes seguirte a ti mismo");
    }

    const follow = await this.socialRepository.followUser({
      id: uuidv4(),
      followerId,
      followingId,
      createdAt: new Date(),
    });

    if (follow) {
      await this.redisCacheService.invalidatePrefix(CacheKeys.SOCIAL.FOLLOWS_PREFIX);
      await this.redisCacheService.invalidatePrefix(CacheKeys.SOCIAL.PROFILE_PREFIX);
      await this.invalidateUserStatsCaches(followerId, {
        followingCount: true,
      });
      await this.invalidateUserStatsCaches(followingId, {
        followersCount: true,
      });
      await this.emitSocialJob(SocialJobType.PROCESS_FOLLOW, {
        followerId,
        followingId,
      });
    }

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await this.socialRepository.unfollowUser(followerId, followingId);
    await this.redisCacheService.invalidatePrefix(CacheKeys.SOCIAL.FOLLOWS_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.SOCIAL.PROFILE_PREFIX);
    await this.invalidateUserStatsCaches(followerId, {
      followingCount: true,
    });
    await this.invalidateUserStatsCaches(followingId, {
      followersCount: true,
    });

    // Queue: cache invalidation
    await this.emitSocialJob(SocialJobType.PROCESS_UNFOLLOW, {
      followerId,
      followingId,
    });
  }

  async getFollowers(
    userId: string,
    pagination: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      userId: string;
      fullName: string;
      avatarUrl: string | null;
    }>
  > {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.FOLLOWERS(userId, pagination),
      CacheKeys.SOCIAL.FOLLOWS_PREFIX,
      () =>
        this.socialRepository.getFollowers(
          { userId, type: "followers" },
          pagination,
        ),
      CacheTTL.SHORT,
    );
  }

  async getFollowing(
    userId: string,
    pagination: PaginationParams,
  ): Promise<
    PaginatedResponse<{
      userId: string;
      fullName: string;
      avatarUrl: string | null;
    }>
  > {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.FOLLOWING(userId, pagination),
      CacheKeys.SOCIAL.FOLLOWS_PREFIX,
      () =>
        this.socialRepository.getFollowing(
          { userId, type: "following" },
          pagination,
        ),
      CacheTTL.SHORT,
    );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.FOLLOW_STATUS(followerId, followingId),
      CacheKeys.SOCIAL.FOLLOWS_PREFIX,
      () => this.socialRepository.isFollowing(followerId, followingId),
      CacheTTL.VERY_SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Profile & Stats ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getUserProfileCore(userId: string): Promise<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
    registeredAt: Date;
  }> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.PROFILE_CORE(userId),
      CacheKeys.SOCIAL.PROFILE_PREFIX,
      async () => {
        const userWithProfile = await this.socialRepository.getUserWithProfile(
          userId,
        );

        return {
          id: userWithProfile?.id ?? userId,
          fullName: userWithProfile?.fullName ?? "",
          avatarUrl: userWithProfile?.avatarUrl ?? null,
          bio: userWithProfile?.bio ?? null,
          registeredAt: userWithProfile?.registeredAt ?? new Date(),
        };
      },
      CacheTTL.MEDIUM,
    );
  }

  async getUserRecentActivity(
    userId: string,
    currentUserId?: string,
  ): Promise<SocialPostWithAuthor[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.PROFILE_RECENT_ACTIVITY(userId, currentUserId),
      CacheKeys.SOCIAL.PROFILE_PREFIX,
      async () => {
        const recentPosts = await this.socialRepository.getUserPosts(userId, {
          limit: 5,
          page: 1,
        });

        return this.enrichPostsWithAuthors(recentPosts.items, currentUserId);
      },
      CacheTTL.SHORT,
    );
  }

  async getUserGamificationSummary(
    userId: string,
  ): Promise<SocialGamificationSummary> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.GAMIFICATION_SUMMARY(userId),
      CacheKeys.SOCIAL.GAMIFICATION_PREFIX,
      () => this.socialRepository.getUserGamificationSummary(userId),
      CacheTTL.SHORT,
    );
  }

  async getUserStats(userId: string): Promise<UserStats> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.STATS(userId),
      CacheKeys.SOCIAL.STATS_PREFIX,
      async () => {
        const [
          profile,
          gamificationSummary,
          followersCount,
          followingCount,
          postsCount,
          recipesCreatedCount,
        ] = await Promise.all([
          this.getUserStatsProfile(userId),
          this.getUserGamificationSummary(userId),
          this.getUserFollowersCountStats(userId),
          this.getUserFollowingCountStats(userId),
          this.getUserPostsCountStats(userId),
          this.getUserRecipesCreatedCountStats(userId),
        ]);

        return {
          userId,
          recipesCreated: recipesCreatedCount,
          followersCount,
          followingCount,
          postsCount,
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
          level: this.mapGlobalLevelNameToUserLevel(
            gamificationSummary.globalLevelName,
          ),
          xp: gamificationSummary.totalXp,
          globalLevel: gamificationSummary.globalLevel,
          globalLevelName: gamificationSummary.globalLevelName,
        };
      },
      CacheTTL.SHORT,
    );
  }

  async updateUserBio(userId: string, bio: string): Promise<void> {
    await this.socialRepository.updateUserBio(userId, bio);
    await this.redisCacheService.invalidatePrefix(
      CacheKeys.SOCIAL.PROFILE_PREFIX,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Achievements ──────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getAchievements(): Promise<Achievement[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.ACHIEVEMENTS_ALL(),
      CacheKeys.SOCIAL.ACHIEVEMENTS_PREFIX,
      () => this.socialRepository.getAchievements(),
      CacheTTL.VERY_LONG,
    );
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.USER_ACHIEVEMENTS(userId),
      CacheKeys.SOCIAL.ACHIEVEMENTS_PREFIX,
      () => this.socialRepository.getUserAchievements(userId),
      CacheTTL.MEDIUM,
    );
  }

  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    // Orchestrate: check achievements logic moved from repo to service
    const [allAchievements, userAchievements, stats] = await Promise.all([
      this.socialRepository.getAchievements(),
      this.socialRepository.getUserAchievements(userId),
      this.getUserStats(userId),
    ]);

    const unlockedTypes = new Set(
      userAchievements.map((a) => a.achievement?.type),
    );

    const newlyUnlocked: UserAchievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedTypes.has(achievement.type)) continue;

      let shouldUnlock = false;

      switch (achievement.type) {
        // case "recipes_cooked_10":
        //   shouldUnlock = stats.recipesCooked >= 10;
        //   break;
        // case "recipes_cooked_50":
        //   shouldUnlock = stats.recipesCooked >= 50;
        //   break;
        // case "recipes_cooked_100":
        //   shouldUnlock = stats.recipesCooked >= 100;
        //   break;
        case "streak_7_days":
          shouldUnlock = stats.currentStreak >= 7;
          break;
        case "streak_30_days":
          shouldUnlock = stats.currentStreak >= 30;
          break;
        case "recipe_creator_5":
          shouldUnlock = stats.recipesCreated >= 5;
          break;
        case "recipe_creator_20":
          shouldUnlock = stats.recipesCreated >= 20;
          break;
        case "social_butterfly":
          shouldUnlock = stats.followersCount >= 50;
          break;
        case "first_post":
          shouldUnlock = stats.postsCount >= 1;
          break;
      }

      if (shouldUnlock) {
        const unlocked = await this.socialRepository.unlockAchievement({
          id: uuidv4(),
          userId,
          achievementId: achievement.id,
          unlockedAt: new Date(),
          achievement,
        });
        newlyUnlocked.push({ ...unlocked, achievement });
      }
    }

    // Update user level based on XP
    await this.updateUserLevel(userId, stats);

    // Queue: create activity posts for each unlocked achievement
    for (const achievement of newlyUnlocked) {
      await this.emitSocialJob(SocialJobType.CREATE_ACTIVITY_POST, {
        userId,
        activityType: ActivityType.ACHIEVEMENT_UNLOCKED,
        metadata: {
          achievementName: achievement.achievement?.name,
          achievementIcon: achievement.achievement?.icon,
        },
      });
    }

    await this.redisCacheService.invalidatePrefix(
      CacheKeys.SOCIAL.ACHIEVEMENTS_PREFIX,
    );
    return newlyUnlocked;
  }

  /**
   * Business logic: calcula y actualiza el nivel del usuario basándose en stats.
   * Movido del repo al servicio (SRP).
   */
  private async updateUserLevel(
    userId: string,
    stats: UserStats,
  ): Promise<void> {
    const totalXp =
      // stats.recipesCooked * 10 +
      stats.recipesCreated * 20 +
      stats.postsCount * 5 +
      stats.currentStreak * 2;

    let level: UserLevel = UserLevel.NOVICE;
    if (totalXp >= 1000) level = UserLevel.MASTER_CHEF;
    else if (totalXp >= 500) level = UserLevel.CHEF;
    else if (totalXp >= 100) level = UserLevel.COOK;

    await this.socialRepository.updateUserProfileData(userId, {
      level,
      xp: totalXp,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Notifications ─────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getNotifications(
    userId: string,
    unreadOnly: boolean,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialNotificationWithActor>> {
    return this.socialRepository.getNotifications({
      userId,
      unreadOnly,
      limit: pagination.limit,
      page: pagination.page,
    });
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.socialRepository.markNotificationAsRead(notificationId);
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.socialRepository.markAllNotificationsAsRead(userId);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return this.socialRepository.getUnreadNotificationCount(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Explore & Trending ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getTrendingRecipes(filter: ExploreFilter): Promise<TrendingRecipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.TRENDING_RECIPES(filter),
      CacheKeys.SOCIAL.EXPLORE_PREFIX,
      () => this.socialRepository.getTrendingRecipes(filter),
      CacheTTL.SHORT,
    );
  }

  async getTrendingIngredients(
    filter: ExploreFilter,
  ): Promise<TrendingIngredient[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.TRENDING_INGREDIENTS(filter),
      CacheKeys.SOCIAL.EXPLORE_PREFIX,
      () => this.socialRepository.getTrendingIngredients(filter),
      CacheTTL.SHORT,
    );
  }

  async getTopChefs(limit?: number): Promise<TopChef[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.TOP_CHEFS(limit),
      CacheKeys.SOCIAL.EXPLORE_PREFIX,
      () => this.socialRepository.getTopChefs(limit),
      CacheTTL.MEDIUM,
    );
  }

  async getExploreData(filter: ExploreFilter): Promise<ExploreData> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.EXPLORE(filter),
      CacheKeys.SOCIAL.EXPLORE_PREFIX,
      async () => {
        // Orchestrate: assemble explore data from atomic repo methods
        const [trendingRecipes, trendingIngredients, topChefs, featuredPosts] =
          await Promise.all([
            this.socialRepository.getTrendingRecipes(filter),
            this.socialRepository.getTrendingIngredients(filter),
            this.socialRepository.getTopChefs(5),
            this.socialRepository.getFeaturedPosts(filter.limit ?? 10),
          ]);

        return {
          trendingRecipes,
          trendingIngredients,
          topChefs,
          featuredPosts,
        };
      },
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Recipe Social Layer ───────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getRecipeSocialData(
    recipeId: string,
    currentUserId?: string,
  ): Promise<RecipeSocialData> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.RECIPE_SOCIAL(recipeId, currentUserId),
      CacheKeys.SOCIAL.RECIPE_SOCIAL_PREFIX,
      async () => {
        // Orchestrate: assemble recipe social data from atomic repo methods
        const [cookedByUsers, cookedThisWeek, postIds] = await Promise.all([
          this.socialRepository.getRecipeCookedByUsers(recipeId, 20),
          this.socialRepository.getRecipeCookedThisWeekCount(recipeId),
          this.socialRepository.getPostIdsByRecipeId(recipeId, 5),
        ]);

        // Related posts
        const relatedPosts = await this.socialRepository.getFeed(
          { userId: currentUserId },
          { limit: 10, page: 1 },
        );

        // Comments on the first related post
        let comments: PostCommentWithAuthor[] = [];
        if (postIds.length > 0) {
          const commentsResult = await this.socialRepository.getPostComments(
            { postId: postIds[0], limit: 10, page: 1 },
            currentUserId,
          );
          comments = commentsResult.items;
        }

        return {
          recipeId,
          cookedByUsers,
          cookedThisWeek,
          totalCooked: cookedByUsers.length,
          comments,
          relatedPosts: relatedPosts.items,
        };
      },
      CacheTTL.SHORT,
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Share ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async shareRecipe(dto: ShareRecipeDto): Promise<SharedRecipe> {
    const shareToken =
      dto.shareType === "public_link" || dto.shareType === "whatsapp"
        ? uuidv4()
        : null;

    const shared: SharedRecipe = {
      id: uuidv4(),
      recipeId: dto.recipeId,
      sharedByUserId: dto.userId,
      sharedToUserId: dto.targetUserId ?? null,
      shareType: dto.shareType,
      shareToken,
      createdAt: new Date(),
    };

    const result = await this.socialRepository.shareRecipe(shared);

    // Queue: gamification points for sharing
    await this.emitSocialJob(SocialJobType.PROCESS_SHARE, {
      userId: dto.userId,
      recipeId: dto.recipeId,
      shareType: dto.shareType,
    });

    return result;
  }

  async getSharedRecipeByToken(token: string): Promise<SharedRecipe> {
    return this.socialRepository.getSharedRecipeByToken(token);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Smart Social (Inteligencia Social) ────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getSocialInsights(userId: string): Promise<SocialInsight[]> {
    // This method aggregates intelligence from multiple sources
    // It can be extended to include pantry, recipes, and social data
    const insights: SocialInsight[] = [];

    try {
      // 1. Check what followed users have been cooking
      const trendingRecipes = await this.getTrendingRecipes({
        limit: 5,
        period: "week",
      });

      for (const recipe of trendingRecipes.slice(0, 3)) {
        if (recipe.cookedThisWeek >= 3) {
          insights.push({
            type: "followers_cooked",
            message: `${recipe.cookedThisWeek} personas cocinaron "${recipe.recipeName}" esta semana`,
            recipeId: recipe.recipeId,
            recipeName: recipe.recipeName,
            count: recipe.cookedThisWeek,
          });
        }
      }
    } catch (error) {
      this.logger.warn("Error generating social insights", error);
    }

    return insights;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Search ────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async searchUsers(
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
    const result = await this.socialRepository.searchUsers(query, pagination);

    return {
      ...result,
      items: result.items.map((user) => ({
        userId: user.userId,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        level: user.globalLevelName,
      })),
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Private Helpers ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private mapGlobalLevelNameToUserLevel(levelName: string): UserLevel {
    const normalized = levelName.trim().toLowerCase();

    if (normalized.includes("master")) return UserLevel.MASTER_CHEF;
    if (normalized.includes("chef")) return UserLevel.CHEF;
    if (normalized.includes("cocinero") || normalized.includes("cook")) {
      return UserLevel.COOK;
    }

    return UserLevel.NOVICE;
  }

  /**
   * Emit a job to the social BullMQ queue.
   */
  private async emitSocialJob(type: SocialJobType, data: any): Promise<void> {
    await this.socialQueue.add(type, { type, data } as SocialJobPayload, {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });

    this.logger.log(`Social job emitted: ${type}`);
  }

  private async invalidateFeedCaches(userId: string): Promise<void> {
    await this.redisCacheService.invalidatePrefix(CacheKeys.SOCIAL.FEED_PREFIX);
    await this.redisCacheService.invalidatePrefix(
      CacheKeys.SOCIAL.POSTS_PREFIX,
    );
  }

  private async getUserStatsProfile(userId: string): Promise<{
    currentStreak: number;
    longestStreak: number;
  }> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.STATS_PROFILE(userId),
      CacheKeys.SOCIAL.STATS_PREFIX,
      async () => {
        const profile = await this.socialRepository.getOrCreateUserProfile(userId);
        return {
          currentStreak: profile.currentStreak,
          longestStreak: profile.longestStreak,
        };
      },
      CacheTTL.SHORT,
    );
  }

  private async getUserFollowersCountStats(userId: string): Promise<number> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.STATS_FOLLOWERS_COUNT(userId),
      CacheKeys.SOCIAL.STATS_PREFIX,
      () => this.socialRepository.getFollowersCount(userId),
      CacheTTL.SHORT,
    );
  }

  private async getUserFollowingCountStats(userId: string): Promise<number> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.STATS_FOLLOWING_COUNT(userId),
      CacheKeys.SOCIAL.STATS_PREFIX,
      () => this.socialRepository.getFollowingCount(userId),
      CacheTTL.SHORT,
    );
  }

  private async getUserPostsCountStats(userId: string): Promise<number> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.STATS_POSTS_COUNT(userId),
      CacheKeys.SOCIAL.STATS_PREFIX,
      () => this.socialRepository.getPostsCount(userId),
      CacheTTL.SHORT,
    );
  }

  private async getUserRecipesCreatedCountStats(userId: string): Promise<number> {
    return this.redisCacheService.getOrSet(
      CacheKeys.SOCIAL.STATS_RECIPES_CREATED_COUNT(userId),
      CacheKeys.SOCIAL.STATS_PREFIX,
      () => this.socialRepository.getRecipesCreatedCount(userId),
      CacheTTL.SHORT,
    );
  }

  private async invalidateUserStatsCaches(
    userId: string,
    changes: {
      profile?: boolean;
      followersCount?: boolean;
      followingCount?: boolean;
      postsCount?: boolean;
      recipesCreatedCount?: boolean;
      gamificationSummary?: boolean;
    },
  ): Promise<void> {
    const keys: string[] = [CacheKeys.SOCIAL.STATS(userId)];

    if (changes.profile) keys.push(CacheKeys.SOCIAL.STATS_PROFILE(userId));
    if (changes.followersCount) {
      keys.push(CacheKeys.SOCIAL.STATS_FOLLOWERS_COUNT(userId));
    }
    if (changes.followingCount) {
      keys.push(CacheKeys.SOCIAL.STATS_FOLLOWING_COUNT(userId));
    }
    if (changes.postsCount) keys.push(CacheKeys.SOCIAL.STATS_POSTS_COUNT(userId));
    if (changes.recipesCreatedCount) {
      keys.push(CacheKeys.SOCIAL.STATS_RECIPES_CREATED_COUNT(userId));
    }
    if (changes.gamificationSummary) {
      keys.push(CacheKeys.SOCIAL.GAMIFICATION_SUMMARY(userId));
    }

    await this.redisCacheService.invalidateMultiple(keys);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Enrichment Helpers ────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  /**
   * Enrich a single post with recipe data, like status, and author level.
   */
  private async enrichPostWithAuthor(
    post: SocialPostWithAuthor,
    currentUserId?: string,
  ): Promise<SocialPostWithAuthor> {
    const enriched = { ...post };

    // Recipe enrichment
    if (post.recipeId) {
      const recipesMap = await this.socialRepository.getRecipesByIds([
        post.recipeId,
      ]);
      enriched.recipe = recipesMap.get(post.recipeId) ?? null;
    }

    // Like check
    if (currentUserId) {
      const likedSet = await this.socialRepository.getPostLikesByUser(
        [post.id],
        currentUserId,
      );
      enriched.isLikedByCurrentUser = likedSet.has(post.id);
    }

    // Author level
    const levelsMap = await this.socialRepository.getUserLevelsBatch([
      post.author.id,
    ]);
    enriched.author = {
      ...enriched.author,
      level: levelsMap.get(post.author.id) ?? UserLevel.NOVICE,
    };

    return enriched;
  }

  /**
   * Batch-enrich multiple posts with recipes, likes, and author levels.
   */
  private async enrichPostsWithAuthors(
    posts: SocialPostWithAuthor[],
    currentUserId?: string,
  ): Promise<SocialPostWithAuthor[]> {
    if (posts.length === 0) return posts;

    // Batch: collect unique IDs
    const postIds = posts.map((p) => p.id);
    const recipeIds = [
      ...new Set(posts.filter((p) => p.recipeId).map((p) => p.recipeId!)),
    ];
    const authorIds = [...new Set(posts.map((p) => p.author.id))];

    // Batch fetch
    const [recipesMap, levelsMap, likedSet] = await Promise.all([
      recipeIds.length > 0
        ? this.socialRepository.getRecipesByIds(recipeIds)
        : Promise.resolve(
            new Map<
              string,
              { id: string; name: string; image: string | null }
            >(),
          ),
      this.socialRepository.getUserLevelsBatch(authorIds),
      currentUserId
        ? this.socialRepository.getPostLikesByUser(postIds, currentUserId)
        : Promise.resolve(new Set<string>()),
    ]);

    return posts.map((post) => ({
      ...post,
      recipe: post.recipeId ? (recipesMap.get(post.recipeId) ?? null) : null,
      isLikedByCurrentUser: likedSet.has(post.id),
      author: {
        ...post.author,
        level: levelsMap.get(post.author.id) ?? UserLevel.NOVICE,
      },
    }));
  }
}
