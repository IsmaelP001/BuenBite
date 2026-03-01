import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import { SocialRepository } from "../../domain/repositories";
import {
  ActivityType,
  NotificationType,
  PostType,
  SocialPost,
} from "../../domain/social.model";
import { GamificationAction, GamificationEvent } from "../../domain/gamification.model";
import { GamificationService } from "./interfaces/gamification";
import { RedisCacheService } from "./redis-cache.service";
import { CacheKeys } from "../../../shared/cache-keys-const";

// ─── Queue Constants ─────────────────────────────────────────────────

export const SOCIAL_QUEUE = "social";

// ─── Job Types ───────────────────────────────────────────────────────

export enum SocialJobType {
  // Feed / activity post creation
  CREATE_ACTIVITY_POST = "create-activity-post",

  // Like processing
  PROCESS_LIKE_POST = "process-like-post",
  PROCESS_UNLIKE_POST = "process-unlike-post",
  PROCESS_LIKE_COMMENT = "process-like-comment",
  PROCESS_UNLIKE_COMMENT = "process-unlike-comment",

  // Comment processing
  PROCESS_COMMENT = "process-comment",
  PROCESS_DELETE_COMMENT = "process-delete-comment",

  // Follow processing
  PROCESS_FOLLOW = "process-follow",
  PROCESS_UNFOLLOW = "process-unfollow",

  // Share processing
  PROCESS_SHARE = "process-share",
}

// ─── Job Payloads ────────────────────────────────────────────────────

export interface CreateActivityPostPayload {
  userId: string;
  activityType: ActivityType;
  metadata: Record<string, any>;
  recipeId?: string;
  image?: string;
  /** When true, skip emitting gamification event (already emitted by caller) */
  skipGamification?: boolean;
}

export interface LikePostPayload {
  userId: string;
  postId: string;
}

export interface LikeCommentPayload {
  userId: string;
  commentId: string;
}

export interface CommentPayload {
  userId: string;
  postId: string;
  commentId: string;
  content: string;
  parentCommentId?: string;
}

export interface FollowPayload {
  followerId: string;
  followingId: string;
}

export interface SharePayload {
  userId: string;
  recipeId: string;
  shareType: string;
}

// Union type for all payloads
export type SocialJobPayload =
  | { type: SocialJobType.CREATE_ACTIVITY_POST; data: CreateActivityPostPayload }
  | { type: SocialJobType.PROCESS_LIKE_POST; data: LikePostPayload }
  | { type: SocialJobType.PROCESS_UNLIKE_POST; data: LikePostPayload }
  | { type: SocialJobType.PROCESS_LIKE_COMMENT; data: LikeCommentPayload }
  | { type: SocialJobType.PROCESS_UNLIKE_COMMENT; data: LikeCommentPayload }
  | { type: SocialJobType.PROCESS_COMMENT; data: CommentPayload }
  | { type: SocialJobType.PROCESS_DELETE_COMMENT; data: { commentId: string } }
  | { type: SocialJobType.PROCESS_FOLLOW; data: FollowPayload }
  | { type: SocialJobType.PROCESS_UNFOLLOW; data: FollowPayload }
  | { type: SocialJobType.PROCESS_SHARE; data: SharePayload };

// ─── Activity → Gamification mapping ─────────────────────────────────

const ACTIVITY_TO_GAMIFICATION: Partial<Record<ActivityType, GamificationAction>> = {
  [ActivityType.RECIPE_COOKED]: GamificationAction.RECIPE_COOKED,
  [ActivityType.RECIPE_CREATED]: GamificationAction.RECIPE_CREATED,
  [ActivityType.RECIPE_SAVED]: GamificationAction.RECIPE_SAVED,
  [ActivityType.PANTRY_ITEM_ADDED]: GamificationAction.PANTRY_ITEM_ADDED,
  [ActivityType.PANTRY_UPDATED]: GamificationAction.PANTRY_ITEM_UPDATED,
  [ActivityType.TIP_ADDED]: GamificationAction.TIP_ADDED,
};

// ─── Processor ───────────────────────────────────────────────────────

@Processor(SOCIAL_QUEUE)
export class SocialProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialProcessor.name);

  constructor(
    @Inject("SocialRepository")
    private readonly socialRepo: SocialRepository,
    @Inject("GamificationService")
    private readonly gamificationService: GamificationService,
    private readonly cacheService: RedisCacheService,
  ) {
    super();
  }

  async process(job: Job<SocialJobPayload>): Promise<void> {
    const { type, data } = job.data;
    this.logger.log(`Processing social job ${job.id}: ${type}`);

    try {
      switch (type) {
        case SocialJobType.CREATE_ACTIVITY_POST:
          await this.handleCreateActivityPost(data);
          break;
        case SocialJobType.PROCESS_LIKE_POST:
          await this.handleLikePost(data);
          break;
        case SocialJobType.PROCESS_UNLIKE_POST:
          await this.handleUnlikePost(data);
          break;
        case SocialJobType.PROCESS_LIKE_COMMENT:
          await this.handleLikeComment(data);
          break;
        case SocialJobType.PROCESS_UNLIKE_COMMENT:
          await this.handleUnlikeComment(data);
          break;
        case SocialJobType.PROCESS_COMMENT:
          await this.handleComment(data);
          break;
        case SocialJobType.PROCESS_DELETE_COMMENT:
          await this.handleDeleteComment(data);
          break;
        case SocialJobType.PROCESS_FOLLOW:
          await this.handleFollow(data);
          break;
        case SocialJobType.PROCESS_UNFOLLOW:
          await this.handleUnfollow(data);
          break;
        case SocialJobType.PROCESS_SHARE:
          await this.handleShare(data);
          break;
        default:
          this.logger.warn(`Unknown social job type: ${type}`);
      }

      this.logger.log(`Social job ${job.id} completed: ${type}`);
    } catch (error: any) {
      this.logger.error(
        `Error processing social job ${job.id} (${type}): ${error?.message}`,
        error?.stack,
      );
      throw error;
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Activity Post (Feed creation per activity) ────────────────────
  // ══════════════════════════════════════════════════════════════════

  private async handleCreateActivityPost(
    payload: CreateActivityPostPayload,
  ): Promise<void> {
    const { userId, activityType, metadata, recipeId } = payload;

    // Resolve image: explicit field, or from metadata (cookImage, tipImage)
    const image = payload.image
      ?? metadata?.cookImage
      ?? metadata?.tipImage
      ?? null;

    // 1. Create the activity post in DB
    const post: SocialPost = {
      id: uuidv4(),
      userId,
      postType: PostType.ACTIVITY,
      activityType,
      content: this.buildActivityContent(activityType, metadata),
      image,
      recipeId: recipeId ?? null,
      metadata,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.socialRepo.createPost(post);

    // 2. Notify followers
    await this.notifyFollowers(userId, activityType, post.id);

    // 3. Emit gamification event (only if not already handled by the caller)
    if (!payload.skipGamification) {
      const gamAction = ACTIVITY_TO_GAMIFICATION[activityType];
      if (gamAction) {
        await this.emitGamificationEvent({
          userId,
          action: gamAction,
          referenceId: recipeId ?? post.id,
          referenceType: recipeId ? "recipe" : "post",
          metadata,
          timestamp: new Date(),
        });
      }
    }

    // 4. Invalidate feed caches
    await this.invalidateFeedCaches(userId);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Likes ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private async handleLikePost(payload: LikePostPayload): Promise<void> {
    const { userId, postId } = payload;

    await this.socialRepo.likePost({
      id: uuidv4(),
      userId,
      postId,
      createdAt: new Date(),
    });

    // Notify post author
    const post = await this.socialRepo.getPostById(postId);
    if (post && post.userId !== userId) {
      await this.createNotification(
        post.userId,
        userId,
        NotificationType.POST_LIKED,
        postId,
        "post",
        "le dio like a tu publicación",
      );
    }

    // Gamification: award points for liking
    await this.emitGamificationEvent({
      userId,
      action: GamificationAction.POST_LIKED,
      referenceId: postId,
      referenceType: "post",
      metadata: {},
      timestamp: new Date(),
    });

    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.POSTS_PREFIX);
    await this.invalidateFeedCaches(userId);
  }

  private async handleUnlikePost(payload: LikePostPayload): Promise<void> {
    await this.socialRepo.unlikePost(payload.userId, payload.postId);
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.POSTS_PREFIX);
  }

  private async handleLikeComment(payload: LikeCommentPayload): Promise<void> {
    const { userId, commentId } = payload;

    await this.socialRepo.likeComment({
      id: uuidv4(),
      userId,
      commentId,
      createdAt: new Date(),
    });

    // Gamification
    await this.emitGamificationEvent({
      userId,
      action: GamificationAction.POST_LIKED, // reuse same action for comment likes
      referenceId: commentId,
      referenceType: "comment",
      metadata: {},
      timestamp: new Date(),
    });

    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.COMMENTS_PREFIX);
  }

  private async handleUnlikeComment(payload: LikeCommentPayload): Promise<void> {
    await this.socialRepo.unlikeComment(payload.userId, payload.commentId);
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.COMMENTS_PREFIX);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Comments ──────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private async handleComment(payload: CommentPayload): Promise<void> {
    const { userId, postId, commentId, content, parentCommentId } = payload;

    // Notify post author
    const post = await this.socialRepo.getPostById(postId);
    if (post && post.userId !== userId) {
      await this.createNotification(
        post.userId,
        userId,
        NotificationType.COMMENT_ADDED,
        postId,
        "post",
        "comentó tu publicación",
      );
    }

    // Gamification: award points for commenting
    await this.emitGamificationEvent({
      userId,
      action: GamificationAction.COMMENT_ADDED,
      referenceId: commentId,
      referenceType: "comment",
      metadata: { postId, parentCommentId },
      timestamp: new Date(),
    });

    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.COMMENTS_PREFIX);
    await this.invalidateFeedCaches(userId);
  }

  private async handleDeleteComment(payload: { commentId: string }): Promise<void> {
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.COMMENTS_PREFIX);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Follows ───────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private async handleFollow(payload: FollowPayload): Promise<void> {
    const { followerId, followingId } = payload;

    await this.createNotification(
      followingId,
      followerId,
      NotificationType.NEW_FOLLOWER,
      followerId,
      "user",
      "comenzó a seguirte",
    );

    // Gamification
    await this.emitGamificationEvent({
      userId: followerId,
      action: GamificationAction.USER_FOLLOWED,
      referenceId: followingId,
      referenceType: "user",
      metadata: {},
      timestamp: new Date(),
    });

    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.FOLLOWS_PREFIX);
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.PROFILE_PREFIX);
  }

  private async handleUnfollow(payload: FollowPayload): Promise<void> {
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.FOLLOWS_PREFIX);
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.PROFILE_PREFIX);
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Share ─────────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private async handleShare(payload: SharePayload): Promise<void> {
    const { userId, recipeId } = payload;

    await this.emitGamificationEvent({
      userId,
      action: GamificationAction.RECIPE_SHARED,
      referenceId: recipeId,
      referenceType: "recipe",
      metadata: {},
      timestamp: new Date(),
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // ── Private Helpers ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(
        `Failed to emit gamification event: ${error?.message}`,
      );
    }
  }

  private async createNotification(
    userId: string,
    actorId: string,
    type: NotificationType,
    referenceId: string,
    referenceType: string,
    message: string,
  ): Promise<void> {
    try {
      await this.socialRepo.createNotification({
        id: uuidv4(),
        userId,
        actorId,
        type,
        referenceId,
        referenceType,
        message,
        isRead: false,
        createdAt: new Date(),
      });
    } catch (error: any) {
      this.logger.warn(`Error creating notification: ${error?.message}`);
    }
  }

  private async notifyFollowers(
    userId: string,
    activityType: string,
    postId: string,
  ): Promise<void> {
    try {
      const followersPage = await this.socialRepo.getFollowers(
        { userId, type: "followers" },
        { limit: 100, page: 1 },
      );

      const notificationType =
        activityType === ActivityType.RECIPE_COOKED
          ? NotificationType.FOLLOWED_USER_COOKED
          : NotificationType.FOLLOWED_USER_POSTED;

      for (const follower of followersPage.items) {
        await this.createNotification(
          follower.userId,
          userId,
          notificationType,
          postId,
          "post",
          "publicó nueva actividad",
        );
      }
    } catch (error: any) {
      this.logger.warn(`Error notifying followers: ${error?.message}`);
    }
  }

  private buildActivityContent(
    activityType: ActivityType,
    metadata: Record<string, any>,
  ): string {
    switch (activityType) {
      case ActivityType.RECIPE_COOKED:
        return `cocinó ${metadata.recipeName ?? "una receta"}`;
      case ActivityType.RECIPE_CREATED:
        return `creó la receta "${metadata.recipeName ?? ""}"`;
      case ActivityType.RECIPE_SAVED:
        return `guardó la receta "${metadata.recipeName ?? ""}"`;
      case ActivityType.PANTRY_ITEM_ADDED:
        return `agregó ${metadata.quantity ?? ""} ${metadata.unit ?? ""} de ${metadata.ingredientName ?? "un ingrediente"} a su despensa`;
      case ActivityType.PANTRY_UPDATED:
        return "actualizó su inventario";
      case ActivityType.TIP_ADDED:
        return `compartió un tip en "${metadata.recipeName ?? "una receta"}"`;
      case ActivityType.ACHIEVEMENT_UNLOCKED:
        return `desbloqueó el logro "${metadata.achievementName ?? ""}" ${metadata.achievementIcon ?? "🏆"}`;
      case ActivityType.STREAK_MILESTONE:
        return `lleva ${metadata.days ?? 0} días cocinando seguidos 🔥`;
      default:
        return "realizó una acción";
    }
  }

  private async invalidateFeedCaches(userId: string): Promise<void> {
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.FEED_PREFIX);
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.POSTS_PREFIX);
    await this.cacheService.invalidatePrefix(CacheKeys.SOCIAL.STATS_PREFIX);
  }
}
