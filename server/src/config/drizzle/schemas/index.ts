import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  boolean,
  date,
  decimal,
  doublePrecision,
  index,
  integer,
  json,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  unique,
  uuid
} from "drizzle-orm/pg-core";

export const usersSchema = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  email: text("email").notNull(),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const recipesSchema = pgTable("recipes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  parentRecipeId: uuid("parent_recipe_id").references((): AnyPgColumn => recipesSchema.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  prepTime: integer("prep_time"),
  recipeType: text("recipe_type").default("BRAND").notNull(),
  cookTime: integer("cook_time"),
  totalTime: integer("total_time").notNull().default(0),
  isSharedCommunity: boolean("is_shared_community").notNull().default(false),
  includeInSuggestedRecipes: boolean("is_include_in_suggested_recipes")
    .notNull()
    .default(true),
  servings: integer("servings"),
  dificulty: text("dificulty"),
  mealTypes: json("meal_types").notNull(),
  calories: doublePrecision("calories").notNull(),
  proteins: doublePrecision("protein").notNull(),
  fats: doublePrecision("fat").notNull(),
  carbs: doublePrecision("carbs").notNull(),
  instructions: json("instructions"),
  notes: text("notes"),
  image: text("image"),
  ingredientIds: uuid("ingredient_ids")
    .array()
    .notNull()
    .default(sql`ARRAY[]::uuid[]`),
  rating: integer("rating").notNull().default(0),
  tips: integer("tips").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  isDeleted: boolean("is_deleted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ingredientsSchema = pgTable(
  "ingredients",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name_es: text("name_es").notNull(),
    name_en: text("name_en").notNull(),
    name_fr: text("name_fr").notNull(),
    category: text("category").notNull(),
    cuisine:text('cuisine').notNull().default('italian'),
    image: text("image"),
    notes: text("notes"),
    alias: text("alias")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    // userId:uuid('userId').references(()=>usersSchema.id),
    isFilterActive: boolean("is_filter_active").default(false),
    calories_100g: real("calories").notNull(),
    protein_100g: real("protein").notNull(),
    fat_100g: real("fat").notNull(),
    carbohydrates_100g: real("carbohydrates").notNull(),
    conversions: jsonb("conversions").$type<{
      density: number;
      weight_per_unit: Record<string, number>;
      volume_per_unit: Record<string, number>;
      allowed_units: string[];
    }>(),
    creationType:text('creation_type'),
    isApproved:boolean('is_approved').notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    nameEsIdx: unique("ingredients_name_es_unique").on(
      t.name_en,
      t.name_es,
      t.name_fr
    ),
  })
);

// ====== NUEVAS TABLAS DE PREFERENCIAS ======

export const userPreferencesSchema = pgTable(
  "user_preferences",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" })
      .unique(),
    primaryGoal: text("primary_goal"),
    allergies: text("allergies")
      .array()
      .default(sql`'{}'::text[]`),
    dislikes: text("dislikes")
      .array()
      .default(sql`'{}'::text[]`),
    dietType: text("diet_type"),
    servings:integer('servings').notNull().default(1),
    isNutritionMetricsConfigured: boolean("is_nutrition_metrics_configured")
      .default(false)
      .notNull(),
    autoFilterByDiet: boolean("auto_filter_by_diet").notNull().default(true),
    lunchTime: text("lunch_time"),
    dinnerTime: text("dinner_time"),
    breakfastTime: text("breakfast_time"),
    activityLevel: text("activity_level"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
    goalIdx: index("user_preferences_goal_idx").on(table.primaryGoal),
  })
);

export const userNutritionMetrics = pgTable("user_nutrition_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id, { onDelete: "cascade" }),
  bmr: doublePrecision("bmr").notNull(),
  tdee: doublePrecision("tdee").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  weightChangePace: text("weight_change_pace").notNull(),
  dietType: text("diet_type").notNull(),
  primaryGoal: text("primary_goal").notNull(),
  activityMultiplier: doublePrecision("activity_multiplier").notNull(),
  activityLevel: text("activity_level").notNull(),
  currentBMI: doublePrecision("current_bmi").notNull(),
  bmiCategory: text("bmi_category").notNull(),
  goalBMI: doublePrecision("goal_bmi"),
  currentWeight: integer("current_weight").notNull(),
  weightUnit: text("weight_unit").notNull(),
  height: integer("height").notNull(),
  heightUnit: text("height_unit").notNull(),
  suggestedGoalWeight: doublePrecision("suggested_goal_weight"),
  totalWeightToChange: doublePrecision("total_weight_to_change"),
  calorieAdjustment: doublePrecision("calorie_adjustment"),
  dailyCaloriesTarget: doublePrecision("daily_calories_target"),
  dailyProteinTarget: doublePrecision("daily_protein_target"),
  dailyFatTarget: doublePrecision("daily_fat_target"),
  dailyCarbsTarget: doublePrecision("daily_carbs_target"),
  proteinPercentage: doublePrecision("protein_percentage"),
  fatPercentage: doublePrecision("fat_percentage"),
  carbsPercentage: doublePrecision("carbs_percentage"),
  weeklyWeightChange: doublePrecision("weekly_weight_change"),
  estimatedWeeks: doublePrecision("estimated_weeks"),
  estimatedMonths: doublePrecision("estimated_months"),
  estimatedCompletionDate: date("estimated_completion_date"),
  dailyWaterTarget: doublePrecision("daily_water_target"),
  isHealthyGoal: boolean("is_healthy_goal").default(true),
  warnings: jsonb("warnings").default([]),
  calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull(),
});

export const userNutritionMetricsHistorySchema = pgTable(
  "user_nutrition_metrics_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    bmr: doublePrecision("bmr").notNull(),
    tdee: doublePrecision("tdee").notNull(),
    age: integer("age").notNull(),
    gender: text("gender").notNull(),
    weightChangePace: text("weight_change_pace").notNull(),
    dietType: text("diet_type").notNull(),
    primaryGoal: text("primary_goal").notNull(),
    activityMultiplier: doublePrecision("activity_multiplier").notNull(),
    activityLevel: text("activity_level").notNull(),
    currentBMI: doublePrecision("current_bmi").notNull(),
    bmiCategory: text("bmi_category").notNull(),
    goalBMI: doublePrecision("goal_bmi"),
    currentWeight: integer("current_weight").notNull(),
    weightUnit: text("weight_unit").notNull(),
    height: integer("height").notNull(),
    heightUnit: text("height_unit").notNull(),
    suggestedGoalWeight: doublePrecision("suggested_goal_weight"),
    totalWeightToChange: doublePrecision("total_weight_to_change"),
    calorieAdjustment: doublePrecision("calorie_adjustment"),
    dailyCaloriesTarget: doublePrecision("daily_calories_target"),
    dailyProteinTarget: doublePrecision("daily_protein_target"),
    dailyFatTarget: doublePrecision("daily_fat_target"),
    dailyCarbsTarget: doublePrecision("daily_carbs_target"),
    proteinPercentage: doublePrecision("protein_percentage"),
    fatPercentage: doublePrecision("fat_percentage"),
    carbsPercentage: doublePrecision("carbs_percentage"),
    weeklyWeightChange: doublePrecision("weekly_weight_change"),
    estimatedWeeks: doublePrecision("estimated_weeks"),
    estimatedMonths: doublePrecision("estimated_months"),
    estimatedCompletionDate: date("estimated_completion_date"),
    dailyWaterTarget: doublePrecision("daily_water_target"),
    isHealthyGoal: boolean("is_healthy_goal").default(true),
    warnings: jsonb("warnings").default([]),
    calculatedAt: timestamp("calculated_at", { withTimezone: true }).notNull(),
  }
);

export const userActiveMealPlansSchema = pgTable(
  "user_active_meal_plans",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    suggestedMealPlanId: uuid("suggested_meal_plan_id").references(
      () => suggestedMealPlansSchema.id
    ),
    status: text("status").notNull().default("active"),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    totalRecipes: integer("total_recipes").notNull().default(0),
    completedRecipes: integer("completed_recipes").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("user_active_meal_plans_user_id_idx").on(table.userId),
    statusIdx: index("user_active_meal_plans_status_idx").on(table.status),
    userActiveIdx: index("user_active_meal_plans_user_active_idx").on(
      table.userId,
      table.status
    ),
  })
);

export const mealEntriesSchema = pgTable(
  "meal_entries",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    activeMealPlanId: uuid("active_meal_plan_id").references(
      () => userActiveMealPlansSchema.id,
      { onDelete: "cascade" }
    ),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    name:text('name'),
    plannedDate: date("planned_date").notNull(),
    mealType: text("meal_type").notNull(),
    servings: integer("servings").notNull().default(1),
    isCooked: boolean("is_cooked").notNull().default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("meal_entries_user_id_idx").on(table.userId),
    activePlanIdx: index("meal_entries_active_plan_idx").on(
      table.activeMealPlanId
    ),
    plannedDateIdx: index("meal_entries_planned_date_idx").on(
      table.plannedDate
    ),
    userDateIdx: index("meal_entries_user_date_idx").on(
      table.userId,
      table.plannedDate
    ),
  })
);

export const mealPlanHistorySchema = pgTable(
  "meal_plan_history",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    activeMealPlanId: uuid("active_meal_plan_id")
      .notNull()
      .references(() => userActiveMealPlansSchema.id),
    planName: text("plan_name").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    completedDate: date("completed_date"),
    finalStatus: text("final_status").notNull(),
    totalRecipes: integer("total_recipes").notNull(),
    completedRecipes: integer("completed_recipes").notNull(),
    completionPercentage: real("completion_percentage").notNull(),
    durationDays: integer("duration_days").notNull(),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("meal_plan_history_user_id_idx").on(table.userId),
    statusIdx: index("meal_plan_history_status_idx").on(table.finalStatus),
  })
);

export const suggestedMealPlanCategoriesSchema = pgTable(
  "suggested_meal_plan_categories",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: serial("sort_order").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    activeIdx: index("suggested_meal_plan_categories_active_idx").on(
      table.isActive
    ),
    sortOrderIdx: index("suggested_meal_plan_categories_sort_order_idx").on(
      table.sortOrder
    ),
  })
);

export const suggestedMealPlansSchema = pgTable(
  "suggested_meal_plans",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => suggestedMealPlanCategoriesSchema.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    description: text("description"),
    dietType: text("diet_type").notNull(),
    durationDays: integer("duration_days").notNull().default(7),
    dailyCaloriesAvg: doublePrecision("daily_calories").notNull().default(3700),
    dailyProteinsAvg: doublePrecision("daily_proteins").notNull().default(200),
    dailyFatsAvg: doublePrecision("daily_fats").notNull().default(100),
    dailyCarbsAvg: doublePrecision("daily_carbs").notNull().default(400),
    isVeganFriendly: boolean("is_vegan_friendly").notNull().default(false),
    isVegetarianFriendly: boolean("is_vegetarian_friendly")
      .notNull()
      .default(false),
    isGlutenFreeFriendly: boolean("is_gluten_free_friendly")
      .notNull()
      .default(false),
    suitableForGoals: text("suitable_for_goals")
      .array()
      .default(sql`'{}'::text[]`), // ["lose_weight", "build_muscle"]
    difficulty: text("difficulty"),
    tags: text("tags").array(),
    imageUrl: text("image_url"),
    sortOrder: serial("sort_order").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdIdx: index("suggested_meal_plans_category_id_idx").on(
      table.categoryId
    ),
    dietTypeIdx: index("suggested_meal_plans_diet_type_idx").on(table.dietType),
    activeIdx: index("suggested_meal_plans_active_idx").on(table.isActive),
    difficultyIdx: index("suggested_meal_plans_difficulty_idx").on(
      table.difficulty
    ),
    sortOrderIdx: index("suggested_meal_plans_sort_order_idx").on(
      table.sortOrder
    ),
  })
);

export const suggestedMealPlanRecipesSchema = pgTable(
  "suggested_meal_plan_recipes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    suggestedMealPlanId: uuid("suggested_meal_plan_id")
      .notNull()
      .references(() => suggestedMealPlansSchema.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    dayNumber: integer("day_number").notNull(),
    mealType: text("meal_type").notNull(),
    servings: integer("servings").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    planIdIdx: index("suggested_meal_plan_recipes_plan_id_idx").on(
      table.suggestedMealPlanId
    ),
    dayIdx: index("suggested_meal_plan_recipes_day_idx").on(table.dayNumber),
    planDayIdx: index("suggested_meal_plan_recipes_plan_day_idx").on(
      table.suggestedMealPlanId,
      table.dayNumber
    ),
  })
);

export const userSavedRecipesSchema = pgTable(
  "user_saved_recipes",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at").notNull().defaultNow(),
    isFavorite: boolean("is_favorite").notNull().default(false),
  },
  (table) => ({
    userRecipeUnique: unique("user_recipe_saved_unique").on(
      table.userId,
      table.recipeId
    ),
    userIdIdx: index("user_saved_recipes_user_id_idx").on(table.userId),
    recipeIdIdx: index("user_saved_recipes_recipe_id_idx").on(table.recipeId),
    savedAtIdx: index("user_saved_recipes_saved_at_idx").on(table.savedAt),
    favoriteIdx: index("user_saved_recipes_favorite_idx").on(table.isFavorite),
  })
);

export const recipeCooksSchema = pgTable(
  "recipe_cooks",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    image: text("image"),
    notes: text("notes"),
    rating:integer('rating'),
    servings: doublePrecision("servings").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("recipe_cooks_user_id_idx").on(table.userId),
    recipeIdIdx: index("recipe_cooks_recipe_id_idx").on(table.recipeId),
  })
);

export const userNutritionalHistorySchema = pgTable(
  "user_nutritional_history",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id, { onDelete: "cascade" }),

    recipeId: uuid("recipe_id")
      .references(() => recipesSchema.id, { onDelete: "cascade" }),
    calories: decimal("calories_per_portion", {
      precision: 8,
      scale: 2,
    }),
    proteins: decimal("protein_per_portion", {
      precision: 8,
      scale: 2,
    }),
    carbohydrates: decimal("carbs_per_portion", { precision: 8, scale: 2 }),
    fats: decimal("fat_per_portion", { precision: 8, scale: 2 }),
    dailyCaloriesTarget: doublePrecision("daily_calories_target").notNull(),
    dailyProteinTarget: doublePrecision("daily_protein_target").notNull(),
    dailyFatTarget: doublePrecision("daily_fat_target").notNull(),
    dailyCarbsTarget: doublePrecision("daily_carbs_target").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  }
);

export const recipeRatingsSchema = pgTable(
  "recipe_ratings",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userRecipeUnique: unique("user_recipe_rating_unique").on(
      table.userId,
      table.recipeId
    ),
    userIdIdx: index("recipe_ratings_user_id_idx").on(table.userId),
    recipeIdIdx: index("recipe_ratings_recipe_id_idx").on(table.recipeId),
  })
);

export const recipeMetricsSchema = pgTable(
  "recipe_metrics_schema",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id"),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    date: date("planned_date").notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    cookedCount: integer("cooked_count").default(0).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userSessionUnique: unique("user_recipe_session_unique").on(
      table.recipeId,
      table.date
    ),
    recipeIdIdx: index("recipe_view_recipe_id_idx").on(table.recipeId),
  })
);

export const recipeViewsSchema = pgTable(
  "recipe_views",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id"),
    sessionId: text("session_id").notNull(),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    recipeIdIdx: index("recipe_views_recipe_id_idx").on(table.recipeId),
    userIdIdx: index("recipe_views_user_id_idx").on(table.userId),
    createdAtIdx: index("recipe_views_created_at_idx").on(table.createdAt),
  })
);

export const recipeTipsSchema = pgTable(
  "recipe_tips",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipesSchema.id),
    tip: text("tip").notNull(),
    image: text("image"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("recipe_tips_user_id_idx").on(table.userId),
    recipeIdIdx: index("recipe_tips_recipe_id_idx").on(table.recipeId),
    activeIdx: index("recipe_tips_active_idx").on(table.isActive),
    recipeActiveIdx: index("recipe_tips_recipe_active_idx").on(
      table.recipeId,
      table.isActive
    ),
  })
);

export const pantrySchema = pgTable(
  "pantry",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id),
    ingredientId: uuid("ingredient_id")
      .references(() => ingredientsSchema.id)
      .notNull(),
    expirationDate: timestamp("expiration_date", { mode: "string" }),
    isRecurrent: boolean("is_recurrent").notNull().default(false),
    recurrentAmount: doublePrecision("recurrent_amount").notNull().default(0),
    brand: text("brand"),
    measurementType: text("measurement_type").notNull(),
    pendingPurchaseQuantity: integer("pending_purchase_quantity")
      .notNull()
      .default(0),
    measurementValue: doublePrecision("measurement_value").notNull(),
    lowValueAlert: integer("low_value_alert").default(0),
    isDeleted: boolean("is_deleted").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.ingredientId, t.userId)]
);

export const pantryIngredientMeasurementsEventsSchema = pgTable(
  "pantry_ingredients_measurements_events",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredientsSchema.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersSchema.id),
    transactionType: text("transaction_type").notNull(),
    recipeName: text("recipe_name"),
    measurementType: text("measurement_type").notNull(),
    measurementValue: doublePrecision("measurement_value").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  }
);

export const recipeIngredientsSchema = pgTable("recipe_ingredients", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipesSchema.id),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredientsSchema.id),
  ingredientName: text("ingredient_name").notNull(),
  measurementType: text("measurement_type").notNull(),
  measurementValue: doublePrecision("measurement_value").notNull(),
  notes: text("notes"),
});

export const purchasesSchema = pgTable("purchases", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  orderNumber: serial("order_number"),
  purchaseDate: date("purchase_date").notNull(),
  status: text("status").notNull(),
  totalItems: real("total").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
},);

export const purchaseItemsSchema = pgTable("purchase_items", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  purchaseId: uuid("purchase_id")
    .notNull()
    .references(() => purchasesSchema.id),
  ingredientId: uuid("ingredient_id").references(() => ingredientsSchema.id),
  measurementType: text("measurement_type").notNull(),
  amountToBuy: integer("amount_to_buy").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
    purchaseIdIngredientIdUnique: unique().on(table.purchaseId,table.ingredientId),
  }));

export const purchaseItemEventsSchema = pgTable("purchase_item_events", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  purchaseItemId: uuid("purchase_item_id").references(
    () => purchaseItemsSchema.id
  ),
  transactionType: text("transaction_type").notNull(),
  measurementValue: integer("measurement_value").notNull(),
  measurementType: text("measurement_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shoppingListSchema = pgTable("shopping_list", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredientsSchema.id),
  quantity: real("quantity").notNull(),
  measurementType: text("measurement_type").notNull(),
  measurementValue: real("measurement_value").notNull(),
  priority: integer("priority").default(0),
  completed: boolean("completed").notNull().default(false),
});

// ====== RELATIONS COMPLETAS ======

export const usersRelations = relations(usersSchema, ({ many, one }) => ({
  recipes: many(recipesSchema),
  pantry: many(pantrySchema),
  purchases: many(purchasesSchema),
  shoppingList: many(shoppingListSchema),
  events: many(pantryIngredientMeasurementsEventsSchema),
  ratings: many(recipeRatingsSchema),
  tips: many(recipeTipsSchema),
  cook: many(recipeCooksSchema),
  savedRecipes: many(userSavedRecipesSchema),
  nutritionalHistory: many(userNutritionalHistorySchema),
  activeMealPlans: many(userActiveMealPlansSchema),
  mealEntries: many(mealEntriesSchema),
  mealPlanHistory: many(mealPlanHistorySchema),
  userNutritionMetrics: many(userNutritionMetrics),
  preferences: one(userPreferencesSchema, {
    fields: [usersSchema.id],
    references: [userPreferencesSchema.userId],
  }),
  // ingredients:many(ingredientsSchema)
}));

export const userPreferencesRelations = relations(
  userPreferencesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userPreferencesSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const userNutritionMetricsRelations = relations(
  userNutritionMetrics,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userNutritionMetrics.userId],
      references: [usersSchema.id],
    }),
  })
);

export const userActiveMealPlansRelations = relations(
  userActiveMealPlansSchema,
  ({ one, many }) => ({
    user: one(usersSchema, {
      fields: [userActiveMealPlansSchema.userId],
      references: [usersSchema.id],
    }),
    suggestedMealPlan: one(suggestedMealPlansSchema, {
      fields: [userActiveMealPlansSchema.suggestedMealPlanId],
      references: [suggestedMealPlansSchema.id],
    }),
    mealEntries: many(mealEntriesSchema),
    history: many(mealPlanHistorySchema),
  })
);

export const mealEntriesRelations = relations(mealEntriesSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [mealEntriesSchema.userId],
    references: [usersSchema.id],
  }),
  activeMealPlan: one(userActiveMealPlansSchema, {
    fields: [mealEntriesSchema.activeMealPlanId],
    references: [userActiveMealPlansSchema.id],
  }),
  recipe: one(recipesSchema, {
    fields: [mealEntriesSchema.recipeId],
    references: [recipesSchema.id],
  }),
}));

export const mealPlanHistoryRelations = relations(
  mealPlanHistorySchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [mealPlanHistorySchema.userId],
      references: [usersSchema.id],
    }),
    activeMealPlan: one(userActiveMealPlansSchema, {
      fields: [mealPlanHistorySchema.activeMealPlanId],
      references: [userActiveMealPlansSchema.id],
    }),
  })
);

export const userSavedRecipesRelations = relations(
  userSavedRecipesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userSavedRecipesSchema.userId],
      references: [usersSchema.id],
    }),
    recipe: one(recipesSchema, {
      fields: [userSavedRecipesSchema.recipeId],
      references: [recipesSchema.id],
    }),
  })
);

export const suggestedMealPlanCategoriesRelations = relations(
  suggestedMealPlanCategoriesSchema,
  ({ many }) => ({
    mealPlans: many(suggestedMealPlansSchema),
  })
);

export const suggestedMealPlansRelations = relations(
  suggestedMealPlansSchema,
  ({ many, one }) => ({
    recipes: many(suggestedMealPlanRecipesSchema),
    category: one(suggestedMealPlanCategoriesSchema, {
      fields: [suggestedMealPlansSchema.categoryId],
      references: [suggestedMealPlanCategoriesSchema.id],
    }),
    activeInstances: many(userActiveMealPlansSchema),
  })
);

export const suggestedMealPlanRecipesRelations = relations(
  suggestedMealPlanRecipesSchema,
  ({ one }) => ({
    suggestedMealPlan: one(suggestedMealPlansSchema, {
      fields: [suggestedMealPlanRecipesSchema.suggestedMealPlanId],
      references: [suggestedMealPlansSchema.id],
    }),
    recipe: one(recipesSchema, {
      fields: [suggestedMealPlanRecipesSchema.recipeId],
      references: [recipesSchema.id],
    }),
  })
);

export const ingredientsRelations = relations(
  ingredientsSchema,
  ({ many,one }) => ({
    shoppingList: many(shoppingListSchema),
    pantry: many(pantrySchema),
    recipeIngredients: many(recipeIngredientsSchema),
    pantryEvents:many(pantryIngredientMeasurementsEventsSchema),
    // user:one(usersSchema,{
    //   fields:[ingredientsSchema.userId],
    //   references:[usersSchema.id]
    // })
  })
);

export const recipesRelations = relations(recipesSchema, ({ one, many }) => ({
  user: one(usersSchema, {
    fields: [recipesSchema.userId],
    references: [usersSchema.id],
  }),
  ingredients: many(recipeIngredientsSchema),
  ratings: many(recipeRatingsSchema),
  tips: many(recipeTipsSchema),
  cook: many(recipeCooksSchema),
  savedByUsers: many(userSavedRecipesSchema),
  nutritionalHistory: many(userNutritionalHistorySchema),
  views: many(recipeViewsSchema),
  metrics: many(recipeMetricsSchema),
  mealEntries: many(mealEntriesSchema),
  suggestedMealRecipes: many(suggestedMealPlanRecipesSchema),
  parentRecipe: one(recipesSchema, {
    fields: [recipesSchema.parentRecipeId],
    references: [recipesSchema.id],
    relationName: "recipeVariants",
  }),
  variants: many(recipesSchema, {
    relationName: "recipeVariants",
  }),
}));

export const recipeRatingsRelations = relations(
  recipeRatingsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [recipeRatingsSchema.userId],
      references: [usersSchema.id],
    }),
    recipe: one(recipesSchema, {
      fields: [recipeRatingsSchema.recipeId],
      references: [recipesSchema.id],
    }),
  })
);

export const recipeCooksRelations = relations(recipeCooksSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [recipeCooksSchema.userId],
    references: [usersSchema.id],
  }),
  recipe: one(recipesSchema, {
    fields: [recipeCooksSchema.recipeId],
    references: [recipesSchema.id],
  }),
}));

export const userNutritionalHistoryRelations = relations(
  userNutritionalHistorySchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userNutritionalHistorySchema.userId],
      references: [usersSchema.id],
    }),
    recipe: one(recipesSchema, {
      fields: [userNutritionalHistorySchema.recipeId],
      references: [recipesSchema.id],
    }),
  })
);

export const recipeTipssRelations = relations(recipeTipsSchema, ({ one }) => ({
  user: one(usersSchema, {
    fields: [recipeTipsSchema.userId],
    references: [usersSchema.id],
  }),
  recipe: one(recipesSchema, {
    fields: [recipeTipsSchema.recipeId],
    references: [recipesSchema.id],
  }),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredientsSchema,
  ({ one }) => ({
    recipe: one(recipesSchema, {
      fields: [recipeIngredientsSchema.recipeId],
      references: [recipesSchema.id],
    }),
    ingredient: one(ingredientsSchema, {
      fields: [recipeIngredientsSchema.ingredientId],
      references: [ingredientsSchema.id],
    }),
  })
);

export const recipeViewsRelations = relations(recipeViewsSchema, ({ one }) => ({
  recipe: one(recipesSchema, {
    fields: [recipeViewsSchema.recipeId],
    references: [recipesSchema.id],
  }),
}));

export const recipeMetricsRelations = relations(
  recipeMetricsSchema,
  ({ one }) => ({
    recipe: one(recipesSchema, {
      fields: [recipeMetricsSchema.recipeId],
      references: [recipesSchema.id],
    }),
  })
);
export const pantryRelations = relations(pantrySchema, ({ one, many }) => ({
  user: one(usersSchema, {
    fields: [pantrySchema.userId],
    references: [usersSchema.id],
  }),
  ingredient: one(ingredientsSchema, {
    fields: [pantrySchema.ingredientId],
    references: [ingredientsSchema.id],
  }),
}));

export const pantryIngredientMeasurementsRelations = relations(
  pantryIngredientMeasurementsEventsSchema,
  ({ one }) => ({
    pantry: one(ingredientsSchema, {
      fields: [pantryIngredientMeasurementsEventsSchema.ingredientId],
      references: [ingredientsSchema.id],
    }),
    user: one(usersSchema, {
      fields: [pantryIngredientMeasurementsEventsSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const purchasesRelations = relations(
  purchasesSchema,
  ({ one, many }) => ({
    user: one(usersSchema, {
      fields: [purchasesSchema.userId],
      references: [usersSchema.id],
    }),
    items: many(purchaseItemsSchema),
  })
);

export const purchaseItemsRelations = relations(
  purchaseItemsSchema,
  ({ one, many }) => ({
    purchase: one(purchasesSchema, {
      fields: [purchaseItemsSchema.purchaseId],
      references: [purchasesSchema.id],
    }),
    ingredients: one(ingredientsSchema, {
      fields: [purchaseItemsSchema.ingredientId],
      references: [ingredientsSchema.id],
    }),
    events: many(purchaseItemEventsSchema),
  })
);

export const purchaseItemEventsRelations = relations(
  purchaseItemEventsSchema,
  ({ one }) => ({
    purchaseItem: one(purchaseItemsSchema, {
      fields: [purchaseItemEventsSchema.purchaseItemId],
      references: [purchaseItemsSchema.id],
    }),
  })
);

export const shoppingListRelations = relations(
  shoppingListSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [shoppingListSchema.userId],
      references: [usersSchema.id],
    }),
    ingredient: one(ingredientsSchema, {
      fields: [shoppingListSchema.ingredientId],
      references: [ingredientsSchema.id],
    }),
  })
);

// ════════════════════════════════════════════════════════════════════════
// ─── SOCIAL NETWORK SCHEMAS ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

// ── User Bio Extension ──────────────────────────────────────────────
export const userProfilesSchema = pgTable("user_profiles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersSchema.id),
  bio: text("bio"),
  level: text("level").notNull().default("novice"),
  xp: integer("xp").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastCookedDate: date("last_cooked_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Social Posts ────────────────────────────────────────────────────
export const socialPostsSchema = pgTable("social_posts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  postType: text("post_type").notNull().default("manual"), // manual | activity
  activityType: text("activity_type"), // recipe_cooked, pantry_item_added, etc.
  content: text("content"),
  image: text("image"),
  recipeId: uuid("recipe_id").references(() => recipesSchema.id),
  metadata: jsonb("metadata"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("social_posts_user_id_idx").on(table.userId),
  createdAtIdx: index("social_posts_created_at_idx").on(table.createdAt),
  postTypeIdx: index("social_posts_post_type_idx").on(table.postType),
}));

// ── Post Comments ───────────────────────────────────────────────────
export const postCommentsSchema = pgTable("post_comments", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  postId: uuid("post_id")
    .notNull()
    .references(() => socialPostsSchema.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  parentCommentId: uuid("parent_comment_id"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  postIdIdx: index("post_comments_post_id_idx").on(table.postId),
  parentIdx: index("post_comments_parent_idx").on(table.parentCommentId),
}));

// ── Post Likes ──────────────────────────────────────────────────────
export const postLikesSchema = pgTable("post_likes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  postId: uuid("post_id")
    .notNull()
    .references(() => socialPostsSchema.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueLike: unique("post_likes_unique").on(table.userId, table.postId),
  postIdIdx: index("post_likes_post_id_idx").on(table.postId),
}));

// ── Comment Likes ───────────────────────────────────────────────────
export const commentLikesSchema = pgTable("comment_likes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => postCommentsSchema.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueCommentLike: unique("comment_likes_unique").on(table.userId, table.commentId),
}));

// ── User Follows ────────────────────────────────────────────────────
export const userFollowsSchema = pgTable("user_follows", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  followerId: uuid("follower_id")
    .notNull()
    .references(() => usersSchema.id),
  followingId: uuid("following_id")
    .notNull()
    .references(() => usersSchema.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueFollow: unique("user_follows_unique").on(table.followerId, table.followingId),
  followerIdx: index("user_follows_follower_idx").on(table.followerId),
  followingIdx: index("user_follows_following_idx").on(table.followingId),
}));

// ── Achievements (Definition Table) ─────────────────────────────────
export const achievementsSchema = pgTable("achievements", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requiredValue: integer("required_value").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── User Achievements (Unlocked) ────────────────────────────────────
export const userAchievementsSchema = pgTable("user_achievements", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievementsSchema.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserAchievement: unique("user_achievements_unique").on(table.userId, table.achievementId),
}));

// ── Social Notifications ────────────────────────────────────────────
export const socialNotificationsSchema = pgTable("social_notifications", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => usersSchema.id),
  type: text("type").notNull(),
  referenceId: uuid("reference_id"),
  referenceType: text("reference_type"),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("social_notifications_user_id_idx").on(table.userId),
  isReadIdx: index("social_notifications_is_read_idx").on(table.isRead),
}));

// ── Shared Recipes ──────────────────────────────────────────────────
export const sharedRecipesSchema = pgTable("shared_recipes", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipesSchema.id),
  sharedByUserId: uuid("shared_by_user_id")
    .notNull()
    .references(() => usersSchema.id),
  sharedToUserId: uuid("shared_to_user_id").references(() => usersSchema.id),
  shareType: text("share_type").notNull(), // internal | public_link | whatsapp
  shareToken: text("share_token"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ════════════════════════════════════════════════════════════════════════
// ─── SOCIAL RELATIONS ──────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

export const userProfilesRelations = relations(
  userProfilesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userProfilesSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const socialPostsRelations = relations(
  socialPostsSchema,
  ({ one, many }) => ({
    author: one(usersSchema, {
      fields: [socialPostsSchema.userId],
      references: [usersSchema.id],
    }),
    recipe: one(recipesSchema, {
      fields: [socialPostsSchema.recipeId],
      references: [recipesSchema.id],
    }),
    comments: many(postCommentsSchema),
    likes: many(postLikesSchema),
  })
);

export const postCommentsRelations = relations(
  postCommentsSchema,
  ({ one, many }) => ({
    post: one(socialPostsSchema, {
      fields: [postCommentsSchema.postId],
      references: [socialPostsSchema.id],
    }),
    author: one(usersSchema, {
      fields: [postCommentsSchema.userId],
      references: [usersSchema.id],
    }),
    likes: many(commentLikesSchema),
  })
);

export const postLikesRelations = relations(
  postLikesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [postLikesSchema.userId],
      references: [usersSchema.id],
    }),
    post: one(socialPostsSchema, {
      fields: [postLikesSchema.postId],
      references: [socialPostsSchema.id],
    }),
  })
);

export const commentLikesRelations = relations(
  commentLikesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [commentLikesSchema.userId],
      references: [usersSchema.id],
    }),
    comment: one(postCommentsSchema, {
      fields: [commentLikesSchema.commentId],
      references: [postCommentsSchema.id],
    }),
  })
);

export const userFollowsRelations = relations(
  userFollowsSchema,
  ({ one }) => ({
    follower: one(usersSchema, {
      fields: [userFollowsSchema.followerId],
      references: [usersSchema.id],
      relationName: "follower",
    }),
    following: one(usersSchema, {
      fields: [userFollowsSchema.followingId],
      references: [usersSchema.id],
      relationName: "following",
    }),
  })
);

export const userAchievementsRelations = relations(
  userAchievementsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userAchievementsSchema.userId],
      references: [usersSchema.id],
    }),
    achievement: one(achievementsSchema, {
      fields: [userAchievementsSchema.achievementId],
      references: [achievementsSchema.id],
    }),
  })
);

export const socialNotificationsRelations = relations(
  socialNotificationsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [socialNotificationsSchema.userId],
      references: [usersSchema.id],
      relationName: "notificationUser",
    }),
    actor: one(usersSchema, {
      fields: [socialNotificationsSchema.actorId],
      references: [usersSchema.id],
      relationName: "notificationActor",
    }),
  })
);

export const sharedRecipesRelations = relations(
  sharedRecipesSchema,
  ({ one }) => ({
    recipe: one(recipesSchema, {
      fields: [sharedRecipesSchema.recipeId],
      references: [recipesSchema.id],
    }),
    sharedBy: one(usersSchema, {
      fields: [sharedRecipesSchema.sharedByUserId],
      references: [usersSchema.id],
      relationName: "sharedBy",
    }),
    sharedTo: one(usersSchema, {
      fields: [sharedRecipesSchema.sharedToUserId],
      references: [usersSchema.id],
      relationName: "sharedTo",
    }),
  })
);

// ════════════════════════════════════════════════════════════════════════
// ─── GAMIFICATION SCHEMAS ──────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

// ── Points Log ──────────────────────────────────────────────────────
export const pointsLogSchema = pgTable("points_log", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  action: text("action").notNull(),
  basePoints: integer("base_points").notNull(),
  streakMultiplier: real("streak_multiplier").notNull().default(1),
  totalPoints: integer("total_points").notNull(),
  masteryCategory: text("mastery_category").notNull(),
  masteryXpGained: integer("mastery_xp_gained").notNull().default(0),
  referenceId: uuid("reference_id"),
  referenceType: text("reference_type"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("points_log_user_id_idx").on(table.userId),
  actionIdx: index("points_log_action_idx").on(table.action),
  categoryIdx: index("points_log_category_idx").on(table.masteryCategory),
  createdAtIdx: index("points_log_created_at_idx").on(table.createdAt),
  userActionIdx: index("points_log_user_action_idx").on(table.userId, table.action),
  userCreatedAtIdx: index("points_log_user_created_at_idx").on(table.userId, table.createdAt),
}));

// ── User Streaks ────────────────────────────────────────────────────
export const userStreaksSchema = pgTable("user_streaks", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  streakType: text("streak_type").notNull(),
  currentCount: integer("current_count").notNull().default(0),
  longestCount: integer("longest_count").notNull().default(0),
  lastActivityDate: date("last_activity_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueStreak: unique("user_streaks_unique").on(table.userId, table.streakType),
  userIdIdx: index("user_streaks_user_id_idx").on(table.userId),
}));

// ── Milestones (Definition Table) ───────────────────────────────────
export const milestonesSchema = pgTable("milestones", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  type: text("type").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  requiredValue: integer("required_value").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── User Milestones (Unlocked) ──────────────────────────────────────
export const userMilestonesSchema = pgTable("user_milestones", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  milestoneId: uuid("milestone_id")
    .notNull()
    .references(() => milestonesSchema.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserMilestone: unique("user_milestones_unique").on(table.userId, table.milestoneId),
  userIdIdx: index("user_milestones_user_id_idx").on(table.userId),
}));

// ── User Mastery Progress ───────────────────────────────────────────
export const userMasterySchema = pgTable("user_mastery", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  category: text("category").notNull(),
  currentXp: integer("current_xp").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueMastery: unique("user_mastery_unique").on(table.userId, table.category),
  userIdIdx: index("user_mastery_user_id_idx").on(table.userId),
}));

// ── Weekly Chef Titles ──────────────────────────────────────────────
export const weeklyChefTitlesSchema = pgTable("weekly_chef_titles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  title: text("title").notNull(),
  weekStartDate: date("week_start_date").notNull(),
  weekEndDate: date("week_end_date").notNull(),
  rank: integer("rank").notNull(),
  xpEarned: integer("xp_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  weekUserIdx: unique("weekly_titles_user_week").on(table.userId, table.weekStartDate),
  weekStartIdx: index("weekly_titles_week_start_idx").on(table.weekStartDate),
}));

// ── Challenges ──────────────────────────────────────────────────────
export const challengesSchema = pgTable("challenges", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(),    // daily | weekly | special
  action: text("action").notNull(), // GamificationAction
  targetValue: integer("target_value").notNull(),
  xpReward: integer("xp_reward").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  typeIdx: index("challenges_type_idx").on(table.type),
  activeIdx: index("challenges_active_idx").on(table.isActive),
}));

// ── User Challenges ─────────────────────────────────────────────────
export const userChallengesSchema = pgTable("user_challenges", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  challengeId: uuid("challenge_id")
    .notNull()
    .references(() => challengesSchema.id),
  currentProgress: integer("current_progress").notNull().default(0),
  status: text("status").notNull().default("active"), // active | completed | expired | claimed
  completedAt: timestamp("completed_at"),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserChallenge: unique("user_challenges_unique").on(table.userId, table.challengeId),
  userIdIdx: index("user_challenges_user_id_idx").on(table.userId),
  statusIdx: index("user_challenges_status_idx").on(table.status),
}));

// ── User Gamification Summary (cached aggregate) ────────────────────
export const userGamificationSchema = pgTable("user_gamification", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => usersSchema.id),
  totalXp: integer("total_xp").notNull().default(0),
  globalLevel: integer("global_level").notNull().default(1),
  globalLevelName: text("global_level_name").notNull().default("Novato"),
  pointsThisWeek: integer("points_this_week").notNull().default(0),
  pointsToday: integer("points_today").notNull().default(0),
  weeklyRank: integer("weekly_rank"),
  lastResetDate: date("last_reset_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_gamification_user_id_idx").on(table.userId),
  totalXpIdx: index("user_gamification_total_xp_idx").on(table.totalXp),
  weeklyRankIdx: index("user_gamification_weekly_rank_idx").on(table.weeklyRank),
}));

// ── Gamification Alerts (Notificaciones de logros) ──────────────────
export const gamificationAlertsSchema = pgTable("gamification_alerts", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersSchema.id),
  alertType: text("alert_type").notNull(), // milestone_unlocked | mastery_level_up | global_level_up | challenge_completed | weekly_title_earned
  title: text("title").notNull(),
  message: text("message").notNull(),
  icon: text("icon").notNull().default("🏆"),
  data: jsonb("data"),
  seen: boolean("seen").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("gamification_alerts_user_id_idx").on(table.userId),
  seenIdx: index("gamification_alerts_seen_idx").on(table.seen),
  userSeenIdx: index("gamification_alerts_user_seen_idx").on(table.userId, table.seen),
}));

// ════════════════════════════════════════════════════════════════════════
// ─── GAMIFICATION RELATIONS ────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════

export const pointsLogRelations = relations(
  pointsLogSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [pointsLogSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const userStreaksRelations = relations(
  userStreaksSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userStreaksSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const userMilestonesRelations = relations(
  userMilestonesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userMilestonesSchema.userId],
      references: [usersSchema.id],
    }),
    milestone: one(milestonesSchema, {
      fields: [userMilestonesSchema.milestoneId],
      references: [milestonesSchema.id],
    }),
  })
);

export const userMasteryRelations = relations(
  userMasterySchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userMasterySchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const weeklyChefTitlesRelations = relations(
  weeklyChefTitlesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [weeklyChefTitlesSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const userChallengesRelations = relations(
  userChallengesSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userChallengesSchema.userId],
      references: [usersSchema.id],
    }),
    challenge: one(challengesSchema, {
      fields: [userChallengesSchema.challengeId],
      references: [challengesSchema.id],
    }),
  })
);

export const userGamificationRelations = relations(
  userGamificationSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [userGamificationSchema.userId],
      references: [usersSchema.id],
    }),
  })
);

export const gamificationAlertsRelations = relations(
  gamificationAlertsSchema,
  ({ one }) => ({
    user: one(usersSchema, {
      fields: [gamificationAlertsSchema.userId],
      references: [usersSchema.id],
    }),
  })
);
