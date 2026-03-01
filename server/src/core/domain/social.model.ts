// ─── Social Network Domain Models ─────────────────────────────────────

// ─── Enums ────────────────────────────────────────────────────────────

export enum ActivityType {
  RECIPE_COOKED = "recipe_cooked",
  RECIPE_CREATED = "recipe_created",
  RECIPE_SAVED = "recipe_saved",
  PANTRY_ITEM_ADDED = "pantry_item_added",
  PANTRY_UPDATED = "pantry_updated",
  TIP_ADDED = "tip_added",
  ACHIEVEMENT_UNLOCKED = "achievement_unlocked",
  STREAK_MILESTONE = "streak_milestone",
}

export enum PostType {
  MANUAL = "manual",
  ACTIVITY = "activity",
}

export enum AchievementType {
  RECIPES_COOKED_10 = "recipes_cooked_10",
  RECIPES_COOKED_50 = "recipes_cooked_50",
  RECIPES_COOKED_100 = "recipes_cooked_100",
  STREAK_7_DAYS = "streak_7_days",
  STREAK_30_DAYS = "streak_30_days",
  CHEF_OF_THE_MONTH = "chef_of_the_month",
  VEGGIE_MASTER = "veggie_master",
  MEAT_EXPERT = "meat_expert",
  RECIPE_CREATOR_5 = "recipe_creator_5",
  RECIPE_CREATOR_20 = "recipe_creator_20",
  SOCIAL_BUTTERFLY = "social_butterfly", // 50 followers
  FIRST_POST = "first_post",
  FIRST_COMMENT = "first_comment",
  PANTRY_OPTIMIZER = "pantry_optimizer",
}

export enum UserLevel {
  NOVICE = "novice",
  COOK = "cook",
  CHEF = "chef",
  MASTER_CHEF = "master_chef",
}

// ─── Core Entities ────────────────────────────────────────────────────

export interface SearchUser {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: number;
  globalLevelName: string;
  totalExp: number;
}
export interface SocialPost {
  id: string;
  userId: string;
  postType: PostType;
  activityType: ActivityType | null;
  content: string | null;
  image: string | null;
  recipeId: string | null;
  metadata: Record<string, any> | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialPostWithAuthor extends SocialPost {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    level: UserLevel;
  };
  recipe?: {
    id: string;
    name: string;
    image: string | null;
  } | null;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostCommentWithAuthor extends PostComment {
  author: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
  likesCount: number;
  isLikedByCurrentUser: boolean;
  replies?: PostCommentWithAuthor[];
}

export interface PostLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface CommentLike {
  id: string;
  userId: string;
  commentId: string;
  createdAt: Date;
}

// ─── Follow System ───────────────────────────────────────────────────

export interface UserFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

// ─── Achievements & Gamification ─────────────────────────────────────

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  requiredValue: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievement?: Achievement;
}

export interface UserStats {
  userId: string;
  recipesCreated: number;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  currentStreak: number;
  longestStreak: number;
  level: UserLevel;
  xp: number;
  globalLevel: number;
  globalLevelName: string;
}

export interface SocialGamificationSummary {
  userId: string;
  totalXp: number;
  globalLevel: number;
  globalLevelName: string;
}

// ─── Social Profile ─────────────────────────────────────────────────

export interface SocialProfile {
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
    registeredAt: Date;
  };
  stats: UserStats;
  achievements: UserAchievement[];
  isFollowedByCurrentUser: boolean;
  recentActivity: SocialPostWithAuthor[];
}

// ─── Explore / Trending ──────────────────────────────────────────────

export interface TrendingRecipe {
  recipeId: string;
  recipeName: string;
  recipeImage: string | null;
  cookedCount: number;
  cookedThisWeek: number;
  authorName: string;
  authorAvatarUrl: string | null;
}

export interface TrendingIngredient {
  ingredientId: string;
  ingredientName: { es: string; en: string; fr: string };
  usageCount: number;
  image: string | null;
}

export interface TopChef {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: UserLevel;
  recipesCooked: number;
  followersCount: number;
}

export interface ExploreData {
  trendingRecipes: TrendingRecipe[];
  trendingIngredients: TrendingIngredient[];
  topChefs: TopChef[];
  featuredPosts: SocialPostWithAuthor[];
}

// ─── Notifications ──────────────────────────────────────────────────

export enum NotificationType {
  NEW_FOLLOWER = "new_follower",
  POST_LIKED = "post_liked",
  COMMENT_ADDED = "comment_added",
  COMMENT_LIKED = "comment_liked",
  ACHIEVEMENT_UNLOCKED = "achievement_unlocked",
  FOLLOWED_USER_POSTED = "followed_user_posted",
  FOLLOWED_USER_COOKED = "followed_user_cooked",
  RECIPE_COOKED_BY_FOLLOWER = "recipe_cooked_by_follower",
}

export interface SocialNotification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  referenceId: string | null;
  referenceType: string | null;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface SocialNotificationWithActor extends SocialNotification {
  actor: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
  };
}

// ─── Smart Social (Inteligencia Social) ─────────────────────────────

export interface SocialInsight {
  type: "followers_cooked" | "ingredients_available" | "expiring_ingredients";
  message: string;
  recipeId?: string;
  recipeName?: string;
  count?: number;
}

// ─── Recipe Social Layer ────────────────────────────────────────────

export interface RecipeSocialData {
  recipeId: string;
  cookedByUsers: {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    cookedAt: Date;
  }[];
  cookedThisWeek: number;
  totalCooked: number;
  comments: PostCommentWithAuthor[];
  relatedPosts: SocialPostWithAuthor[];
}

// ─── Share ──────────────────────────────────────────────────────────

export interface ShareRecipePayload {
  recipeId: string;
  userId: string;
  targetUserId?: string;
  shareType: "internal" | "public_link" | "whatsapp";
}

export interface SharedRecipe {
  id: string;
  recipeId: string;
  sharedByUserId: string;
  sharedToUserId: string | null;
  shareType: string;
  shareToken: string | null;
  createdAt: Date;
}

// ─── Filters ────────────────────────────────────────────────────────

export interface FeedFilter {
  userId?: string;
  followingOnly?: boolean;
  postType?: PostType;
  activityType?: ActivityType;
}

export interface PostCommentFilter {
  postId: string;
  limit?: number;
  page?: number;
}

export interface NotificationFilter {
  userId: string;
  unreadOnly?: boolean;
  limit?: number;
  page?: number;
}

export interface FollowFilter {
  userId: string;
  type: "followers" | "following";
  limit?: number;
  page?: number;
}

export interface ExploreFilter {
  limit?: number;
  period?: "week" | "month" | "all";
}

export interface UserSearchFilter {
  query: string;
  limit?: number;
  page?: number;
}
