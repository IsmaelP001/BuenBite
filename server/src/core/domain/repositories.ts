import { PaginationParams } from "../../shared/dto/input";
import { PaginatedResponse } from "../../shared/dto/response";
import {
  DishAnalysis,
  FilterRecipeIngredient,
  GetRecentlyViewdRecipes,
  Recipe,
  RecipeCook,
  RecipeCookedFilter,
  RecipeFilter,
  RecipeIngredient,
  RecipeTip,
  RecipeTipsFIlter,
  RecipeView,
  ResponseRecipeTipDto,
  SaveRecipeCook,
  SaveRecipeMetrics,
  SearchRecipe,
  UpdateTip,
} from "../domain/recipe.model";
import {
  Achievement,
  CommentLike,
  ExploreData,
  ExploreFilter,
  FeedFilter,
  FollowFilter,
  NotificationFilter,
  PostComment,
  PostCommentFilter,
  PostCommentWithAuthor,
  PostLike,
  RecipeSocialData,
  SearchUser,
  SharedRecipe,
  ShareRecipePayload,
  SocialNotification,
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
  UserLevel,
  UserStats,
} from "../domain/social.model";
import {
  MealPlanEntryResponseDto,
  MealPlanNutritionSummary,
} from "../insfrastructure/controller/dto/responseDto";
import { ScanReceipt } from "./ia.model";
import { Ingredient, IngredientsFilter } from "./ingredients.model";
import {
  GetMealplanRecipeItems,
  getSuggestedMealIngredients,
  GetUserActivePlanFilter,
  MealPlanEntry,
  MealPlanEntryFilters,
  RemoveMealPlanEntry,
  SuggestedMealPlan,
  SuggestedMealPlanCategoryWithPlans,
  SuggestedMealplanFilter,
  SuggestedMealPlanRecipeEntry,
  SuggestedMealplanRecipes,
  SuggestedMealplanRecipesFilter,
  UpdateUserActiveMealPlan,
  UserActiveMealPlan,
} from "./mealplan";
import {
  PantryFilter,
  PantryIngredientMeasurement,
  Pantry,
  PantryTransactionsFilter,
} from "./pantry.model";
import {
  Purchase,
  PurchaseData,
  PurchaseFilters,
  PurchaseItem,
} from "./purchases.model";
import { UploadedImage, UploadResult } from "./upload";
import {
  Challenge,
  ChallengeFilter,
  GamificationAction,
  GamificationAlert,
  GamificationProfile,
  LeaderboardFilter,
  Milestone,
  PointsLog,
  PointsLogFilter,
  UserChallenge,
  UserMasteryProgress,
  UserMilestone,
  UserStreak,
  WeeklyChefTitle,
  WeeklyRanking,
  MasteryCategory,
} from "./gamification.model";
import {
  getUserNutricionalData,
  RemoveFavorite,
  User,
  UserCookedRecipes,
  UserFilters,
  UserNutritionalHistory,
  UserNutritionMetrics,
  UserPreferences,
  UserSavedRecipe,
  UserSavedRecipeEntry,
} from "./user.model";

export interface RecipesRepository {
  getAll(
    filter: RecipeFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Recipe>>;
  create(data: Recipe): Promise<Recipe>;
  update(data: Partial<Recipe>): Promise<Recipe>;
  delete(id: string): Promise<Recipe>;
  getById(id: string): Promise<Recipe>;
  getVariantsByRecipe(recipeId: string): Promise<Recipe[]>;
  searchBy(searchRecipe?: SearchRecipe): Promise<Recipe[]>;
  updateTip(data: UpdateTip): Promise<RecipeTip>;
  saveTip(data: RecipeTip): Promise<RecipeTip>;
  getTips(
    filter: RecipeTipsFIlter
  ): Promise<PaginatedResponse<ResponseRecipeTipDto>>;
  registerRecipeCooked(data: SaveRecipeCook): Promise<void>;
  saveRecipeViews(data: RecipeView[]): Promise<void>;
  saveRecipeMetrics(data: SaveRecipeMetrics): Promise<void>;
  getRecentlyViewedRecipes(filter: GetRecentlyViewdRecipes): Promise<Recipe[]>;
  latestCookedCommunityRecipes(limit?: number): Promise<Recipe[]>;
  getIngredientsBy(
    filters: FilterRecipeIngredient
  ): Promise<RecipeIngredient[]>;
  getCookedRecipes(filter: RecipeCookedFilter): Promise<RecipeCook[]>;
  getSuggestedMealsRecipeIngredients(
      suggestedMealplanId: string
    ): Promise<RecipeIngredient[]>
}

export interface IngredientRepository {
  getAll(filter?: IngredientsFilter): Promise<Ingredient[]>;
  create(data: Ingredient[]): Promise<Ingredient[]>;
}

export interface PurchaseRepository {
  save(purchase: Purchase): Promise<Purchase>;
  getAll(filter: PurchaseFilters): Promise<PurchaseData[]>;
  getBy(filters: Partial<PurchaseData>): Promise<PurchaseData>;
  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseItem[]>;
  confirmPurchase(purchase: Purchase): Promise<Purchase>;
  addItemsToPurchase(data: PurchaseItem[]): Promise<PurchaseItem[]>;
  removePurchaseItem(purchaseItemId: string): Promise<PurchaseItem>;
  getById(purchaseOrderId: string): Promise<PurchaseData>;
}

export interface UserRepository {
  getBy(filters: Partial<User>): Promise<User>;
  getAll(filter: UserFilters): Promise<User[]>;
  getUserPreferences(userId: string): Promise<UserPreferences>;
  getUserSavedRecipes(userId: string): Promise<Recipe[]>;
  saveRecipeFavorite(data: UserSavedRecipe): Promise<UserSavedRecipe>;
  removeRecipeFavorite(data: RemoveFavorite): Promise<UserSavedRecipe>;
  createUserPreferences(data: UserPreferences): Promise<UserPreferences>;
  createUserNutritionMetrics(
    data: UserNutritionMetrics
  ): Promise<UserNutritionMetrics>;
  updateUserPreferences(
    data: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  getUserActiveNutritionalMetrics(
    userId: string
  ): Promise<UserNutritionMetrics>;
  getUserNutricionalHistory(
    filters: getUserNutricionalData
  ): Promise<UserNutritionalHistory[]>;
  getUserCookedRecipes(
    filter: getUserNutricionalData
  ): Promise<UserCookedRecipes[]>;
  updateUserPreference(
    userId: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  updateUserNutritionalMetrics(
    data: Partial<UserNutritionMetrics>
  ): Promise<UserNutritionMetrics>;
  getUserSavedRecipeEntries(userId: string): Promise<UserSavedRecipeEntry[]>;
  getUserNutritionalMetricsById(id: string): Promise<UserNutritionMetrics>;
}

export interface PantryRepository {
  create(items: Pantry[]): Promise<Pantry[]>;
  getAll(filter?: PantryFilter): Promise<Pantry[]>;
  getById(id: string): Promise<Pantry>;
  update(items: Pantry | Pantry[]): Promise<Pantry[]>;
  delete(itemId: string, userId: string): Promise<Pantry>;
  getPantryTransactions(
    filter?: PantryTransactionsFilter
  ): Promise<PantryIngredientMeasurement[]>;
  createPantryEvent(
    data: PantryIngredientMeasurement | PantryIngredientMeasurement[]
  ): Promise<PantryIngredientMeasurement[]>;
}

export interface UploadRepository {
  uploadImage(image: UploadedImage): Promise<UploadResult>;
  deleteImage(path: string[]): Promise<boolean>;
  getImageUrl(path: string): Promise<string>;
}

export interface IaRepository {
  generateRecipe(prompt: string): Promise<any>;
  scanFood(image: any): Promise<DishAnalysis>;
  scanReceipt(imageUri: any): Promise<ScanReceipt>;
}

export interface MealplanRepository {
  deleteMealPlanEntry(data: RemoveMealPlanEntry): Promise<void>;
  createMealPlanEntry(data: MealPlanEntry[]): Promise<MealPlanEntry>;
  getUserNutricionalPlanSummary(
    userId: string
  ): Promise<MealPlanNutritionSummary>;
  getSuggestedMealPlansById(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlan>;
  getMealPlanEntries(filters: MealPlanEntryFilters): Promise<MealPlanEntry[]>;
  updateMealPlanEntry(data: Partial<MealPlanEntry>): Promise<MealPlanEntry>;
  getMealPlanRecipeItems(
    data: GetMealplanRecipeItems
  ): Promise<MealPlanEntryResponseDto[]>;
  getSuggestedMealPlansByCategoryId(
    categoryId: string
  ): Promise<SuggestedMealPlanCategoryWithPlans>;
  getSuggestedMealPlansByCategory(
    filter?: SuggestedMealplanFilter
  ): Promise<SuggestedMealPlanCategoryWithPlans[]>;
  getSuggestedMealIngredients(
    suggestedMealplanId: string
  ): Promise<getSuggestedMealIngredients[]>;
  getSuggestedMealPlanRecipes(
    filter: SuggestedMealplanRecipesFilter
  ): Promise<SuggestedMealplanRecipes[]>;
  createUserActivePlan(data: UserActiveMealPlan): Promise<UserActiveMealPlan>;
  updateUserActivePlan(
    data: UpdateUserActiveMealPlan
  ): Promise<UserActiveMealPlan>;
  getUserActivePlan(
    filters: GetUserActivePlanFilter
  ): Promise<UserActiveMealPlan>;
  getAllSuggestedMealplans(
    pagination: PaginationParams,
    filter?: SuggestedMealplanFilter
  ): Promise<PaginatedResponse<SuggestedMealPlan>>;
  getSuggestedMealPlanRecipeEntry(
      suggestedMealplanId: string
    ): Promise<SuggestedMealPlanRecipeEntry[]>
}

// ─── Social Repository ──────────────────────────────────────────────

export interface SocialRepository {
  // ── Posts / Feed ──────────────────────────────────────────────────
  createPost(data: SocialPost): Promise<SocialPost>;
  updatePost(data: Partial<SocialPost>): Promise<SocialPost>;
  deletePost(postId: string): Promise<void>;
  getPostById(postId: string): Promise<SocialPostWithAuthor | null>;
  getFeed(
    filter: FeedFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>>;
  getUserPosts(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SocialPostWithAuthor>>;

  // ── Comments ──────────────────────────────────────────────────────
  createComment(data: PostComment): Promise<PostComment>;
  updateComment(data: Partial<PostComment>): Promise<PostComment>;
  deleteComment(commentId: string): Promise<void>;
  getPostComments(
    filter: PostCommentFilter,
    currentUserId?: string,
  ): Promise<PaginatedResponse<PostCommentWithAuthor>>;

  // ── Likes ─────────────────────────────────────────────────────────
  likePost(data: PostLike): Promise<PostLike>;
  unlikePost(userId: string, postId: string): Promise<void>;
  likeComment(data: CommentLike): Promise<CommentLike>;
  unlikeComment(userId: string, commentId: string): Promise<void>;
  getPostLikesByUser(postIds: string[], userId: string): Promise<Set<string>>;
  getCommentLikesByUser(commentIds: string[], userId: string): Promise<Set<string>>;

  // ── Follows ───────────────────────────────────────────────────────
  followUser(data: UserFollow): Promise<UserFollow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(
    filter: FollowFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>>;
  getFollowing(
    filter: FollowFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<{ userId: string; fullName: string; avatarUrl: string | null }>>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // ── Atomic Counts ─────────────────────────────────────────────────
  getFollowersCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  getPostsCount(userId: string): Promise<number>;
  getRecipesCreatedCount(userId: string): Promise<number>;

  // ── User Profile (CRUD atómico) ───────────────────────────────────
  getOrCreateUserProfile(userId: string): Promise<{ userId: string; bio: string | null; level: string; xp: number; currentStreak: number; longestStreak: number }>;
  getUserGamificationSummary(userId: string): Promise<SocialGamificationSummary>;
  getUserWithProfile(userId: string): Promise<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    registeredAt: Date;
    bio: string | null;
  } | null>;
  updateUserProfileData(userId: string, data: Record<string, any>): Promise<void>;
  updateUserBio(userId: string, bio: string): Promise<void>;

  // ── Achievements ──────────────────────────────────────────────────
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(data: UserAchievement): Promise<UserAchievement>;

  // ── Notifications ─────────────────────────────────────────────────
  createNotification(data: SocialNotification): Promise<SocialNotification>;
  getNotifications(
    filter: NotificationFilter,
  ): Promise<PaginatedResponse<SocialNotificationWithActor>>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  // ── Explore & Trending (queries atómicas) ─────────────────────────
  getTrendingRecipes(filter: ExploreFilter): Promise<TrendingRecipe[]>;
  getTrendingIngredients(filter: ExploreFilter): Promise<TrendingIngredient[]>;
  getTopChefs(limit?: number): Promise<TopChef[]>;
  getFeaturedPosts(limit: number): Promise<SocialPostWithAuthor[]>;

  // ── Recipe Social Layer (queries atómicas) ────────────────────────
  getRecipeCookedByUsers(recipeId: string, limit?: number): Promise<{ userId: string; fullName: string; avatarUrl: string | null; cookedAt: Date }[]>;
  getRecipeCookedThisWeekCount(recipeId: string): Promise<number>;
  getPostIdsByRecipeId(recipeId: string, limit?: number): Promise<string[]>;

  // ── Batch Enrichment Helpers ──────────────────────────────────────
  getUserLevelsBatch(userIds: string[]): Promise<Map<string, UserLevel>>;
  getRecipesByIds(recipeIds: string[]): Promise<Map<string, { id: string; name: string; image: string | null }>>;

  // ── Share ─────────────────────────────────────────────────────────
  shareRecipe(data: SharedRecipe): Promise<SharedRecipe>;
  getSharedRecipeByToken(token: string): Promise<SharedRecipe>;

  // ── Search ────────────────────────────────────────────────────────
  searchUsers(
    query: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<SearchUser>>;
}

// ─── Gamification Repository ────────────────────────────────────────

export interface GamificationRepository {
  // ── Points ────────────────────────────────────────────────────────
  logPoints(data: PointsLog): Promise<PointsLog>;
  getPointsLog(
    filter: PointsLogFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<PointsLog>>;
  getUserTotalXp(userId: string): Promise<number>;
  getUserXpForPeriod(userId: string, from: Date, to: Date): Promise<number>;
  getUserXpToday(userId: string): Promise<number>;

  // ── Gamification Summary (CRUD atómico) ───────────────────────────
  getGamificationSummary(userId: string): Promise<{
    userId: string;
    totalXp: number;
    globalLevel: number;
    globalLevelName: string;
    pointsThisWeek: number;
    pointsToday: number;
    weeklyRank: number | null;
  } | null>;
  ensureGamificationSummaryExists(userId: string): Promise<void>;
  updateGamificationSummary(
    userId: string,
    data: {
      totalXp?: number;
      pointsThisWeek?: number;
      pointsToday?: number;
      weeklyRank?: number | null;
    },
  ): Promise<void>;
  applyXpDelta(userId: string, deltaXp: number): Promise<{
    totalXp: number;
    globalLevel: number;
    globalLevelName: string;
  }>;

  // ── Streaks ───────────────────────────────────────────────────────
  getUserStreaks(userId: string): Promise<UserStreak[]>;
  getOrCreateStreak(userId: string, streakType: string): Promise<UserStreak>;
  upsertAndUpdateStreak(userId: string, streakType: string, today: string, yesterday: string): Promise<UserStreak>;
  updateStreak(data: Partial<UserStreak> & { id: string }): Promise<UserStreak>;
  resetInactiveStreaks(userId: string): Promise<void>;

  // ── Milestones ────────────────────────────────────────────────────
  getAllMilestones(): Promise<Milestone[]>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;
  getRecentMilestones(userId: string, limit: number): Promise<UserMilestone[]>;
  tryUnlockMilestone(data: UserMilestone): Promise<boolean>;
  unlockMilestone(data: UserMilestone): Promise<UserMilestone>;
  hasUserUnlockedMilestone(userId: string, milestoneType: string): Promise<boolean>;

  // ── Mastery ───────────────────────────────────────────────────────
  getUserMasteries(userId: string): Promise<UserMasteryProgress[]>;
  getOrCreateMastery(userId: string, category: MasteryCategory): Promise<UserMasteryProgress>;
  upsertMastery(userId: string, category: MasteryCategory): Promise<UserMasteryProgress>;
  updateMastery(data: Partial<UserMasteryProgress> & { id: string }): Promise<UserMasteryProgress>;

  // ── Weekly Titles ─────────────────────────────────────────────────
  getWeeklyTitle(userId: string, weekStart: string): Promise<WeeklyChefTitle | null>;
  assignWeeklyTitles(titles: WeeklyChefTitle[]): Promise<WeeklyChefTitle[]>;
  getCurrentWeeklyTitle(userId: string): Promise<WeeklyChefTitle | null>;
  getUserWeeklyTitleHistory(userId: string, limit?: number): Promise<WeeklyChefTitle[]>;

  // ── Leaderboard ───────────────────────────────────────────────────
  getLeaderboard(
    filter: LeaderboardFilter,
  ): Promise<PaginatedResponse<WeeklyRanking>>;
  getWeeklyRankings(weekStart: string, limit?: number): Promise<WeeklyRanking[]>;

  // ── Challenges ────────────────────────────────────────────────────
  getActiveChallenges(filter?: ChallengeFilter): Promise<Challenge[]>;
  getUserChallenges(userId: string, activeOnly?: boolean): Promise<UserChallenge[]>;
  joinChallenge(userId: string, challengeId: string): Promise<UserChallenge>;
  incrementChallengeProgressForAction(
    userId: string,
    action: GamificationAction,
  ): Promise<{ updated: number; completed: number }>;
  updateChallengeProgress(data: Partial<UserChallenge> & { id: string }): Promise<UserChallenge>;
  claimChallengeReward(userId: string, challengeId: string): Promise<UserChallenge>;
  createChallenge(data: Challenge): Promise<Challenge>;
  expireOldChallenges(): Promise<number>;

  // ── Action Counts (for milestone checks) ──────────────────────────
  getUserActionCount(userId: string, action: string): Promise<number>;
  getUserActionCounts(userId: string, actions: string[]): Promise<Map<string, number>>;
  getUserActionCountForPeriod(userId: string, action: string, from: Date, to: Date): Promise<number>;

  // ── Batch Enrichment ──────────────────────────────────────────────
  getUsersBasicInfo(userIds: string[]): Promise<Map<string, { fullName: string; avatarUrl: string | null }>>;

  // ── Alerts (Notificaciones de logros) ─────────────────────────────
  createAlert(alert: GamificationAlert): Promise<GamificationAlert>;
  getUserAlerts(userId: string, unseenOnly?: boolean): Promise<GamificationAlert[]>;
  dismissAlert(alertId: string, userId: string): Promise<void>;
  dismissAllAlerts(userId: string): Promise<void>;
}
