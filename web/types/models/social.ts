// ─── Social Types ─────────────────────────────────────────────────────────────

export type PostType = "manual" | "activity";
export type ActivityType =
  | "recipe_cooked"
  | "recipe_created"
  | "recipe_saved"
  | "pantry_item_added"
  | "pantry_updated"
  | "tip_added"
  | "achievement_unlocked"
  | "streak_milestone";

export type UserLevel = "novice" | "cook" | "chef" | "master_chef";

export type NotificationType =
  | "new_follower"
  | "post_liked"
  | "comment_added"
  | "comment_liked"
  | "achievement_unlocked"
  | "followed_user_posted"
  | "followed_user_cooked"
  | "recipe_cooked_by_follower";

export type ShareType = "internal" | "public_link" | "whatsapp";
export type ExplorePeriod = "week" | "month" | "all";

// ─── Author ───────────────────────────────────────────────────────────────────

export interface SocialAuthor {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  level?: UserLevel;
}

// ─── Post ─────────────────────────────────────────────────────────────────────

export interface SocialPost {
  id: string;
  userId: string;
  postType: PostType;
  activityType: ActivityType | null;
  content: string | null;
  image: string | null;
  recipeId: string | null;
  metadata: Record<string, unknown> | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  author: SocialAuthor;
  recipe: { id: string; name: string; image: string | null } | null;
  likesCount: number;
  commentsCount: number;
  isLikedByCurrentUser: boolean;
}

export interface CreatePostDto {
  content: string;
  image?: string;
  recipeId?: string;
  postType?: PostType;
  isPublic?: boolean;
}

export interface UpdatePostDto {
  content?: string;
  image?: string;
  isPublic?: boolean;
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: SocialAuthor;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  replies: SocialComment[];
}

export interface CreateCommentDto {
  content: string;
  parentCommentId?: string;
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export interface FollowRelation {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowUser {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}

// ─── Profile & Stats ─────────────────────────────────────────────────────────

export interface SocialStats {
  userId: string;
  recipesCreated: number;
  recipesCooked: number;
  followersCount: number;
  followingCount: number;
  pantryItemsCount: number;
  postsCount: number;
  currentStreak: number;
  longestStreak: number;
  level: UserLevel;
  xp: number;
}

export interface SocialProfile {
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
    registeredAt: string;
  };
  stats: SocialStats;
  achievements: UserAchievement[];
  isFollowedByCurrentUser: boolean;
  recentActivity: SocialPost[];
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: string;
  requiredValue: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: Achievement;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface SocialNotification {
  id: string;
  userId: string;
  actorId: string;
  type: NotificationType;
  referenceId: string | null;
  referenceType: "post" | "user" | "achievement" | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: SocialAuthor;
}

// ─── Explore & Trending ──────────────────────────────────────────────────────

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
  featuredPosts: SocialPost[];
}

// ─── Recipe Social Layer ─────────────────────────────────────────────────────

export interface RecipeSocialData {
  recipeId: string;
  cookedByUsers: {
    userId: string;
    fullName: string;
    avatarUrl: string | null;
    cookedAt: string;
  }[];
  cookedThisWeek: number;
  totalCooked: number;
  comments: SocialComment[];
  relatedPosts: SocialPost[];
}

// ─── Share ────────────────────────────────────────────────────────────────────

export interface ShareRecipeDto {
  recipeId: string;
  targetUserId?: string;
  shareType: ShareType;
}

export interface SharedRecipe {
  id: string;
  recipeId: string;
  sharedByUserId: string;
  sharedToUserId: string | null;
  shareType: ShareType;
  shareToken: string | null;
  createdAt: string;
}

// ─── Smart Social Insights ───────────────────────────────────────────────────

export interface SocialInsight {
  type: "followers_cooked" | "ingredients_available" | "expiring_ingredients";
  message: string;
  recipeId?: string;
  recipeName?: string;
  count?: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchUser {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: UserLevel;
}

// ─── Masteries ────────────────────────────────────────────────────────────────

export type MasteryCategory = "social" | "chef" | "organizer" | "smart";

export interface MasteryLevel {
  level: number; // 1-5
  name: string;
  requiredXp: number;
  icon: string; // evolves per level
}

export interface Mastery {
  id: string;
  category: MasteryCategory;
  label: string;
  description: string;
  currentLevel: number; // 1-5
  currentXp: number;
  nextLevelXp: number;
  maxLevel: number;
  levels: MasteryLevel[];
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  isUnlocked: boolean;
  category: "first_steps" | "social" | "cooking" | "pantry" | "planning";
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export interface StreakData {
  type: "recipes_cooked" | "ingredients_registered" | "days_active";
  label: string;
  currentStreak: number;
  longestStreak: number;
  unit: string;
  icon: string;
  lastActivity: string;
  weekHistory: boolean[]; // last 7 days
}

// ─── Chef Titles ──────────────────────────────────────────────────────────────

export interface ChefTitle {
  id: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
  weekOf: string; // ISO week date
  rarity: "common" | "rare" | "epic" | "legendary";
}

// ─── Challenges ───────────────────────────────────────────────────────────────

export type ChallengeStatus = "active" | "completed" | "expired";

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ChallengeStatus;
  currentProgress: number;
  targetProgress: number;
  xpReward: number;
  startsAt: string;
  endsAt: string;
  category: MasteryCategory;
}

// ─── Leagues ──────────────────────────────────────────────────────────────────

export type LeagueRank = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface LeagueParticipant {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  level: UserLevel;
  weeklyXp: number;
  position: number;
  trend: "up" | "down" | "same";
}

export interface League {
  id: string;
  rank: LeagueRank;
  name: string;
  weekOf: string;
  startsAt: string;
  endsAt: string;
  participants: LeagueParticipant[];
  currentUserPosition: number;
  promotionZone: number; // top N get promoted
  relegationZone: number; // bottom N get demoted
}

// ─── TikTok-style Recipe Discovery ───────────────────────────────────────────

export interface DiscoveryRecipe {
  id: string;
  name: string;
  image: string;
  cookTime: number; // minutes
  difficulty: "easy" | "medium" | "hard";
  calories: number;
  matchScore: number; // 0-100 % match with user preferences
  matchReasons: string[];
  authorName: string;
  authorAvatarUrl: string | null;
  authorLevel: UserLevel;
  cookedCount: number;
  likesCount: number;
  tags: string[];
}

// ─── Gamification Profile Extension ──────────────────────────────────────────

export interface GamificationProfile {
  masteries: Mastery[];
  milestones: Milestone[];
  streaks: StreakData[];
  chefTitles: ChefTitle[];
  selectedTitleId: string | null;
  activeChallenges: Challenge[];
  league: League | null;
}

// ─── Feed Filters ─────────────────────────────────────────────────────────────

export interface FeedFilters {
  followingOnly?: string;
  limit?: string;
  page?: string;
}

export interface NotificationFilters {
  unreadOnly?: string;
  limit?: string;
  page?: string;
}

export interface ExploreFilters {
  limit?: string;
  period?: ExplorePeriod;
}

export interface SearchUsersFilters {
  q: string;
  limit?: string;
  page?: string;
}
