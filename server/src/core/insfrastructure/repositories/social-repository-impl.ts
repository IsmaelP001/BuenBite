import { Injectable, Logger } from "@nestjs/common";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  sql,
} from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  achievementsSchema,
  commentLikesSchema,
  postCommentsSchema,
  postLikesSchema,
  recipesSchema,
  sharedRecipesSchema,
  socialNotificationsSchema,
  socialPostsSchema,
  userAchievementsSchema,
  userFollowsSchema,
  userGamificationSchema,
  userProfilesSchema,
  usersSchema,
} from "../../../config/drizzle/schemas";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { SocialRepository } from "../../domain/repositories";
import {
  Achievement,
  CommentLike,
  ExploreFilter,
  FollowFilter,
  NotificationFilter,
  PostComment,
  PostCommentFilter,
  PostCommentWithAuthor,
  PostLike,
  SharedRecipe,
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
  FeedFilter,
  SearchUser,
} from "../../domain/social.model";
import { GLOBAL_LEVELS } from "../../domain/gamification.model";

@Injectable()
export class SocialRepositoryImpl implements SocialRepository {
  private readonly logger = new Logger(SocialRepositoryImpl.name);

  // ══════════════════════════════════════════════════════════════════
  // ── Posts (CRUD atómico) ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async createPost(data: SocialPost): Promise<SocialPost> {
    const [result] = await db
      .insert(socialPostsSchema)
      .values({
        id: data.id,
        userId: data.userId,
        postType: data.postType,
        activityType: data.activityType,
        content: data.content,
        image: data.image,
        recipeId: data.recipeId,
        metadata: data.metadata,
        isPublic: data.isPublic,
      })
      .returning();
    return result as unknown as SocialPost;
  }

  async updatePost(data: Partial<SocialPost>): Promise<SocialPost> {
    const [result] = await db
      .update(socialPostsSchema)
      .set({
        content: data.content,
        image: data.image,
        isPublic: data.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(socialPostsSchema.id, data.id!))
      .returning();
    return result as unknown as SocialPost;
  }

  async deletePost(postId: string): Promise<void> {
    await db.delete(socialPostsSchema).where(eq(socialPostsSchema.id, postId));
  }

  /**
   * Obtiene un post con su autor y conteos (single query).
   * NO enriquece con receta, nivel de autor ni isLikedByCurrentUser.
   */
  async getPostById(postId: string): Promise<SocialPostWithAuthor | null> {
    const [post] = await db
      .select({
        ...getTableColumns(socialPostsSchema),
        authorId: usersSchema.id,
        authorName: usersSchema.fullName,
        authorAvatar: usersSchema.avatarUrl,
        likesCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = ${socialPostsSchema.id})`.as("likes_count"),
        commentsCount: sql<number>`(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = ${socialPostsSchema.id})`.as("comments_count"),
      })
      .from(socialPostsSchema)
      .innerJoin(usersSchema, eq(socialPostsSchema.userId, usersSchema.id))
      .where(eq(socialPostsSchema.id, postId));

    if (!post) return null;

    return {
      id: post.id,
      userId: post.userId,
      postType: post.postType,
      activityType: post.activityType,
      content: post.content,
      image: post.image,
      recipeId: post.recipeId,
      metadata: post.metadata as Record<string, any> | null,
      isPublic: post.isPublic,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        id: post.authorId,
        fullName: post.authorName ?? "",
        avatarUrl: post.authorAvatar,
        level: UserLevel.NOVICE, // default — servicio enriquece
      },
      recipe: null,
      likesCount: Number(post.likesCount ?? 0),
      commentsCount: Number(post.commentsCount ?? 0),
      isLikedByCurrentUser: false, // default — servicio enriquece
    } as SocialPostWithAuthor;
  }

  /**
   * Devuelve posts crudos para el feed (single query).
   * Enriquecimiento (recetas, likes, niveles) se hace en el servicio.
   */
  async getFeed(
    filter: FeedFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>> {
    const limit = pagination.limit ?? 20;
    const page = pagination.page ?? 1;
    const offset = (page - 1) * limit;

    const baseSelect = {
      ...getTableColumns(socialPostsSchema),
      authorId: usersSchema.id,
      authorName: usersSchema.fullName,
      authorAvatar: usersSchema.avatarUrl,
      likesCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = ${socialPostsSchema.id})`.as("likes_count"),
      commentsCount: sql<number>`(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = ${socialPostsSchema.id})`.as("comments_count"),
    };

    let query = db
      .select(baseSelect)
      .from(socialPostsSchema)
      .innerJoin(usersSchema, eq(socialPostsSchema.userId, usersSchema.id))
      .where(eq(socialPostsSchema.isPublic, true))
      .orderBy(desc(socialPostsSchema.createdAt))
      .limit(limit + 1)
      .offset(offset)
      .$dynamic();

    if (filter.followingOnly && filter.userId) {
      query = db
        .select(baseSelect)
        .from(socialPostsSchema)
        .innerJoin(usersSchema, eq(socialPostsSchema.userId, usersSchema.id))
        .innerJoin(
          userFollowsSchema,
          and(
            eq(userFollowsSchema.followingId, socialPostsSchema.userId),
            eq(userFollowsSchema.followerId, filter.userId),
          ),
        )
        .where(eq(socialPostsSchema.isPublic, true))
        .orderBy(desc(socialPostsSchema.createdAt))
        .limit(limit + 1)
        .offset(offset)
        .$dynamic();
    }

    const rows = await query;
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);

    return {
      items: items.map((row) => ({
        id: row.id,
        userId: row.userId,
        postType: row.postType,
        activityType: row.activityType,
        content: row.content,
        image: row.image,
        recipeId: row.recipeId,
        metadata: row.metadata as Record<string, any> | null,
        isPublic: row.isPublic,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
          id: row.authorId,
          fullName: row.authorName ?? "",
          avatarUrl: row.authorAvatar,
          level: UserLevel.NOVICE,
        },
        recipe: null,
        likesCount: Number(row.likesCount ?? 0),
        commentsCount: Number(row.commentsCount ?? 0),
        isLikedByCurrentUser: false,
      })) as SocialPostWithAuthor[],
      hasMore,
      page,
    };
  }

  async getUserPosts(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>> {
    const limit = pagination.limit ?? 20;
    const page = pagination.page ?? 1;
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        ...getTableColumns(socialPostsSchema),
        authorId: usersSchema.id,
        authorName: usersSchema.fullName,
        authorAvatar: usersSchema.avatarUrl,
        likesCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = ${socialPostsSchema.id})`.as("likes_count"),
        commentsCount: sql<number>`(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = ${socialPostsSchema.id})`.as("comments_count"),
      })
      .from(socialPostsSchema)
      .innerJoin(usersSchema, eq(socialPostsSchema.userId, usersSchema.id))
      .where(eq(socialPostsSchema.userId, userId))
      .orderBy(desc(socialPostsSchema.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);

    return {
      items: items.map((row) => ({
        id: row.id,
        userId: row.userId,
        postType: row.postType,
        activityType: row.activityType,
        content: row.content,
        image: row.image,
        recipeId: row.recipeId,
        metadata: row.metadata as Record<string, any> | null,
        isPublic: row.isPublic,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
          id: row.authorId,
          fullName: row.authorName ?? "",
          avatarUrl: row.authorAvatar,
          level: UserLevel.NOVICE,
        },
        recipe: null,
        likesCount: Number(row.likesCount ?? 0),
        commentsCount: Number(row.commentsCount ?? 0),
        isLikedByCurrentUser: false,
      })) as SocialPostWithAuthor[],
      hasMore,
      page,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Comments (CRUD atómico) ───────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async createComment(data: PostComment): Promise<PostComment> {
    const [result] = await db
      .insert(postCommentsSchema)
      .values({
        id: data.id,
        postId: data.postId,
        userId: data.userId,
        parentCommentId: data.parentCommentId,
        content: data.content,
      })
      .returning();
    return result as unknown as PostComment;
  }

  async updateComment(data: Partial<PostComment>): Promise<PostComment> {
    const [result] = await db
      .update(postCommentsSchema)
      .set({ content: data.content, updatedAt: new Date() })
      .where(eq(postCommentsSchema.id, data.id!))
      .returning();
    return result as unknown as PostComment;
  }

  async deleteComment(commentId: string): Promise<void> {
    await db
      .delete(postCommentsSchema)
      .where(eq(postCommentsSchema.id, commentId));
  }

  /**
   * Obtiene comentarios con autor (single query).
   * Enriquecimiento de likes se hace en el servicio.
   */
  async getPostComments(
    filter: PostCommentFilter,
  ): Promise<PaginatedResponse<PostCommentWithAuthor>> {
    const limit = filter.limit ?? 20;
    const page = filter.page ?? 1;
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        ...getTableColumns(postCommentsSchema),
        authorId: usersSchema.id,
        authorName: usersSchema.fullName,
        authorAvatar: usersSchema.avatarUrl,
        likesCount: sql<number>`(SELECT COUNT(*) FROM comment_likes WHERE comment_likes.comment_id = ${postCommentsSchema.id})`.as("likes_count"),
      })
      .from(postCommentsSchema)
      .innerJoin(usersSchema, eq(postCommentsSchema.userId, usersSchema.id))
      .where(eq(postCommentsSchema.postId, filter.postId))
      .orderBy(desc(postCommentsSchema.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);

    return {
      items: items.map((row) => ({
        id: row.id,
        postId: row.postId,
        userId: row.userId,
        parentCommentId: row.parentCommentId,
        content: row.content,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: {
          id: row.authorId,
          fullName: row.authorName ?? "",
          avatarUrl: row.authorAvatar,
        },
        likesCount: Number(row.likesCount ?? 0),
        isLikedByCurrentUser: false, // servicio enriquece
      })) as PostCommentWithAuthor[],
      hasMore,
      page,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Likes (operaciones atómicas) ──────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async likePost(data: PostLike): Promise<PostLike> {
    const [result] = await db
      .insert(postLikesSchema)
      .values({ id: data.id, userId: data.userId, postId: data.postId })
      .onConflictDoNothing()
      .returning();
    return (result ?? data) as PostLike;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    await db
      .delete(postLikesSchema)
      .where(
        and(
          eq(postLikesSchema.userId, userId),
          eq(postLikesSchema.postId, postId),
        ),
      );
  }

  async likeComment(data: CommentLike): Promise<CommentLike> {
    const [result] = await db
      .insert(commentLikesSchema)
      .values({
        id: data.id,
        userId: data.userId,
        commentId: data.commentId,
      })
      .onConflictDoNothing()
      .returning();
    return (result ?? data) as CommentLike;
  }

  async unlikeComment(userId: string, commentId: string): Promise<void> {
    await db
      .delete(commentLikesSchema)
      .where(
        and(
          eq(commentLikesSchema.userId, userId),
          eq(commentLikesSchema.commentId, commentId),
        ),
      );
  }

  /**
   * Batch: dado un array de postIds, retorna cuáles ha likeado el usuario.
   */
  async getPostLikesByUser(postIds: string[], userId: string): Promise<Set<string>> {
    if (postIds.length === 0) return new Set();
    const likes = await db
      .select({ postId: postLikesSchema.postId })
      .from(postLikesSchema)
      .where(
        and(
          inArray(postLikesSchema.postId, postIds),
          eq(postLikesSchema.userId, userId),
        ),
      );
    return new Set(likes.map((l) => l.postId));
  }

  /**
   * Batch: dado un array de commentIds, retorna cuáles ha likeado el usuario.
   */
  async getCommentLikesByUser(commentIds: string[], userId: string): Promise<Set<string>> {
    if (commentIds.length === 0) return new Set();
    const likes = await db
      .select({ commentId: commentLikesSchema.commentId })
      .from(commentLikesSchema)
      .where(
        and(
          inArray(commentLikesSchema.commentId, commentIds),
          eq(commentLikesSchema.userId, userId),
        ),
      );
    return new Set(likes.map((l) => l.commentId));
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Follows (operaciones atómicas) ────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async followUser(data: UserFollow): Promise<UserFollow> {
    const [result] = await db
      .insert(userFollowsSchema)
      .values({
        id: data.id,
        followerId: data.followerId,
        followingId: data.followingId,
      })
      .onConflictDoNothing()
      .returning();
    return (result) as UserFollow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(userFollowsSchema)
      .where(
        and(
          eq(userFollowsSchema.followerId, followerId),
          eq(userFollowsSchema.followingId, followingId),
        ),
      );
  }

  async getFollowers(
    filter: FollowFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>> {
    const limit = pagination.limit ?? 20;
    const page = pagination.page ?? 1;
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        userId: usersSchema.id,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
      })
      .from(userFollowsSchema)
      .innerJoin(usersSchema, eq(userFollowsSchema.followerId, usersSchema.id))
      .where(eq(userFollowsSchema.followingId, filter.userId))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    return {
      items: rows.slice(0, limit).map((r) => ({
        userId: r.userId,
        fullName: r.fullName ?? "",
        avatarUrl: r.avatarUrl,
      })),
      hasMore,
      page,
    };
  }

  async getFollowing(
    filter: FollowFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>> {
    const limit = pagination.limit ?? 20;
    const page = pagination.page ?? 1;
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        userId: usersSchema.id,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
      })
      .from(userFollowsSchema)
      .innerJoin(
        usersSchema,
        eq(userFollowsSchema.followingId, usersSchema.id),
      )
      .where(eq(userFollowsSchema.followerId, filter.userId))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    return {
      items: rows.slice(0, limit).map((r) => ({
        userId: r.userId,
        fullName: r.fullName ?? "",
        avatarUrl: r.avatarUrl,
      })),
      hasMore,
      page,
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [row] = await db
      .select({ id: userFollowsSchema.id })
      .from(userFollowsSchema)
      .where(
        and(
          eq(userFollowsSchema.followerId, followerId),
          eq(userFollowsSchema.followingId, followingId),
        ),
      );
    return !!row;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Conteos atómicos (Single Responsibility) ──────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getFollowersCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(userFollowsSchema)
      .where(eq(userFollowsSchema.followingId, userId));
    return result?.count ?? 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(userFollowsSchema)
      .where(eq(userFollowsSchema.followerId, userId));
    return result?.count ?? 0;
  }

  async getPostsCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(socialPostsSchema)
      .where(eq(socialPostsSchema.userId, userId));
    return result?.count ?? 0;
  }

  async getRecipesCreatedCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(recipesSchema)
      .where(eq(recipesSchema.userId, userId));
    return result?.count ?? 0;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── User Profile (CRUD atómico) ───────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getOrCreateUserProfile(userId: string): Promise<{ userId: string; bio: string | null; level: string; xp: number; currentStreak: number; longestStreak: number }> {
    let [profile] = await db
      .select()
      .from(userProfilesSchema)
      .where(eq(userProfilesSchema.userId, userId));

    if (!profile) {
      [profile] = await db
        .insert(userProfilesSchema)
        .values({ userId })
        .returning();
    }

    return {
      userId,
      bio: profile.bio ?? null,
      level: profile.level ?? "novice",
      xp: profile.xp ?? 0,
      currentStreak: profile.currentStreak ?? 0,
      longestStreak: profile.longestStreak ?? 0,
    };
  }

  async getUserGamificationSummary(
    userId: string,
  ): Promise<SocialGamificationSummary> {
    const [summary] = await db
      .select({
        userId: userGamificationSchema.userId,
        totalXp: userGamificationSchema.totalXp,
        globalLevel: userGamificationSchema.globalLevel,
        globalLevelName: userGamificationSchema.globalLevelName,
      })
      .from(userGamificationSchema)
      .where(eq(userGamificationSchema.userId, userId));

    if (!summary) {
      return {
        userId,
        totalXp: 0,
        globalLevel: 1,
        globalLevelName: "Novato",
      };
    }

    return {
      userId: summary.userId,
      totalXp: summary.totalXp ?? 0,
      globalLevel: summary.globalLevel ?? 1,
      globalLevelName: summary.globalLevelName ?? "Novato",
    };
  }

  async getUserWithProfile(userId: string): Promise<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    registeredAt: Date;
    bio: string | null;
  } | null> {
    const [user] = await db
      .select({
        id: usersSchema.id,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
        registeredAt: usersSchema.registeredAt,
        bio: userProfilesSchema.bio,
      })
      .from(usersSchema)
      .leftJoin(userProfilesSchema, eq(usersSchema.id, userProfilesSchema.userId))
      .where(eq(usersSchema.id, userId));

    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName ?? "",
      avatarUrl: user.avatarUrl,
      registeredAt: user.registeredAt,
      bio: user.bio ?? null,
    };
  }

  async updateUserProfileData(
    userId: string,
    data: { bio?: string; level?: string; xp?: number; currentStreak?: number; longestStreak?: number },
  ): Promise<void> {
    await db
      .update(userProfilesSchema)
      .set({
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.level !== undefined && { level: data.level }),
        ...(data.xp !== undefined && { xp: data.xp }),
        ...(data.currentStreak !== undefined && { currentStreak: data.currentStreak }),
        ...(data.longestStreak !== undefined && { longestStreak: data.longestStreak }),
        updatedAt: new Date(),
      })
      .where(eq(userProfilesSchema.userId, userId));
  }

  async updateUserBio(userId: string, bio: string): Promise<void> {
    const [existing] = await db
      .select({ id: userProfilesSchema.id })
      .from(userProfilesSchema)
      .where(eq(userProfilesSchema.userId, userId));

    if (existing) {
      await db
        .update(userProfilesSchema)
        .set({ bio, updatedAt: new Date() })
        .where(eq(userProfilesSchema.userId, userId));
    } else {
      await db.insert(userProfilesSchema).values({ userId, bio });
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Achievements (CRUD atómico) ───────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getAchievements(): Promise<Achievement[]> {
    const rows = await db.select().from(achievementsSchema);
    return rows as unknown as Achievement[];
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const rows = await db
      .select({
        ...getTableColumns(userAchievementsSchema),
        achievementType: achievementsSchema.type,
        achievementName: achievementsSchema.name,
        achievementDescription: achievementsSchema.description,
        achievementIcon: achievementsSchema.icon,
        achievementRequiredValue: achievementsSchema.requiredValue,
      })
      .from(userAchievementsSchema)
      .innerJoin(
        achievementsSchema,
        eq(userAchievementsSchema.achievementId, achievementsSchema.id),
      )
      .where(eq(userAchievementsSchema.userId, userId));

    return rows.map((r) => ({
      id: r.id,
      userId: r.userId,
      achievementId: r.achievementId,
      unlockedAt: r.unlockedAt,
      achievement: {
        id: r.achievementId,
        type: r.achievementType,
        name: r.achievementName,
        description: r.achievementDescription,
        icon: r.achievementIcon,
        requiredValue: r.achievementRequiredValue,
      },
    })) as UserAchievement[];
  }

  async unlockAchievement(data: UserAchievement): Promise<UserAchievement> {
    const [result] = await db
      .insert(userAchievementsSchema)
      .values({
        id: data.id,
        userId: data.userId,
        achievementId: data.achievementId,
      })
      .onConflictDoNothing()
      .returning();
    return (result ?? data) as unknown as UserAchievement;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Notifications (CRUD atómico) ──────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async createNotification(data: SocialNotification): Promise<SocialNotification> {
    const [result] = await db
      .insert(socialNotificationsSchema)
      .values({
        id: data.id,
        userId: data.userId,
        actorId: data.actorId,
        type: data.type,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        message: data.message,
        isRead: false,
      })
      .returning();
    return result as unknown as SocialNotification;
  }

  async getNotifications(
    filter: NotificationFilter,
  ): Promise<PaginatedResponse<SocialNotificationWithActor>> {
    const limit = filter.limit ?? 20;
    const page = filter.page ?? 1;
    const offset = (page - 1) * limit;

    const conditions = [eq(socialNotificationsSchema.userId, filter.userId)];
    if (filter.unreadOnly) {
      conditions.push(eq(socialNotificationsSchema.isRead, false));
    }

    const rows = await db
      .select({
        ...getTableColumns(socialNotificationsSchema),
        actorName: usersSchema.fullName,
        actorAvatar: usersSchema.avatarUrl,
      })
      .from(socialNotificationsSchema)
      .innerJoin(
        usersSchema,
        eq(socialNotificationsSchema.actorId, usersSchema.id),
      )
      .where(and(...conditions))
      .orderBy(desc(socialNotificationsSchema.createdAt))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    return {
      items: rows.slice(0, limit).map((r) => ({
        id: r.id,
        userId: r.userId,
        actorId: r.actorId,
        type: r.type,
        referenceId: r.referenceId,
        referenceType: r.referenceType,
        message: r.message,
        isRead: r.isRead,
        createdAt: r.createdAt,
        actor: {
          id: r.actorId,
          fullName: r.actorName ?? "",
          avatarUrl: r.actorAvatar,
        },
      })) as SocialNotificationWithActor[],
      hasMore,
      page,
    };
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(socialNotificationsSchema)
      .set({ isRead: true })
      .where(eq(socialNotificationsSchema.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(socialNotificationsSchema)
      .set({ isRead: true })
      .where(eq(socialNotificationsSchema.userId, userId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(socialNotificationsSchema)
      .where(
        and(
          eq(socialNotificationsSchema.userId, userId),
          eq(socialNotificationsSchema.isRead, false),
        ),
      );
    return result?.count ?? 0;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Trending (queries atómicas, sin orquestación) ─────────────────
  // ══════════════════════════════════════════════════════════════════

  async getTrendingRecipes(filter: ExploreFilter): Promise<TrendingRecipe[]> {
    const limit = filter.limit ?? 10;
    const periodDays = filter.period === "month" ? 30 : filter.period === "week" ? 7 : 365;
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - periodDays);

    const rows = await db
      .select({
        recipeId: socialPostsSchema.recipeId,
        recipeName: recipesSchema.name,
        recipeImage: recipesSchema.image,
        authorName: usersSchema.fullName,
        authorAvatarUrl: usersSchema.avatarUrl,
        cookedCount: count(),
      })
      .from(socialPostsSchema)
      .innerJoin(recipesSchema, eq(socialPostsSchema.recipeId, recipesSchema.id))
      .innerJoin(usersSchema, eq(recipesSchema.userId, usersSchema.id))
      .where(
        and(
          eq(socialPostsSchema.activityType, "recipe_cooked"),
          gte(socialPostsSchema.createdAt, sinceDate),
        ),
      )
      .groupBy(
        socialPostsSchema.recipeId,
        recipesSchema.name,
        recipesSchema.image,
        usersSchema.fullName,
        usersSchema.avatarUrl,
      )
      .orderBy(desc(count()))
      .limit(limit);

    return rows
      .filter((r) => r.recipeId !== null)
      .map((r) => ({
        recipeId: r.recipeId!,
        recipeName: r.recipeName ?? "",
        recipeImage: r.recipeImage ?? null,
        cookedCount: r.cookedCount,
        cookedThisWeek: r.cookedCount,
        authorName: r.authorName ?? "",
        authorAvatarUrl: r.authorAvatarUrl,
      }));
  }

  async getTrendingIngredients(filter: ExploreFilter): Promise<TrendingIngredient[]> {
    return [];
  }

  async getTopChefs(limit?: number): Promise<TopChef[]> {
    const chefLimit = limit ?? 10;

    const rows = await db
      .select({
        userId: usersSchema.id,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
        globalLevelName: userGamificationSchema.globalLevelName,
        followersCount: sql<number>`(SELECT COUNT(*) FROM user_follows WHERE user_follows.following_id = ${usersSchema.id})`.as("followers_count"),
      })
      .from(usersSchema)
      .leftJoin(userGamificationSchema, eq(usersSchema.id, userGamificationSchema.userId))
      .orderBy(desc(sql`followers_count`))
      .limit(chefLimit);

    return rows.map((r) => ({
      userId: r.userId,
      fullName: r.fullName ?? "",
      avatarUrl: r.avatarUrl,
      level: (r.globalLevelName ?? "novice") as UserLevel,
      recipesCooked: 0,
      followersCount: Number(r.followersCount ?? 0),
    }));
  }

  /**
   * Posts destacados (ordenados por likes). Query atómica sin enriquecimiento.
   */
  async getFeaturedPosts(limit: number): Promise<SocialPostWithAuthor[]> {
    const rows = await db
      .select({
        ...getTableColumns(socialPostsSchema),
        authorId: usersSchema.id,
        authorName: usersSchema.fullName,
        authorAvatar: usersSchema.avatarUrl,
        likesCount: sql<number>`(SELECT COUNT(*) FROM post_likes WHERE post_likes.post_id = ${socialPostsSchema.id})`.as("likes_count"),
        commentsCount: sql<number>`(SELECT COUNT(*) FROM post_comments WHERE post_comments.post_id = ${socialPostsSchema.id})`.as("comments_count"),
      })
      .from(socialPostsSchema)
      .innerJoin(usersSchema, eq(socialPostsSchema.userId, usersSchema.id))
      .where(eq(socialPostsSchema.isPublic, true))
      .orderBy(desc(sql`likes_count`))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      postType: row.postType,
      activityType: row.activityType,
      content: row.content,
      image: row.image,
      recipeId: row.recipeId,
      metadata: row.metadata as Record<string, any> | null,
      isPublic: row.isPublic,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      author: {
        id: row.authorId,
        fullName: row.authorName ?? "",
        avatarUrl: row.authorAvatar,
        level: UserLevel.NOVICE,
      },
      recipe: null,
      likesCount: Number(row.likesCount ?? 0),
      commentsCount: Number(row.commentsCount ?? 0),
      isLikedByCurrentUser: false,
    })) as SocialPostWithAuthor[];
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Recipe Social (queries atómicas) ──────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async getRecipeCookedByUsers(
    recipeId: string,
    limit = 20,
  ): Promise<{ userId: string; fullName: string; avatarUrl: string | null; cookedAt: Date }[]> {
    return db
      .select({
        userId: socialPostsSchema.userId,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
        cookedAt: socialPostsSchema.createdAt,
      })
      .from(socialPostsSchema)
      .innerJoin(usersSchema, eq(socialPostsSchema.userId, usersSchema.id))
      .where(
        and(
          eq(socialPostsSchema.recipeId, recipeId),
          eq(socialPostsSchema.activityType, "recipe_cooked"),
        ),
      )
      .orderBy(desc(socialPostsSchema.createdAt))
      .limit(limit)
      .then((rows) =>
        rows.map((r) => ({
          userId: r.userId,
          fullName: r.fullName ?? "",
          avatarUrl: r.avatarUrl,
          cookedAt: r.cookedAt,
        })),
      );
  }

  async getRecipeCookedThisWeekCount(recipeId: string): Promise<number> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const [result] = await db
      .select({ count: count() })
      .from(socialPostsSchema)
      .where(
        and(
          eq(socialPostsSchema.recipeId, recipeId),
          eq(socialPostsSchema.activityType, "recipe_cooked"),
          gte(socialPostsSchema.createdAt, weekAgo),
        ),
      );
    return result?.count ?? 0;
  }

  async getPostIdsByRecipeId(recipeId: string, limit = 5): Promise<string[]> {
    const rows = await db
      .select({ id: socialPostsSchema.id })
      .from(socialPostsSchema)
      .where(eq(socialPostsSchema.recipeId, recipeId))
      .limit(limit);
    return rows.map((r) => r.id);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Batch enrichment helpers ──────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  /**
   * Batch: obtiene niveles de gamificación para múltiples usuarios.
   */
  async getUserLevelsBatch(userIds: string[]): Promise<Map<string, UserLevel>> {
    if (userIds.length === 0) return new Map();

    const levels = new Map<string, UserLevel>();
    const gamRows = await db
      .select({ userId: userGamificationSchema.userId, level: userGamificationSchema.globalLevelName })
      .from(userGamificationSchema)
      .where(inArray(userGamificationSchema.userId, userIds));

    for (const row of gamRows) {
      levels.set(row.userId, row.level as unknown as UserLevel);
    }

    const missing = userIds.filter((id) => !levels.has(id));
    if (missing.length > 0) {
      const profileRows = await db
        .select({ userId: userProfilesSchema.userId, level: userProfilesSchema.level })
        .from(userProfilesSchema)
        .where(inArray(userProfilesSchema.userId, missing));

      for (const row of profileRows) {
        levels.set(row.userId, (row.level ?? "novice") as UserLevel);
      }
    }

    return levels;
  }

  /**
   * Batch: obtiene info básica de recetas por IDs.
   */
  async getRecipesByIds(recipeIds: string[]): Promise<Map<string, { id: string; name: string; image: string | null }>> {
    if (recipeIds.length === 0) return new Map();

    const rows = await db
      .select({ id: recipesSchema.id, name: recipesSchema.name, image: recipesSchema.image })
      .from(recipesSchema)
      .where(inArray(recipesSchema.id, recipeIds));

    const map = new Map<string, { id: string; name: string; image: string | null }>();
    for (const r of rows) {
      map.set(r.id, { id: r.id, name: r.name ?? "", image: r.image });
    }
    return map;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Share (CRUD atómico) ──────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async shareRecipe(data: SharedRecipe): Promise<SharedRecipe> {
    const [result] = await db
      .insert(sharedRecipesSchema)
      .values({
        id: data.id,
        recipeId: data.recipeId,
        sharedByUserId: data.sharedByUserId,
        sharedToUserId: data.sharedToUserId,
        shareType: data.shareType,
        shareToken: data.shareToken,
      })
      .returning();
    return result as unknown as SharedRecipe;
  }

  async getSharedRecipeByToken(token: string): Promise<SharedRecipe> {
    const [result] = await db
      .select()
      .from(sharedRecipesSchema)
      .where(eq(sharedRecipesSchema.shareToken, token));
    return result as unknown as SharedRecipe;
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Search (query atómica) ────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  async searchUsers(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SearchUser>> {
    const limit = pagination.limit ?? 20;
    const page = pagination.page ?? 1;
    const offset = (page - 1) * limit;

    const rows = await db
      .select({
        userId: usersSchema.id,
        fullName: usersSchema.fullName,
        avatarUrl: usersSchema.avatarUrl,
        level: userGamificationSchema.globalLevel,
        globalLevelName: userGamificationSchema.globalLevelName,
        totalExp:userGamificationSchema.totalXp,
      })
      .from(usersSchema)
      .leftJoin(userGamificationSchema, eq(usersSchema.id, userGamificationSchema.userId))
      .where(ilike(usersSchema.fullName, `%${query}%`))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = rows.length > limit;
    return {
      items: rows.slice(0, limit).map((r) => ({
        userId: r.userId,
        fullName: r.fullName ?? "",
        avatarUrl: r.avatarUrl,
        level: r.level ?? GLOBAL_LEVELS[0].level,
        globalLevelName: r?.globalLevelName! ?? GLOBAL_LEVELS[0].name,
        totalExp: r.totalExp ?? 0,  
      })),
      hasMore,
      page,
    };
  }
}
