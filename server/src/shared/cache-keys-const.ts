export const CacheKeys = {
  RECIPE: {
    PREFIX: 'recipe',
    INGREDIENTS_PREFIX: 'recipe:ingredients',
    COOKED_PREFIX: 'recipe:cooked',
    TIPS_PREFIX: 'recipe:tips',
    SEARCH_PREFIX: 'recipe:search',
    COMMUNITY_PREFIX: 'recipe:community',
    BY_ID: (id: string) => `recipe:${id}`,
    VARIANTS: (recipeId: string) => `recipe:variants:${recipeId}`,
    INGREDIENTS: (filter: unknown) => `recipe:ingredients:${JSON.stringify(filter)}`,
    INGREDIENTS_AVAILABILITY: (recipeId: string, userId?: string) =>
      userId ? `recipe:${recipeId}:availability:${userId}` : `recipe:${recipeId}:availability`,
    TIPS: (filters: unknown) => `recipe:tips:${JSON.stringify(filters)}`,
    WITH_PANTRY: (recipeId: string, userId: string) => `recipe:${recipeId}:pantry:${userId}`,
    BY_USER: (userId: string) => `recipe:user:${userId}`,
    ALL: (filter: unknown, pagination: unknown) => `recipe:all:${JSON.stringify(filter)}:${JSON.stringify(pagination)}`,
    SEARCH: (filter: unknown) => `recipe:search:${JSON.stringify(filter)}`,
    COOKED: (filter: unknown) => `recipe:cooked:${JSON.stringify(filter)}`,
    RECENTLY_VIEWED: (filter: unknown) => `recipe:recently-viewed:${JSON.stringify(filter)}`,
    LATEST_COMMUNITY: () => `recipe:community:latest`,
    LATEST_COOKED_COMMUNITY: (limit?: number) => `recipe:community:cooked:${limit ?? 'all'}`,
  },
  INGREDIENT: {
    PREFIX: 'ingredient',
    FILTER_ACTIVE_PREFIX: 'ingredient:filter-active',
    ALL: (filter: unknown) => `ingredient:all:${JSON.stringify(filter)}`,
    FILTER_ACTIVE: () => `ingredient:filter-active`,
    BY_ID: (id: string) => `ingredient:${id}`,
    NUTRITIONAL: (ids: string[]) => `ingredient:nutritional:${ids.sort().join(',')}`,
  },
  PANTRY: {
    PREFIX: 'pantry:user',
    ITEM_PREFIX: 'pantry:item',
    TRANSACTIONS_PREFIX: 'pantry:transactions',
    PURCHASE_ORDER_PREFIX: 'pantry:purchase-order',
    BY_USER: (userId: string) => `pantry:user:${userId}`,
    BY_ID: (id: string) => `pantry:item:${id}`,
    TRANSACTIONS: (filter: unknown) => `pantry:transactions:${JSON.stringify(filter)}`,
    PURCHASE_ORDER: (userId: string) => `pantry:purchase-order:${userId}`,
  },
  MEALPLAN: {
    ACTIVE_PREFIX: 'mealplan:active',
    ENTRIES_PREFIX: 'mealplan:entries',
    SUGGESTED_PREFIX: 'mealplan:suggested',
    NUTRITION_PREFIX: 'mealplan:nutrition',
    ACTIVE: (filters: unknown) => `mealplan:active:${JSON.stringify(filters)}`,
    ENTRIES: (filters: unknown) => `mealplan:entries:${JSON.stringify(filters)}`,
    ENTRIES_TODAY: (userId: string) => `mealplan:entries:today:${userId}`,
    SUGGESTED_BY_ID: (id: string) => `mealplan:suggested:${id}`,
    SUGGESTED_ALL: (pagination: unknown, filter: unknown) => `mealplan:suggested:all:${JSON.stringify(pagination)}:${JSON.stringify(filter)}`,
    SUGGESTED_RECIPES: (filter: unknown) => `mealplan:suggested:recipes:${JSON.stringify(filter)}`,
    SUGGESTED_INGREDIENTS: (id: string) => `mealplan:suggested:ingredients:${id}`,
    SUGGESTED_RECIPE_ENTRY: (id: string) => `mealplan:suggested:entry:${id}`,
    SUGGESTED_BY_CATEGORY_ID: (categoryId: string) => `mealplan:suggested:category:${categoryId}`,
    SUGGESTED_BY_CATEGORY: (filter: unknown) => `mealplan:suggested:categories:${JSON.stringify(filter)}`,
    SUGGESTED_RANDOM: () => `mealplan:suggested:random`,
    RECIPE_ITEMS: (dto: unknown) => `mealplan:recipe-items:${JSON.stringify(dto)}`,
    NUTRITION_SUMMARY: (userId: string) => `mealplan:nutrition:${userId}`,
  },
  USER: {
    PREFIX: 'user',
    PREFERENCES_PREFIX: 'user:preferences',
    NUTRITION_PREFIX: 'user:nutrition',
    SAVED_RECIPES_PREFIX: 'user:saved-recipes',
    COOKED_PREFIX: 'user:cooked',
    HISTORY_PREFIX: 'user:history',
    BY_ID: (id: string) => `user:${id}`,
    PREFERENCES: (userId: string) => `user:preferences:${userId}`,
    NUTRITION: (userId: string) => `user:nutrition:${userId}`,
    NUTRITION_BY_ID: (id: string) => `user:nutrition:byid:${id}`,
    SAVED_RECIPES: (userId: string) => `user:saved-recipes:${userId}`,
    SAVED_RECIPE_ENTRIES: (userId: string) => `user:saved-recipes:entries:${userId}`,
    COOKED_RECIPES: (filter: unknown) => `user:cooked:${JSON.stringify(filter)}`,
    NUTRITIONAL_HISTORY: (filter: unknown) => `user:history:${JSON.stringify(filter)}`,
    WEEKLY_NUTRITION: (userId: string) => `user:history:weekly:${userId}`,
  },
  PURCHASE: {
    PREFIX: 'purchase',
    ITEMS_PREFIX: 'purchase:items',
    BY_ID: (id: string) => `purchase:${id}`,
    BY_USER: (userId: string) => `purchase:user:${userId}`,
    ORDER_ITEMS: (orderId: string) => `purchase:items:${orderId}`,
    CAN_CREATE: (userId: string) => `purchase:can-create:${userId}`,
  },
  SOCIAL: {
    FEED_PREFIX: 'social:feed',
    POSTS_PREFIX: 'social:posts',
    COMMENTS_PREFIX: 'social:comments',
    FOLLOWS_PREFIX: 'social:follows',
    PROFILE_PREFIX: 'social:profile',
    STATS_PREFIX: 'social:stats',
    GAMIFICATION_PREFIX: 'social:gamification',
    ACHIEVEMENTS_PREFIX: 'social:achievements',
    EXPLORE_PREFIX: 'social:explore',
    RECIPE_SOCIAL_PREFIX: 'social:recipe',
    FEED: (userId: string, followingOnly: boolean, pagination: unknown) =>
      `social:feed:${userId}:${followingOnly}:${JSON.stringify(pagination)}`,
    POST_BY_ID: (postId: string, currentUserId?: string) =>
      `social:posts:${postId}:${currentUserId ?? 'anon'}`,
    USER_POSTS: (userId: string, pagination: unknown) =>
      `social:posts:user:${userId}:${JSON.stringify(pagination)}`,
    POST_COMMENTS: (postId: string, pagination: unknown) =>
      `social:comments:${postId}:${JSON.stringify(pagination)}`,
    FOLLOWERS: (userId: string, pagination: unknown) =>
      `social:follows:followers:${userId}:${JSON.stringify(pagination)}`,
    FOLLOWING: (userId: string, pagination: unknown) =>
      `social:follows:following:${userId}:${JSON.stringify(pagination)}`,
    PROFILE: (userId: string, currentUserId?: string) =>
      `social:profile:${userId}:${currentUserId ?? 'anon'}`,
    PROFILE_CORE: (userId: string) => `social:profile:core:${userId}`,
    PROFILE_RECENT_ACTIVITY: (userId: string, currentUserId?: string) =>
      `social:profile:recent-activity:${userId}:${currentUserId ?? 'anon'}`,
    FOLLOW_STATUS: (followerId: string, followingId: string) =>
      `social:follows:status:${followerId}:${followingId}`,
    STATS: (userId: string) => `social:stats:${userId}`,
    STATS_PROFILE: (userId: string) => `social:stats:profile:${userId}`,
    STATS_FOLLOWERS_COUNT: (userId: string) =>
      `social:stats:followers-count:${userId}`,
    STATS_FOLLOWING_COUNT: (userId: string) =>
      `social:stats:following-count:${userId}`,
    STATS_POSTS_COUNT: (userId: string) => `social:stats:posts-count:${userId}`,
    STATS_RECIPES_CREATED_COUNT: (userId: string) =>
      `social:stats:recipes-created-count:${userId}`,
    GAMIFICATION_SUMMARY: (userId: string) => `social:gamification:${userId}`,
    ACHIEVEMENTS_ALL: () => `social:achievements:all`,
    USER_ACHIEVEMENTS: (userId: string) => `social:achievements:${userId}`,
    TRENDING_RECIPES: (filter: unknown) => `social:explore:trending-recipes:${JSON.stringify(filter)}`,
    TRENDING_INGREDIENTS: (filter: unknown) => `social:explore:trending-ingredients:${JSON.stringify(filter)}`,
    TOP_CHEFS: (limit?: number) => `social:explore:top-chefs:${limit ?? 'all'}`,
    EXPLORE: (filter: unknown) => `social:explore:data:${JSON.stringify(filter)}`,
    RECIPE_SOCIAL: (recipeId: string, currentUserId?: string) =>
      `social:recipe:${recipeId}:${currentUserId ?? 'anon'}`,
  },
  GAMIFICATION: {
    PROFILE_PREFIX: 'gamification:profile',
    SUMMARY_PREFIX: 'gamification:summary',
    XP_TODAY_PREFIX: 'gamification:xp-today',
    XP_WEEK_PREFIX: 'gamification:xp-week',
    RECENT_MILESTONES_PREFIX: 'gamification:recent-milestones',
    POINTS_PREFIX: 'gamification:points',
    STREAKS_PREFIX: 'gamification:streaks',
    MILESTONES_PREFIX: 'gamification:milestones',
    MASTERIES_PREFIX: 'gamification:masteries',
    WEEKLY_PREFIX: 'gamification:weekly',
    LEADERBOARD_PREFIX: 'gamification:leaderboard',
    CHALLENGES_PREFIX: 'gamification:challenges',
    USER_CHALLENGES_PREFIX: 'gamification:user-challenges',
    ALERTS_PREFIX: 'gamification:alerts',
    PROFILE: (userId: string) => `gamification:profile:${userId}`,
    SUMMARY: (userId: string) => `gamification:summary:${userId}`,
    XP_TODAY: (userId: string) => `gamification:xp-today:${userId}`,
    XP_WEEK: (userId: string) => `gamification:xp-week:${userId}`,
    RECENT_MILESTONES: (userId: string) => `gamification:recent-milestones:${userId}`,
    POINTS_LOG: (userId: string, filter: string) =>
      `gamification:points:${userId}:${filter}`,
    STREAKS: (userId: string) => `gamification:streaks:${userId}`,
    MILESTONES_ALL: () => `gamification:milestones:all`,
    USER_MILESTONES: (userId: string) =>
      `gamification:milestones:user:${userId}`,
    MASTERIES: (userId: string) => `gamification:masteries:${userId}`,
    WEEKLY_TITLE: (userId: string) => `gamification:weekly:title:${userId}`,
    LEADERBOARD: (filter: string) =>
      `gamification:leaderboard:${filter}`,
    CHALLENGES: (filter: string) =>
      `gamification:challenges:${filter}`,
    USER_CHALLENGES: (userId: string, activeOnly: boolean) =>
      `gamification:user-challenges:${userId}:${activeOnly}`,
    ALERTS: (userId: string) => `gamification:alerts:${userId}`,
  },
} as const;

// TTL constants (en milisegundos)
export const CacheTTL = {
  VERY_SHORT: 300_000,     // 5 minutos
  SHORT: 900_000,          // 15 minutos
  MEDIUM: 1_800_000,       // 30 minutos
  LONG: 3_600_000,         // 1 hora
  VERY_LONG: 86_400_000,   // 24 horas
} as const;
