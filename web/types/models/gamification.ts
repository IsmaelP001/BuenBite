// ─── Gamification Types ───────────────────────────────────────────────────────

// ─── Enums ────────────────────────────────────────────────────────────────────

export type GamificationAction =
  | "recipe_cooked"
  | "recipe_created"
  | "recipe_saved"
  | "pantry_item_added"
  | "pantry_item_updated"
  | "purchase_registered"
  | "post_created"
  | "comment_added"
  | "post_liked"
  | "user_followed"
  | "recipe_shared"
  | "tip_added"
  | "mealplan_entry_created"
  | "mealplan_completed"
  | "calorie_goal_met"
  | "used_expiring_ingredient"
  | "challenge_completed";

export type MasteryCategory = "social" | "chef" | "organizador" | "smart";

export type MasteryLevel = 1 | 2 | 3 | 4 | 5;

export type StreakType = "cooking" | "pantry" | "mealplan" | "daily_login";

export type MilestoneType =
  | "first_recipe_cooked"
  | "recipes_cooked_10"
  | "recipes_cooked_50"
  | "recipes_cooked_100"
  | "recipes_cooked_500"
  | "first_recipe_created"
  | "recipes_created_10"
  | "recipes_created_50"
  | "first_pantry_item"
  | "pantry_items_50"
  | "zero_waste_hero"
  | "zero_waste_10"
  | "first_purchase"
  | "purchases_20"
  | "first_post"
  | "first_comment"
  | "followers_10"
  | "followers_50"
  | "followers_100"
  | "social_butterfly"
  | "first_mealplan"
  | "mealplan_week_complete"
  | "calorie_streak_7"
  | "streak_7_days"
  | "streak_30_days"
  | "streak_60_days"
  | "streak_100_days"
  | "xp_1000"
  | "xp_5000"
  | "xp_10000"
  | "xp_50000";

export type WeeklyTitle =
  | "chef_de_oro"
  | "chef_de_plata"
  | "chef_de_bronce"
  | "chef_destacado"
  | "rey_de_la_despensa"
  | "lider_social"
  | "planificador_estrella"
  | "zero_waste_champion";

export type ChallengeType = "daily" | "weekly" | "special";

export type ChallengeStatus = "active" | "completed" | "expired" | "claimed";

export type GamificationAlertType =
  | "milestone_unlocked"
  | "mastery_level_up"
  | "global_level_up"
  | "challenge_completed"
  | "weekly_title_earned";

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface UserStreak {
  id: string;
  userId: string;
  streakType: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationMilestone {
  id: string;
  type: MilestoneType;
  name: string;
  description: string;
  icon: string;
  category: MasteryCategory | "general";
  xpReward: number;
  requiredValue: number;
  createdAt: string;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneId: string;
  unlockedAt: string;
  milestone?: GamificationMilestone;
}

export interface WeeklyChefTitle {
  id: string;
  userId: string;
  title: WeeklyTitle;
  weekStartDate: string;
  weekEndDate: string;
  rank: number;
  xpEarned: number;
  createdAt: string;
}

export interface UserMasteryProgress {
  id: string;
  userId: string;
  category: MasteryCategory;
  currentXp: number;
  currentLevel: MasteryLevel;
  levelName: string;
  levelIcon: string;
  nextLevelXp: number | null;
  progressPercent: number;
  updatedAt: string;
}

export interface WeeklyRanking {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  weeklyXp: number;
  rank: number;
  currentTitle: WeeklyTitle | null;
  masteryLevels: UserMasteryProgress[];
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ChallengeType;
  action: GamificationAction;
  targetValue: number;
  xpReward: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  currentProgress: number;
  status: ChallengeStatus;
  completedAt: string | null;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
  challenge?: Challenge;
}

export interface PointsLog {
  id: string;
  userId: string;
  action: GamificationAction;
  basePoints: number;
  streakMultiplier: number;
  totalPoints: number;
  masteryCategory: MasteryCategory;
  masteryXpGained: number;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface GamificationProfile {
  userId: string;
  totalXp: number;
  globalLevel: number;
  globalLevelName: string;
  streaks: UserStreak[];
  masteries: UserMasteryProgress[];
  recentMilestones: UserMilestone[];
  weeklyTitle: WeeklyChefTitle | null;
  activeChallenges: UserChallenge[];
  weeklyRank: number | null;
  pointsThisWeek: number;
  pointsToday: number;
}

export interface GamificationSummary {
  userId: string;
  totalXp: number;
  globalLevel: number;
  globalLevelName: string;
  weeklyRank: number | null;
  pointsThisWeek: number;
  pointsToday: number;
}

export interface GamificationAlert {
  id: string;
  userId: string;
  alertType: GamificationAlertType;
  title: string;
  message: string;
  icon: string;
  data: Record<string, unknown> | null;
  seen: boolean;
  createdAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface EmitGamificationEventDto {
  action: GamificationAction;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface PointsHistoryFilters {
  action?: GamificationAction;
  masteryCategory?: MasteryCategory;
  fromDate?: string;
  toDate?: string;
  page?: string;
  limit?: string;
}

export interface LeaderboardFilters {
  period?: "week" | "month" | "all";
  page?: string;
  limit?: string;
}

export interface ChallengeFilters {
  type?: ChallengeType;
  activeOnly?: string;
}
