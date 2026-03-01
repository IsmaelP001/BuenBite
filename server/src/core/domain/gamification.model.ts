// ═══════════════════════════════════════════════════════════════════════
// ─── GAMIFICATION DOMAIN MODELS ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// ─── Actions que otorgan puntos ──────────────────────────────────────

export enum GamificationAction {
  // Chef (cocinar)
  RECIPE_COOKED = 'recipe_cooked',
  RECIPE_CREATED = 'recipe_created',
  RECIPE_SAVED = 'recipe_saved',

  // Organizador (despensa / compras)
  PANTRY_ITEM_ADDED = 'pantry_item_added',
  PANTRY_ITEM_UPDATED = 'pantry_item_updated',
  PURCHASE_REGISTERED = 'purchase_registered',

  // Social
  POST_CREATED = 'post_created',
  COMMENT_ADDED = 'comment_added',
  POST_LIKED = 'post_liked',
  USER_FOLLOWED = 'user_followed',
  RECIPE_SHARED = 'recipe_shared',
  TIP_ADDED = 'tip_added',

  // Smart (planificación / nutrición)
  MEALPLAN_ENTRY_CREATED = 'mealplan_entry_created',
  MEALPLAN_COMPLETED = 'mealplan_completed',
  CALORIE_GOAL_MET = 'calorie_goal_met',
  USED_EXPIRING_INGREDIENT = 'used_expiring_ingredient',

  // Retos
  CHALLENGE_COMPLETED = 'challenge_completed',
}

// Puntos por acción
export const ACTION_POINTS: Record<GamificationAction, number> = {
  [GamificationAction.RECIPE_COOKED]: 25,
  [GamificationAction.RECIPE_CREATED]: 30,
  [GamificationAction.RECIPE_SAVED]: 5,
  [GamificationAction.PANTRY_ITEM_ADDED]: 10,
  [GamificationAction.PANTRY_ITEM_UPDATED]: 5,
  [GamificationAction.PURCHASE_REGISTERED]: 15,
  [GamificationAction.POST_CREATED]: 10,
  [GamificationAction.COMMENT_ADDED]: 5,
  [GamificationAction.POST_LIKED]: 2,
  [GamificationAction.USER_FOLLOWED]: 3,
  [GamificationAction.RECIPE_SHARED]: 10,
  [GamificationAction.TIP_ADDED]: 15,
  [GamificationAction.MEALPLAN_ENTRY_CREATED]: 10,
  [GamificationAction.MEALPLAN_COMPLETED]: 50,
  [GamificationAction.CALORIE_GOAL_MET]: 20,
  [GamificationAction.USED_EXPIRING_INGREDIENT]: 20,
  [GamificationAction.CHALLENGE_COMPLETED]: 100,
};

// ─── Mastery (Maestrías) ────────────────────────────────────────────

export enum MasteryCategory {
  SOCIAL = 'social',         // Vistas, comentarios, likes, seguidores
  CHEF = 'chef',             // Recetas cocinadas y creadas
  ORGANIZADOR = 'organizador', // Gestión de despensa y compras
  SMART = 'smart',           // Planificación, nutrición, zero-waste
}

export enum MasteryLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

// Configuración de niveles de maestría
export interface MasteryLevelConfig {
  level: MasteryLevel;
  name: string;
  icon: string;
  requiredXp: number;
}

// XP requerida para cada nivel de maestría por categoría
export const MASTERY_LEVELS: Record<MasteryCategory, MasteryLevelConfig[]> = {
  [MasteryCategory.SOCIAL]: [
    { level: MasteryLevel.LEVEL_1, name: 'Observador', icon: '👀', requiredXp: 0 },
    { level: MasteryLevel.LEVEL_2, name: 'Participante', icon: '💬', requiredXp: 200 },
    { level: MasteryLevel.LEVEL_3, name: 'Influyente', icon: '⭐', requiredXp: 800 },
    { level: MasteryLevel.LEVEL_4, name: 'Líder Social', icon: '🌟', requiredXp: 2500 },
    { level: MasteryLevel.LEVEL_5, name: 'Ícono Social', icon: '👑', requiredXp: 6000 },
  ],
  [MasteryCategory.CHEF]: [
    { level: MasteryLevel.LEVEL_1, name: 'Aprendiz', icon: '🍳', requiredXp: 0 },
    { level: MasteryLevel.LEVEL_2, name: 'Cocinero', icon: '👨‍🍳', requiredXp: 300 },
    { level: MasteryLevel.LEVEL_3, name: 'Chef', icon: '🔪', requiredXp: 1000 },
    { level: MasteryLevel.LEVEL_4, name: 'Chef Ejecutivo', icon: '🏆', requiredXp: 3000 },
    { level: MasteryLevel.LEVEL_5, name: 'Master Chef', icon: '💎', requiredXp: 8000 },
  ],
  [MasteryCategory.ORGANIZADOR]: [
    { level: MasteryLevel.LEVEL_1, name: 'Principiante', icon: '📦', requiredXp: 0 },
    { level: MasteryLevel.LEVEL_2, name: 'Ordenado', icon: '📋', requiredXp: 150 },
    { level: MasteryLevel.LEVEL_3, name: 'Gestor', icon: '📊', requiredXp: 600 },
    { level: MasteryLevel.LEVEL_4, name: 'Estratega', icon: '🎯', requiredXp: 2000 },
    { level: MasteryLevel.LEVEL_5, name: 'Maestro Logístico', icon: '🧠', requiredXp: 5000 },
  ],
  [MasteryCategory.SMART]: [
    { level: MasteryLevel.LEVEL_1, name: 'Curioso', icon: '🔍', requiredXp: 0 },
    { level: MasteryLevel.LEVEL_2, name: 'Planificador', icon: '📅', requiredXp: 200 },
    { level: MasteryLevel.LEVEL_3, name: 'Analista', icon: '📈', requiredXp: 700 },
    { level: MasteryLevel.LEVEL_4, name: 'Optimizador', icon: '⚡', requiredXp: 2200 },
    { level: MasteryLevel.LEVEL_5, name: 'Genio Culinario', icon: '🧬', requiredXp: 5500 },
  ],
};

// Mapeo de acciones a categoría de maestría
export const ACTION_TO_MASTERY: Record<GamificationAction, MasteryCategory> = {
  [GamificationAction.RECIPE_COOKED]: MasteryCategory.CHEF,
  [GamificationAction.RECIPE_CREATED]: MasteryCategory.CHEF,
  [GamificationAction.RECIPE_SAVED]: MasteryCategory.CHEF,
  [GamificationAction.PANTRY_ITEM_ADDED]: MasteryCategory.ORGANIZADOR,
  [GamificationAction.PANTRY_ITEM_UPDATED]: MasteryCategory.ORGANIZADOR,
  [GamificationAction.PURCHASE_REGISTERED]: MasteryCategory.ORGANIZADOR,
  [GamificationAction.POST_CREATED]: MasteryCategory.SOCIAL,
  [GamificationAction.COMMENT_ADDED]: MasteryCategory.SOCIAL,
  [GamificationAction.POST_LIKED]: MasteryCategory.SOCIAL,
  [GamificationAction.USER_FOLLOWED]: MasteryCategory.SOCIAL,
  [GamificationAction.RECIPE_SHARED]: MasteryCategory.SOCIAL,
  [GamificationAction.TIP_ADDED]: MasteryCategory.SOCIAL,
  [GamificationAction.MEALPLAN_ENTRY_CREATED]: MasteryCategory.SMART,
  [GamificationAction.MEALPLAN_COMPLETED]: MasteryCategory.SMART,
  [GamificationAction.CALORIE_GOAL_MET]: MasteryCategory.SMART,
  [GamificationAction.USED_EXPIRING_INGREDIENT]: MasteryCategory.SMART,
  [GamificationAction.CHALLENGE_COMPLETED]: MasteryCategory.CHEF, // default
};

// ─── Streaks (Rachas) ───────────────────────────────────────────────

export enum StreakType {
  COOKING = 'cooking',           // Cocinar al menos 1 receta por día
  PANTRY = 'pantry',             // Registrar algo en despensa por día
  MEALPLAN = 'mealplan',         // Cumplir el plan del día
  DAILY_LOGIN = 'daily_login',   // Entrar a la app diariamente
}

export interface UserStreak {
  id: string;
  userId: string;
  streakType: StreakType;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Bonus multiplicadores por racha
export const STREAK_BONUSES: Record<number, number> = {
  3: 1.1,    // 3 días → +10%
  7: 1.25,   // 7 días → +25%
  14: 1.5,   // 14 días → +50%
  30: 2.0,   // 30 días → x2
  60: 2.5,   // 60 días → x2.5
  100: 3.0,  // 100 días → x3
};

// ─── Milestones / Hitos ─────────────────────────────────────────────

export enum MilestoneType {
  // Chef milestones
  FIRST_RECIPE_COOKED = 'first_recipe_cooked',
  RECIPES_COOKED_10 = 'recipes_cooked_10',
  RECIPES_COOKED_50 = 'recipes_cooked_50',
  RECIPES_COOKED_100 = 'recipes_cooked_100',
  RECIPES_COOKED_500 = 'recipes_cooked_500',
  FIRST_RECIPE_CREATED = 'first_recipe_created',
  RECIPES_CREATED_10 = 'recipes_created_10',
  RECIPES_CREATED_50 = 'recipes_created_50',

  // Pantry / Organizador milestones
  FIRST_PANTRY_ITEM = 'first_pantry_item',
  PANTRY_ITEMS_50 = 'pantry_items_50',
  ZERO_WASTE_HERO = 'zero_waste_hero',       // Cocinar con ingredientes próximos a caducar
  ZERO_WASTE_10 = 'zero_waste_10',

  // Purchase milestones
  FIRST_PURCHASE = 'first_purchase',
  PURCHASES_20 = 'purchases_20',

  // Social milestones
  FIRST_POST = 'first_post',
  FIRST_COMMENT = 'first_comment',
  FOLLOWERS_10 = 'followers_10',
  FOLLOWERS_50 = 'followers_50',
  FOLLOWERS_100 = 'followers_100',
  SOCIAL_BUTTERFLY = 'social_butterfly',     // 50 interacciones sociales

  // Smart milestones
  FIRST_MEALPLAN = 'first_mealplan',
  MEALPLAN_WEEK_COMPLETE = 'mealplan_week_complete',
  CALORIE_STREAK_7 = 'calorie_streak_7',    // 7 días cumpliendo calorías

  // Streak milestones
  STREAK_7_DAYS = 'streak_7_days',
  STREAK_30_DAYS = 'streak_30_days',
  STREAK_60_DAYS = 'streak_60_days',
  STREAK_100_DAYS = 'streak_100_days',

  // XP milestones
  XP_1000 = 'xp_1000',
  XP_5000 = 'xp_5000',
  XP_10000 = 'xp_10000',
  XP_50000 = 'xp_50000',
}

export interface Milestone {
  id: string;
  type: MilestoneType;
  name: string;
  description: string;
  icon: string;
  category: MasteryCategory | 'general';
  xpReward: number;
  requiredValue: number;
  createdAt: Date;
}

export interface UserMilestone {
  id: string;
  userId: string;
  milestoneId: string;
  unlockedAt: Date;
  milestone?: Milestone;
}

// ─── Weekly Chef Titles (Títulos Semanales) ─────────────────────────

export enum WeeklyTitle {
  CHEF_DE_ORO = 'chef_de_oro',             // #1 del ranking semanal
  CHEF_DE_PLATA = 'chef_de_plata',         // #2
  CHEF_DE_BRONCE = 'chef_de_bronce',       // #3
  CHEF_DESTACADO = 'chef_destacado',       // Top 10
  REY_DE_LA_DESPENSA = 'rey_de_la_despensa',   // Más items en despensa esta semana
  LIDER_SOCIAL = 'lider_social',               // Más interacciones sociales
  PLANIFICADOR_ESTRELLA = 'planificador_estrella', // Más planes de comida completados
  ZERO_WASTE_CHAMPION = 'zero_waste_champion',     // Más ingredientes aprovechados
}

export interface WeeklyChefTitle {
  id: string;
  userId: string;
  title: WeeklyTitle;
  weekStartDate: string; // YYYY-MM-DD (lunes)
  weekEndDate: string;   // YYYY-MM-DD (domingo)
  rank: number;
  xpEarned: number;
  createdAt: Date;
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

// ─── Challenges / Retos ─────────────────────────────────────────────

export enum ChallengeType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CLAIMED = 'claimed',
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
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  currentProgress: number;
  status: ChallengeStatus;
  completedAt: Date | null;
  claimedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  challenge?: Challenge;
}

// ─── Points Log (Registro de Puntos) ────────────────────────────────

export interface PointsLog {
  id: string;
  userId: string;
  action: GamificationAction;
  basePoints: number;
  streakMultiplier: number;
  totalPoints: number;
  masteryCategory: MasteryCategory;
  masteryXpGained: number;
  referenceId: string | null;    // ID de la entidad relacionada (receta, compra, etc.)
  referenceType: string | null;  // Tipo: 'recipe', 'purchase', 'pantry', etc.
  metadata: Record<string, any> | null;
  createdAt: Date;
}

// ─── User Mastery Progress ──────────────────────────────────────────

export interface UserMasteryProgress {
  id: string;
  userId: string;
  category: MasteryCategory;
  currentXp: number;
  currentLevel: MasteryLevel;
  levelName: string;
  levelIcon: string;
  nextLevelXp: number | null; // null si está en nivel 5
  progressPercent: number;
  updatedAt: Date;
}

// ─── Gamification Summary (lightweight XP / level info) ─────────────

export interface GamificationSummary {
  userId: string;
  totalXp: number;
  globalLevel: number;
  globalLevelName: string;
  weeklyRank: number | null;
  pointsThisWeek: number;
  pointsToday: number;
}

// ─── Gamification Profile (Vista completa) ──────────────────────────

export interface GamificationProfile {
  userId: string;
  totalXp: number;
  globalLevel: number;        // Nivel global calculado por totalXp
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

// ─── Global Level Thresholds ────────────────────────────────────────

export interface GlobalLevelConfig {
  level: number;
  name: string;
  requiredXp: number;
}

export const GLOBAL_LEVELS: GlobalLevelConfig[] = [
  { level: 1, name: 'Novato', requiredXp: 0 },
  { level: 2, name: 'Iniciado', requiredXp: 200 },
  { level: 3, name: 'Aprendiz', requiredXp: 500 },
  { level: 4, name: 'Cocinero', requiredXp: 1000 },
  { level: 5, name: 'Cocinero Avanzado', requiredXp: 2000 },
  { level: 6, name: 'Chef Junior', requiredXp: 4000 },
  { level: 7, name: 'Chef', requiredXp: 7000 },
  { level: 8, name: 'Chef Senior', requiredXp: 12000 },
  { level: 9, name: 'Chef Ejecutivo', requiredXp: 20000 },
  { level: 10, name: 'Master Chef', requiredXp: 35000 },
  { level: 11, name: 'Gran Master Chef', requiredXp: 50000 },
  { level: 12, name: 'Leyenda Culinaria', requiredXp: 100000 },
];

// ─── Gamification Alerts (Notificaciones de logros) ─────────────────

export enum GamificationAlertType {
  MILESTONE_UNLOCKED = 'milestone_unlocked',
  MASTERY_LEVEL_UP = 'mastery_level_up',
  GLOBAL_LEVEL_UP = 'global_level_up',
  CHALLENGE_COMPLETED = 'challenge_completed',
  WEEKLY_TITLE_EARNED = 'weekly_title_earned',
}

export interface GamificationAlert {
  id: string;
  userId: string;
  alertType: GamificationAlertType;
  title: string;
  message: string;
  icon: string;
  data: Record<string, any> | null; // Datos extra (milestone info, mastery info, etc.)
  seen: boolean;
  createdAt: Date;
}

// ─── Queue Event (Evento para la cola) ──────────────────────────────

export interface GamificationEvent {
  userId: string;
  action: GamificationAction;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ─── Filters ────────────────────────────────────────────────────────

export interface PointsLogFilter {
  userId: string;
  action?: GamificationAction;
  masteryCategory?: MasteryCategory;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  page?: number;
}

export interface LeaderboardFilter {
  period: 'week' | 'month' | 'all';
  limit?: number;
  page?: number;
}

export interface ChallengeFilter {
  type?: ChallengeType;
  activeOnly?: boolean;
  userId?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

export function getStreakMultiplier(streakDays: number): number {
  const thresholds = Object.keys(STREAK_BONUSES)
    .map(Number)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    if (streakDays >= threshold) {
      return STREAK_BONUSES[threshold];
    }
  }
  return 1.0;
}

export function getGlobalLevel(totalXp: number): GlobalLevelConfig {
  const sorted = [...GLOBAL_LEVELS].sort((a, b) => b.requiredXp - a.requiredXp);
  for (const level of sorted) {
    if (totalXp >= level.requiredXp) {
      return level;
    }
  }
  return GLOBAL_LEVELS[0];
}

export function getMasteryLevelForXp(
  category: MasteryCategory,
  xp: number,
): MasteryLevelConfig {
  const levels = MASTERY_LEVELS[category];
  const sorted = [...levels].sort((a, b) => b.requiredXp - a.requiredXp);
  for (const level of sorted) {
    if (xp >= level.requiredXp) {
      return level;
    }
  }
  return levels[0];
}

export function getNextMasteryLevel(
  category: MasteryCategory,
  currentLevel: MasteryLevel,
): MasteryLevelConfig | null {
  const levels = MASTERY_LEVELS[category];
  const next = levels.find((l) => l.level === currentLevel + 1);
  return next ?? null;
}
