import { UploadedImage } from "../../domain/upload";
import { ActivityType, PostType } from "../../domain/social.model";

// ─── Post DTOs ──────────────────────────────────────────────────────

export interface CreatePostDto {
  userId: string;
  content: string;
  image?: UploadedImage | string;
  recipeId?: string;
  metadata?: Record<string, any>;
  postType?: PostType;
  isPublic?: boolean;
}

export interface UpdatePostDto {
  id: string;
  userId: string;
  content?: string;
  image?: UploadedImage | string;
  isPublic?: boolean;
}

// ─── Activity Post DTO (generated automatically) ────────────────────

export interface CreateActivityPostDto {
  userId: string;
  activityType: ActivityType;
  recipeId?: string;
  metadata: Record<string, any>;
}

// ─── Comment DTOs ───────────────────────────────────────────────────

export interface CreateCommentDto {
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentDto {
  commentId: string;
  userId: string;
  content: string;
}

// ─── Like DTOs ──────────────────────────────────────────────────────

export interface LikePostDto {
  userId: string;
  postId: string;
}

export interface LikeCommentDto {
  userId: string;
  commentId: string;
}

// ─── Follow DTOs ────────────────────────────────────────────────────

export interface FollowUserDto {
  followerId: string;
  followingId: string;
}

// ─── Profile DTOs ───────────────────────────────────────────────────

export interface UpdateBioDto {
  userId: string;
  bio: string;
}

// ─── Share DTOs ─────────────────────────────────────────────────────

export interface ShareRecipeDto {
  recipeId: string;
  userId: string;
  targetUserId?: string;
  shareType: 'internal' | 'public_link' | 'whatsapp';
}

// ─── Notification DTOs ──────────────────────────────────────────────

export interface MarkNotificationReadDto {
  notificationId: string;
  userId: string;
}

// ─── Explore DTOs ───────────────────────────────────────────────────

export interface ExploreQueryDto {
  limit?: number;
  period?: 'week' | 'month' | 'all';
}

// ─── Search DTOs ────────────────────────────────────────────────────

export interface SearchUsersDto {
  query: string;
  limit?: number;
  page?: number;
}
