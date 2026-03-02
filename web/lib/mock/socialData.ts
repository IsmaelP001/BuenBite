import {
  Achievement,
  Challenge,
  ChefTitle,
  DiscoveryRecipe,
  ExploreData,
  GamificationProfile,
  League,
  Mastery,
  Milestone,
  SearchUser,
  SocialComment,
  SocialInsight,
  SocialNotification,
  SocialPost,
  SocialProfile,
  SocialStats,
  StreakData,
  TrendingRecipe,
  UserAchievement,
  FollowUser,
} from "@/types/models/social";

// ─── Helper ───────────────────────────────────────────────────────────────────

const ago = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

const agoHours = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

// ─── Authors ──────────────────────────────────────────────────────────────────

const authors = {
  maria: { id: "u1", fullName: "María González", avatarUrl: "https://i.pravatar.cc/150?img=1", level: "chef" as const },
  carlos: { id: "u2", fullName: "Carlos Rodríguez", avatarUrl: "https://i.pravatar.cc/150?img=3", level: "master_chef" as const },
  ana: { id: "u3", fullName: "Ana Martínez", avatarUrl: "https://i.pravatar.cc/150?img=5", level: "cook" as const },
  pedro: { id: "u4", fullName: "Pedro López", avatarUrl: "https://i.pravatar.cc/150?img=8", level: "novice" as const },
  lucia: { id: "u5", fullName: "Lucía Fernández", avatarUrl: "https://i.pravatar.cc/150?img=9", level: "chef" as const },
  roberto: { id: "u6", fullName: "Roberto Díaz", avatarUrl: "https://i.pravatar.cc/150?img=11", level: "cook" as const },
  sofia: { id: "u7", fullName: "Sofía Herrera", avatarUrl: "https://i.pravatar.cc/150?img=16", level: "master_chef" as const },
  miguel: { id: "u8", fullName: "Miguel Torres", avatarUrl: "https://i.pravatar.cc/150?img=12", level: "cook" as const },
};

// ─── Mock Posts (Feed) ────────────────────────────────────────────────────────

export const mockFeedPosts: SocialPost[] = [
  {
    id: "p1",
    userId: "u1",
    postType: "manual",
    activityType: null,
    content: "¡Acabo de preparar esta increíble pasta carbonara! El secreto está en el huevo a temperatura ambiente 🍝✨",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    recipeId: "r1",
    metadata: null,
    isPublic: true,
    createdAt: agoHours(2),
    updatedAt: agoHours(2),
    author: authors.maria,
    recipe: { id: "r1", name: "Pasta Carbonara Clásica", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80" },
    likesCount: 24,
    commentsCount: 8,
    isLikedByCurrentUser: false,
  },
  {
    id: "p2",
    userId: "u2",
    postType: "activity",
    activityType: "recipe_cooked",
    content: "Preparé un risotto de hongos para la cena familiar. ¡Todos repitieron! 🍄",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
    recipeId: "r2",
    metadata: { cookingTime: 45 },
    isPublic: true,
    createdAt: agoHours(5),
    updatedAt: agoHours(5),
    author: authors.carlos,
    recipe: { id: "r2", name: "Risotto de Hongos Silvestres", image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&q=80" },
    likesCount: 42,
    commentsCount: 12,
    isLikedByCurrentUser: true,
  },
  {
    id: "p3",
    userId: "u3",
    postType: "activity",
    activityType: "recipe_created",
    content: "¡Nueva receta! Tacos al pastor caseros con piña asada. Paso a paso completo 🌮🔥",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    recipeId: "r3",
    metadata: null,
    isPublic: true,
    createdAt: agoHours(8),
    updatedAt: agoHours(8),
    author: authors.ana,
    recipe: { id: "r3", name: "Tacos al Pastor Caseros", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80" },
    likesCount: 67,
    commentsCount: 23,
    isLikedByCurrentUser: false,
  },
  {
    id: "p4",
    userId: "u5",
    postType: "activity",
    activityType: "achievement_unlocked",
    content: "🏆 ¡Acabo de desbloquear el logro 'Chef Maestro'! 100 recetas cocinadas.",
    image: null,
    recipeId: null,
    metadata: { achievementName: "Chef Maestro", achievementIcon: "👨‍🍳" },
    isPublic: true,
    createdAt: agoHours(12),
    updatedAt: agoHours(12),
    author: authors.lucia,
    recipe: null,
    likesCount: 89,
    commentsCount: 15,
    isLikedByCurrentUser: true,
  },
  {
    id: "p5",
    userId: "u4",
    postType: "manual",
    activityType: null,
    content: "Explorando la cocina japonesa por primera vez. Este ramen casero me tomó 6 horas pero valió cada minuto 🍜",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    recipeId: "r5",
    metadata: null,
    isPublic: true,
    createdAt: ago(1),
    updatedAt: ago(1),
    author: authors.pedro,
    recipe: { id: "r5", name: "Ramen Tonkotsu Casero", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" },
    likesCount: 156,
    commentsCount: 34,
    isLikedByCurrentUser: false,
  },
  {
    id: "p6",
    userId: "u7",
    postType: "activity",
    activityType: "streak_milestone",
    content: "🔥 ¡30 días consecutivos cocinando! La constancia es la clave.",
    image: null,
    recipeId: null,
    metadata: { streakDays: 30 },
    isPublic: true,
    createdAt: ago(1),
    updatedAt: ago(1),
    author: authors.sofia,
    recipe: null,
    likesCount: 203,
    commentsCount: 41,
    isLikedByCurrentUser: true,
  },
  {
    id: "p7",
    userId: "u6",
    postType: "manual",
    activityType: null,
    content: "Tip del día: Para un guacamole perfecto, el aguacate debe ceder ligeramente al presionarlo. ¡No lo licúen, mejor májenlo con tenedor! 🥑",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80",
    recipeId: null,
    metadata: null,
    isPublic: true,
    createdAt: ago(2),
    updatedAt: ago(2),
    author: authors.roberto,
    recipe: null,
    likesCount: 78,
    commentsCount: 19,
    isLikedByCurrentUser: false,
  },
  {
    id: "p8",
    userId: "u8",
    postType: "activity",
    activityType: "pantry_updated",
    content: "¡Despensa actualizada! Agregué 12 ingredientes frescos del mercado local 🥬🍅🧅",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
    recipeId: null,
    metadata: { itemsAdded: 12 },
    isPublic: true,
    createdAt: ago(2),
    updatedAt: ago(2),
    author: authors.miguel,
    recipe: null,
    likesCount: 31,
    commentsCount: 5,
    isLikedByCurrentUser: false,
  },
  {
    id: "p9",
    userId: "u1",
    postType: "activity",
    activityType: "tip_added",
    content: "Nuevo tip en la receta de Paella Valenciana: Usa arroz bomba para mejor absorción del caldo 🥘",
    image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=800&q=80",
    recipeId: "r9",
    metadata: null,
    isPublic: true,
    createdAt: ago(3),
    updatedAt: ago(3),
    author: authors.maria,
    recipe: { id: "r9", name: "Paella Valenciana Auténtica", image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80" },
    likesCount: 54,
    commentsCount: 11,
    isLikedByCurrentUser: false,
  },
  {
    id: "p10",
    userId: "u2",
    postType: "manual",
    activityType: null,
    content: "¿Cuál es su salsa favorita para acompañar carnes a la parrilla? Yo estoy entre chimichurri y salsa criolla 🔥🥩",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80",
    recipeId: null,
    metadata: null,
    isPublic: true,
    createdAt: ago(3),
    updatedAt: ago(3),
    author: authors.carlos,
    recipe: null,
    likesCount: 92,
    commentsCount: 47,
    isLikedByCurrentUser: true,
  },
];

// ─── Mock Comments ────────────────────────────────────────────────────────────

export const mockComments: SocialComment[] = [
  {
    id: "c1",
    postId: "p1",
    userId: "u2",
    parentCommentId: null,
    content: "¡Se ve espectacular María! ¿Usaste guanciale o panceta?",
    createdAt: agoHours(1),
    updatedAt: agoHours(1),
    author: authors.carlos,
    likesCount: 5,
    isLikedByCurrentUser: false,
    replies: [
      {
        id: "c1r1",
        postId: "p1",
        userId: "u1",
        parentCommentId: "c1",
        content: "¡Guanciale! Es la clave para el sabor auténtico 😄",
        createdAt: agoHours(0.5),
        updatedAt: agoHours(0.5),
        author: authors.maria,
        likesCount: 3,
        isLikedByCurrentUser: true,
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    postId: "p1",
    userId: "u3",
    parentCommentId: null,
    content: "La próxima vez que cocine carbonara voy a probar eso del huevo a temperatura ambiente. ¡Gracias por el tip! 🙏",
    createdAt: agoHours(1.5),
    updatedAt: agoHours(1.5),
    author: authors.ana,
    likesCount: 2,
    isLikedByCurrentUser: false,
    replies: [],
  },
  {
    id: "c3",
    postId: "p1",
    userId: "u5",
    parentCommentId: null,
    content: "Mi plato favorito italiano. ¡Esa presentación está de diez!",
    createdAt: agoHours(1.8),
    updatedAt: agoHours(1.8),
    author: authors.lucia,
    likesCount: 4,
    isLikedByCurrentUser: false,
    replies: [],
  },
  {
    id: "c4",
    postId: "p3",
    userId: "u6",
    parentCommentId: null,
    content: "¡Los tacos se ven increíbles! ¿Usaste piña natural o de lata?",
    createdAt: agoHours(6),
    updatedAt: agoHours(6),
    author: authors.roberto,
    likesCount: 1,
    isLikedByCurrentUser: false,
    replies: [
      {
        id: "c4r1",
        postId: "p3",
        userId: "u3",
        parentCommentId: "c4",
        content: "¡Piña natural siempre! La aso directo en la plancha para caramelizarla 🍍",
        createdAt: agoHours(5),
        updatedAt: agoHours(5),
        author: authors.ana,
        likesCount: 6,
        isLikedByCurrentUser: false,
        replies: [],
      },
    ],
  },
];

// ─── Mock Notifications ───────────────────────────────────────────────────────

export const mockNotifications: SocialNotification[] = [
  {
    id: "n1",
    userId: "current-user",
    actorId: "u1",
    type: "post_liked",
    referenceId: "p5",
    referenceType: "post",
    message: "le dio like a tu publicación",
    isRead: false,
    createdAt: agoHours(0.5),
    actor: authors.maria,
  },
  {
    id: "n2",
    userId: "current-user",
    actorId: "u2",
    type: "new_follower",
    referenceId: "u2",
    referenceType: "user",
    message: "comenzó a seguirte",
    isRead: false,
    createdAt: agoHours(1),
    actor: authors.carlos,
  },
  {
    id: "n3",
    userId: "current-user",
    actorId: "u3",
    type: "comment_added",
    referenceId: "p5",
    referenceType: "post",
    message: "comentó tu publicación",
    isRead: false,
    createdAt: agoHours(2),
    actor: authors.ana,
  },
  {
    id: "n4",
    userId: "current-user",
    actorId: "u5",
    type: "followed_user_posted",
    referenceId: "p4",
    referenceType: "post",
    message: "publicó algo nuevo",
    isRead: true,
    createdAt: agoHours(5),
    actor: authors.lucia,
  },
  {
    id: "n5",
    userId: "current-user",
    actorId: "u7",
    type: "achievement_unlocked",
    referenceId: "ach-3",
    referenceType: "achievement",
    message: "desbloqueó el logro 'Racha de 7 días'",
    isRead: true,
    createdAt: agoHours(12),
    actor: authors.sofia,
  },
  {
    id: "n6",
    userId: "current-user",
    actorId: "u4",
    type: "recipe_cooked_by_follower",
    referenceId: "p1",
    referenceType: "post",
    message: "cocinó tu receta 'Pasta Carbonara'",
    isRead: true,
    createdAt: ago(1),
    actor: authors.pedro,
  },
  {
    id: "n7",
    userId: "current-user",
    actorId: "u6",
    type: "comment_liked",
    referenceId: "p3",
    referenceType: "post",
    message: "le dio like a tu comentario",
    isRead: true,
    createdAt: ago(1),
    actor: authors.roberto,
  },
  {
    id: "n8",
    userId: "current-user",
    actorId: "u8",
    type: "followed_user_cooked",
    referenceId: "p2",
    referenceType: "post",
    message: "cocinó 'Risotto de Hongos'",
    isRead: true,
    createdAt: ago(2),
    actor: authors.miguel,
  },
];

// ─── Mock Profile ─────────────────────────────────────────────────────────────

export const mockProfile: SocialProfile = {
  user: {
    id: "u2",
    fullName: "Carlos Rodríguez",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    bio: "Chef apasionado | Amante de la cocina mediterránea y asiática 🍕🍣 | Compartiendo recetas desde 2020",
    registeredAt: "2020-03-15T00:00:00.000Z",
  },
  stats: {
    userId: "u2",
    recipesCreated: 47,
    recipesCooked: 234,
    followersCount: 1289,
    followingCount: 156,
    pantryItemsCount: 68,
    postsCount: 312,
    currentStreak: 14,
    longestStreak: 45,
    level: "master_chef",
    xp: 12450,
  },
  achievements: [],
  isFollowedByCurrentUser: true,
  recentActivity: mockFeedPosts.filter((p) => p.userId === "u2"),
};

export const mockMyProfile: SocialProfile = {
  user: {
    id: "current-user",
    fullName: "Mi Perfil",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    bio: "Cocinero amateur explorando sabores del mundo 🌍 | GoodBite lover",
    registeredAt: "2024-06-01T00:00:00.000Z",
  },
  stats: {
    userId: "current-user",
    recipesCreated: 12,
    recipesCooked: 89,
    followersCount: 234,
    followingCount: 67,
    pantryItemsCount: 45,
    postsCount: 56,
    currentStreak: 7,
    longestStreak: 21,
    level: "cook",
    xp: 4320,
  },
  achievements: [],
  isFollowedByCurrentUser: false,
  recentActivity: [],
};

export const mockStats: SocialStats = mockProfile.stats;

// ─── Mock Achievements ───────────────────────────────────────────────────────

export const mockAchievements: Achievement[] = [
  { id: "ach-1", type: "first_post", name: "Primera Publicación", description: "Comparte tu primera publicación", icon: "📝", requiredValue: 1 },
  { id: "ach-2", type: "recipes_cooked_10", name: "Chef Novato", description: "Cocina 10 recetas", icon: "👨‍🍳", requiredValue: 10 },
  { id: "ach-3", type: "streak_7_days", name: "Racha Semanal", description: "Cocina 7 días seguidos", icon: "🔥", requiredValue: 7 },
  { id: "ach-4", type: "streak_30_days", name: "Maestro Constante", description: "Cocina 30 días seguidos", icon: "💪", requiredValue: 30 },
  { id: "ach-5", type: "recipes_cooked_50", name: "Chef Experto", description: "Cocina 50 recetas", icon: "⭐", requiredValue: 50 },
  { id: "ach-6", type: "recipes_cooked_100", name: "Chef Maestro", description: "Cocina 100 recetas", icon: "🏆", requiredValue: 100 },
  { id: "ach-7", type: "social_butterfly", name: "Mariposa Social", description: "Consigue 50 seguidores", icon: "🦋", requiredValue: 50 },
  { id: "ach-8", type: "recipe_creator_10", name: "Creador Prolífico", description: "Crea 10 recetas originales", icon: "📖", requiredValue: 10 },
  { id: "ach-9", type: "pantry_master", name: "Maestro Despensero", description: "Mantén 50+ items en despensa", icon: "🏪", requiredValue: 50 },
  { id: "ach-10", type: "tip_master", name: "Consejero Chef", description: "Comparte 20 tips en recetas", icon: "💡", requiredValue: 20 },
];

export const mockUserAchievements: UserAchievement[] = [
  { id: "ua-1", userId: "u2", achievementId: "ach-1", unlockedAt: ago(180), achievement: mockAchievements[0] },
  { id: "ua-2", userId: "u2", achievementId: "ach-2", unlockedAt: ago(120), achievement: mockAchievements[1] },
  { id: "ua-3", userId: "u2", achievementId: "ach-3", unlockedAt: ago(90), achievement: mockAchievements[2] },
  { id: "ua-4", userId: "u2", achievementId: "ach-5", unlockedAt: ago(45), achievement: mockAchievements[4] },
  { id: "ua-5", userId: "u2", achievementId: "ach-6", unlockedAt: ago(10), achievement: mockAchievements[5] },
  { id: "ua-6", userId: "u2", achievementId: "ach-7", unlockedAt: ago(60), achievement: mockAchievements[6] },
];

// ─── Mock Explore ─────────────────────────────────────────────────────────────

export const mockExploreData: ExploreData = {
  trendingRecipes: [
    { recipeId: "r1", recipeName: "Pasta Carbonara Clásica", recipeImage: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80", cookedCount: 342, cookedThisWeek: 28, authorName: "María González", authorAvatarUrl: "https://i.pravatar.cc/150?img=1" },
    { recipeId: "r3", recipeName: "Tacos al Pastor", recipeImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80", cookedCount: 567, cookedThisWeek: 45, authorName: "Ana Martínez", authorAvatarUrl: "https://i.pravatar.cc/150?img=5" },
    { recipeId: "r5", recipeName: "Ramen Tonkotsu", recipeImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", cookedCount: 234, cookedThisWeek: 19, authorName: "Pedro López", authorAvatarUrl: "https://i.pravatar.cc/150?img=8" },
    { recipeId: "r9", recipeName: "Paella Valenciana", recipeImage: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80", cookedCount: 456, cookedThisWeek: 32, authorName: "María González", authorAvatarUrl: "https://i.pravatar.cc/150?img=1" },
    { recipeId: "r10", recipeName: "Sushi Rolls Variados", recipeImage: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80", cookedCount: 189, cookedThisWeek: 15, authorName: "Sofía Herrera", authorAvatarUrl: "https://i.pravatar.cc/150?img=16" },
    { recipeId: "r11", recipeName: "Ceviche Peruano", recipeImage: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800&q=80", cookedCount: 278, cookedThisWeek: 22, authorName: "Roberto Díaz", authorAvatarUrl: "https://i.pravatar.cc/150?img=11" },
  ],
  trendingIngredients: [
    { ingredientId: "ing-1", ingredientName: { es: "Aguacate", en: "Avocado", fr: "Avocat" }, usageCount: 1234, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=200&q=80" },
    { ingredientId: "ing-2", ingredientName: { es: "Tomate", en: "Tomato", fr: "Tomate" }, usageCount: 2345, image: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=200&q=80" },
    { ingredientId: "ing-3", ingredientName: { es: "Ajo", en: "Garlic", fr: "Ail" }, usageCount: 3456, image: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=200&q=80" },
    { ingredientId: "ing-4", ingredientName: { es: "Cebolla", en: "Onion", fr: "Oignon" }, usageCount: 2890, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&q=80" },
    { ingredientId: "ing-5", ingredientName: { es: "Limón", en: "Lemon", fr: "Citron" }, usageCount: 1567, image: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=200&q=80" },
  ],
  topChefs: [
    { userId: "u2", fullName: "Carlos Rodríguez", avatarUrl: "https://i.pravatar.cc/150?img=3", level: "master_chef", recipesCooked: 234, followersCount: 1289 },
    { userId: "u7", fullName: "Sofía Herrera", avatarUrl: "https://i.pravatar.cc/150?img=16", level: "master_chef", recipesCooked: 198, followersCount: 987 },
    { userId: "u1", fullName: "María González", avatarUrl: "https://i.pravatar.cc/150?img=1", level: "chef", recipesCooked: 156, followersCount: 743 },
    { userId: "u5", fullName: "Lucía Fernández", avatarUrl: "https://i.pravatar.cc/150?img=9", level: "chef", recipesCooked: 134, followersCount: 621 },
    { userId: "u3", fullName: "Ana Martínez", avatarUrl: "https://i.pravatar.cc/150?img=5", level: "cook", recipesCooked: 89, followersCount: 456 },
  ],
  featuredPosts: mockFeedPosts.slice(0, 3),
};

export const mockTrendingRecipes: TrendingRecipe[] = mockExploreData.trendingRecipes;

// ─── Mock Insights ────────────────────────────────────────────────────────────

export const mockInsights: SocialInsight[] = [
  { type: "followers_cooked", message: "5 personas cocinaron 'Pasta Carbonara' esta semana", recipeId: "r1", recipeName: "Pasta Carbonara Clásica", count: 5 },
  { type: "ingredients_available", message: "Tienes ingredientes para 3 recetas trending", count: 3 },
  { type: "expiring_ingredients", message: "2 ingredientes en tu despensa están por vencer. ¡Úsalos hoy!", count: 2 },
];

// ─── Mock Search Users ────────────────────────────────────────────────────────

export const mockSearchUsers: SearchUser[] = Object.values(authors).map((a) => ({
  userId: a.id,
  fullName: a.fullName,
  avatarUrl: a.avatarUrl,
  level: a.level,
}));

// ─── Mock Followers ───────────────────────────────────────────────────────────

export const mockFollowers: FollowUser[] = [
  { userId: "u1", fullName: "María González", avatarUrl: "https://i.pravatar.cc/150?img=1" },
  { userId: "u3", fullName: "Ana Martínez", avatarUrl: "https://i.pravatar.cc/150?img=5" },
  { userId: "u5", fullName: "Lucía Fernández", avatarUrl: "https://i.pravatar.cc/150?img=9" },
  { userId: "u6", fullName: "Roberto Díaz", avatarUrl: "https://i.pravatar.cc/150?img=11" },
  { userId: "u8", fullName: "Miguel Torres", avatarUrl: "https://i.pravatar.cc/150?img=12" },
];

export const mockFollowing: FollowUser[] = [
  { userId: "u2", fullName: "Carlos Rodríguez", avatarUrl: "https://i.pravatar.cc/150?img=3" },
  { userId: "u7", fullName: "Sofía Herrera", avatarUrl: "https://i.pravatar.cc/150?img=16" },
  { userId: "u4", fullName: "Pedro López", avatarUrl: "https://i.pravatar.cc/150?img=8" },
];

// ─── Mock Masteries ───────────────────────────────────────────────────────────

export const mockMasteries: Mastery[] = [
  {
    id: "mastery-social",
    category: "social",
    label: "Social",
    description: "Interacciones y comunidad",
    currentLevel: 3,
    currentXp: 720,
    nextLevelXp: 1000,
    maxLevel: 5,
    levels: [
      { level: 1, name: "Observador", requiredXp: 0, icon: "👁️" },
      { level: 2, name: "Participante", requiredXp: 200, icon: "💬" },
      { level: 3, name: "Influencer", requiredXp: 500, icon: "⭐" },
      { level: 4, name: "Líder", requiredXp: 1000, icon: "🌟" },
      { level: 5, name: "Leyenda Social", requiredXp: 2000, icon: "👑" },
    ],
  },
  {
    id: "mastery-chef",
    category: "chef",
    label: "Chef",
    description: "Recetas cocinadas y creadas",
    currentLevel: 4,
    currentXp: 1800,
    nextLevelXp: 2000,
    maxLevel: 5,
    levels: [
      { level: 1, name: "Aprendiz", requiredXp: 0, icon: "🥄" },
      { level: 2, name: "Cocinero", requiredXp: 200, icon: "🍳" },
      { level: 3, name: "Chef", requiredXp: 500, icon: "👨‍🍳" },
      { level: 4, name: "Chef Ejecutivo", requiredXp: 1000, icon: "🔥" },
      { level: 5, name: "Master Chef", requiredXp: 2000, icon: "💎" },
    ],
  },
  {
    id: "mastery-organizer",
    category: "organizer",
    label: "Organizador",
    description: "Gestión de despensa y compras",
    currentLevel: 2,
    currentXp: 350,
    nextLevelXp: 500,
    maxLevel: 5,
    levels: [
      { level: 1, name: "Principiante", requiredXp: 0, icon: "📦" },
      { level: 2, name: "Organizado", requiredXp: 200, icon: "🗂️" },
      { level: 3, name: "Gestor", requiredXp: 500, icon: "📊" },
      { level: 4, name: "Experto", requiredXp: 1000, icon: "🏗️" },
      { level: 5, name: "Maestro Logístico", requiredXp: 2000, icon: "🏛️" },
    ],
  },
  {
    id: "mastery-smart",
    category: "smart",
    label: "Smart",
    description: "Planificación y nutrición",
    currentLevel: 1,
    currentXp: 120,
    nextLevelXp: 200,
    maxLevel: 5,
    levels: [
      { level: 1, name: "Curioso", requiredXp: 0, icon: "🔍" },
      { level: 2, name: "Analítico", requiredXp: 200, icon: "📈" },
      { level: 3, name: "Planificador", requiredXp: 500, icon: "🧠" },
      { level: 4, name: "Estratega", requiredXp: 1000, icon: "🎯" },
      { level: 5, name: "Visionario", requiredXp: 2000, icon: "🔮" },
    ],
  },
];

// ─── Mock Milestones ──────────────────────────────────────────────────────────

export const mockMilestones: Milestone[] = [
  { id: "ms-1", name: "Primera Despensa", description: "Crea tu primera despensa", icon: "📦", unlockedAt: ago(90), isUnlocked: true, category: "first_steps" },
  { id: "ms-2", name: "Primera Receta", description: "Cocina tu primera receta", icon: "🍳", unlockedAt: ago(88), isUnlocked: true, category: "first_steps" },
  { id: "ms-3", name: "Primer Comentario", description: "Comenta en una publicación", icon: "💬", unlockedAt: ago(85), isUnlocked: true, category: "social" },
  { id: "ms-4", name: "Primer Seguidor", description: "Consigue tu primer seguidor", icon: "👤", unlockedAt: ago(80), isUnlocked: true, category: "social" },
  { id: "ms-5", name: "Primera Compra", description: "Completa tu primera lista de compra", icon: "🛒", unlockedAt: ago(75), isUnlocked: true, category: "pantry" },
  { id: "ms-6", name: "Primer Meal Plan", description: "Crea tu primer plan semanal", icon: "📅", unlockedAt: null, isUnlocked: false, category: "planning" },
  { id: "ms-7", name: "Receta Viral", description: "Una receta tuya cocinada por 10+", icon: "🚀", unlockedAt: null, isUnlocked: false, category: "social" },
  { id: "ms-8", name: "Despensa Llena", description: "Registra 50 ingredientes", icon: "🏪", unlockedAt: ago(30), isUnlocked: true, category: "pantry" },
  { id: "ms-9", name: "Chef Incansable", description: "Cocina 7 días seguidos", icon: "🔥", unlockedAt: ago(20), isUnlocked: true, category: "cooking" },
  { id: "ms-10", name: "Explorador", description: "Cocina recetas de 5 cocinas distintas", icon: "🌍", unlockedAt: null, isUnlocked: false, category: "cooking" },
];

// ─── Mock Streaks ─────────────────────────────────────────────────────────────

export const mockStreaks: StreakData[] = [
  {
    type: "recipes_cooked",
    label: "Recetas Cocinadas",
    currentStreak: 7,
    longestStreak: 21,
    unit: "días",
    icon: "🍳",
    lastActivity: agoHours(3),
    weekHistory: [true, true, true, false, true, true, true],
  },
  {
    type: "ingredients_registered",
    label: "Ingredientes Registrados",
    currentStreak: 3,
    longestStreak: 12,
    unit: "días",
    icon: "🥬",
    lastActivity: agoHours(8),
    weekHistory: [false, false, true, true, false, true, false],
  },
  {
    type: "days_active",
    label: "Días Activos",
    currentStreak: 14,
    longestStreak: 30,
    unit: "días",
    icon: "⚡",
    lastActivity: agoHours(1),
    weekHistory: [true, true, true, true, true, true, true],
  },
];

// ─── Mock Chef Titles ─────────────────────────────────────────────────────────

export const mockChefTitles: ChefTitle[] = [
  { id: "title-1", name: "Rey del Risotto", description: "Mayor cantidad de risottos esta semana", icon: "👑", awardedAt: ago(7), weekOf: ago(7), rarity: "rare" },
  { id: "title-2", name: "Explorador Culinario", description: "Más recetas de distintas cocinas", icon: "🌍", awardedAt: ago(14), weekOf: ago(14), rarity: "epic" },
  { id: "title-3", name: "Chef Constante", description: "Racha más larga de la semana", icon: "🔥", awardedAt: ago(21), weekOf: ago(21), rarity: "common" },
  { id: "title-4", name: "Inspiración de la Semana", description: "Post más likeado", icon: "💫", awardedAt: ago(2), weekOf: ago(2), rarity: "legendary" },
];

// ─── Mock Challenges ──────────────────────────────────────────────────────────

export const mockChallenges: Challenge[] = [
  {
    id: "ch-1",
    name: "Semana Mediterránea",
    description: "Cocina 5 recetas mediterráneas",
    icon: "🫒",
    status: "active",
    currentProgress: 3,
    targetProgress: 5,
    xpReward: 150,
    startsAt: ago(3),
    endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    category: "chef",
  },
  {
    id: "ch-2",
    name: "Social Butterfly",
    description: "Comenta en 10 publicaciones",
    icon: "🦋",
    status: "active",
    currentProgress: 7,
    targetProgress: 10,
    xpReward: 100,
    startsAt: ago(5),
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: "social",
  },
  {
    id: "ch-3",
    name: "Despensa Perfecta",
    description: "Registra 20 ingredientes frescos",
    icon: "🥗",
    status: "active",
    currentProgress: 12,
    targetProgress: 20,
    xpReward: 120,
    startsAt: ago(2),
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: "organizer",
  },
  {
    id: "ch-4",
    name: "Planificador Pro",
    description: "Crea 3 meal plans y sigue al menos 1",
    icon: "📋",
    status: "completed",
    currentProgress: 3,
    targetProgress: 3,
    xpReward: 200,
    startsAt: ago(10),
    endsAt: ago(3),
    category: "smart",
  },
];

// ─── Mock League ──────────────────────────────────────────────────────────────

export const mockLeague: League = {
  id: "league-w24",
  rank: "gold",
  name: "Liga Oro",
  weekOf: ago(0),
  startsAt: ago(3),
  endsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  promotionZone: 3,
  relegationZone: 3,
  currentUserPosition: 4,
  participants: [
    { userId: "u2", fullName: "Carlos Rodríguez", avatarUrl: "https://i.pravatar.cc/150?img=3", level: "master_chef", weeklyXp: 890, position: 1, trend: "up" },
    { userId: "u7", fullName: "Sofía Herrera", avatarUrl: "https://i.pravatar.cc/150?img=16", level: "master_chef", weeklyXp: 820, position: 2, trend: "same" },
    { userId: "u1", fullName: "María González", avatarUrl: "https://i.pravatar.cc/150?img=1", level: "chef", weeklyXp: 710, position: 3, trend: "up" },
    { userId: "current-user", fullName: "Mi Perfil", avatarUrl: "https://i.pravatar.cc/150?img=15", level: "cook", weeklyXp: 650, position: 4, trend: "up" },
    { userId: "u5", fullName: "Lucía Fernández", avatarUrl: "https://i.pravatar.cc/150?img=9", level: "chef", weeklyXp: 590, position: 5, trend: "down" },
    { userId: "u3", fullName: "Ana Martínez", avatarUrl: "https://i.pravatar.cc/150?img=5", level: "cook", weeklyXp: 480, position: 6, trend: "same" },
    { userId: "u6", fullName: "Roberto Díaz", avatarUrl: "https://i.pravatar.cc/150?img=11", level: "cook", weeklyXp: 420, position: 7, trend: "down" },
    { userId: "u4", fullName: "Pedro López", avatarUrl: "https://i.pravatar.cc/150?img=8", level: "novice", weeklyXp: 310, position: 8, trend: "down" },
    { userId: "u8", fullName: "Miguel Torres", avatarUrl: "https://i.pravatar.cc/150?img=12", level: "cook", weeklyXp: 240, position: 9, trend: "same" },
    { userId: "u9", fullName: "Laura Sánchez", avatarUrl: "https://i.pravatar.cc/150?img=20", level: "novice", weeklyXp: 180, position: 10, trend: "down" },
  ],
};

// ─── Mock Discovery Recipes (TikTok-style) ────────────────────────────────────

export const mockDiscoveryRecipes: DiscoveryRecipe[] = [
  {
    id: "dr-1", name: "Pasta Carbonara Clásica",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80",
    cookTime: 25, difficulty: "medium", calories: 520, matchScore: 95,
    matchReasons: ["Tienes 4/5 ingredientes", "Dieta compatible", "Te gusta la pasta"],
    authorName: "María González", authorAvatarUrl: "https://i.pravatar.cc/150?img=1", authorLevel: "chef",
    cookedCount: 342, likesCount: 1240, tags: ["italiana", "pasta", "rápida"],
  },
  {
    id: "dr-2", name: "Bowl de Açaí Tropical",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
    cookTime: 10, difficulty: "easy", calories: 320, matchScore: 88,
    matchReasons: ["Perfecta para desayuno", "Baja en calorías"],
    authorName: "Sofía Herrera", authorAvatarUrl: "https://i.pravatar.cc/150?img=16", authorLevel: "master_chef",
    cookedCount: 189, likesCount: 876, tags: ["saludable", "desayuno", "tropical"],
  },
  {
    id: "dr-3", name: "Tacos al Pastor Caseros",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    cookTime: 45, difficulty: "hard", calories: 430, matchScore: 82,
    matchReasons: ["Receta trending", "Tienes 3/6 ingredientes"],
    authorName: "Ana Martínez", authorAvatarUrl: "https://i.pravatar.cc/150?img=5", authorLevel: "cook",
    cookedCount: 567, likesCount: 2100, tags: ["mexicana", "carnes", "popular"],
  },
  {
    id: "dr-4", name: "Risotto de Hongos Silvestres",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80",
    cookTime: 40, difficulty: "medium", calories: 480, matchScore: 76,
    matchReasons: ["Alta valoración", "Cocina italiana favorita"],
    authorName: "Carlos Rodríguez", authorAvatarUrl: "https://i.pravatar.cc/150?img=3", authorLevel: "master_chef",
    cookedCount: 234, likesCount: 980, tags: ["italiana", "arroz", "gourmet"],
  },
  {
    id: "dr-5", name: "Salmón Teriyaki con Arroz",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    cookTime: 30, difficulty: "medium", calories: 550, matchScore: 71,
    matchReasons: ["Rica en proteínas", "Estilo asiático"], 
    authorName: "Lucía Fernández", authorAvatarUrl: "https://i.pravatar.cc/150?img=9", authorLevel: "chef",
    cookedCount: 312, likesCount: 1450, tags: ["japonesa", "pescado", "arroz"],
  },
  {
    id: "dr-6", name: "Ensalada César Gourmet",
    image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&q=80",
    cookTime: 15, difficulty: "easy", calories: 280, matchScore: 93,
    matchReasons: ["Tienes todos los ingredientes", "Rápida de preparar"],
    authorName: "Roberto Díaz", authorAvatarUrl: "https://i.pravatar.cc/150?img=11", authorLevel: "cook",
    cookedCount: 456, likesCount: 890, tags: ["ensalada", "rápida", "saludable"],
  },
  {
    id: "dr-7", name: "Ramen Tonkotsu Casero",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    cookTime: 180, difficulty: "hard", calories: 620, matchScore: 65,
    matchReasons: ["Receta popular", "Tendencia esta semana"],
    authorName: "Pedro López", authorAvatarUrl: "https://i.pravatar.cc/150?img=8", authorLevel: "novice",
    cookedCount: 156, likesCount: 2300, tags: ["japonesa", "sopas", "elaborada"],
  },
  {
    id: "dr-8", name: "Smoothie Verde Energético",
    image: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=800&q=80",
    cookTime: 5, difficulty: "easy", calories: 180, matchScore: 90,
    matchReasons: ["Ingredientes en despensa", "Ideal post-entreno"],
    authorName: "Miguel Torres", authorAvatarUrl: "https://i.pravatar.cc/150?img=12", authorLevel: "cook",
    cookedCount: 289, likesCount: 670, tags: ["bebida", "saludable", "rápida"],
  },
];

// ─── Mock Gamification Profile ────────────────────────────────────────────────

export const mockGamificationProfile: GamificationProfile = {
  masteries: mockMasteries,
  milestones: mockMilestones,
  streaks: mockStreaks,
  chefTitles: mockChefTitles,
  selectedTitleId: "title-4",
  activeChallenges: mockChallenges.filter((c) => c.status === "active"),
  league: mockLeague,
};
