import { Conversions } from "../../utils/unitConverterV2";
import { Recipe } from "./recipe.model";
import { DietType } from "./user.model";

export interface MealPlan {
  id?: string;
  userId: string;
  name: string;
  dietType: string;
  isActive: boolean;
  targetCalories: number;
  targetProteins: number;
  targetCarbohydrates: number;
  targetFats: number;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface SuggestedMealPlan {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  dietType: string;
  durationDays: number;
  targetCalories?: number | null;
  targetProteins?: number | null;
  targetFats?: number | null;
  targetCarbohydrates?: number | null;
  difficulty?: string | null;
  tags?: string[] | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserActiveMealPlan {
  id?: string;
  userId: string;
  suggestedMealPlanId: string;
  status: "active" | "canceled" | "completed";
  startDate: string;
  endDate?: string | null;
  currentDay: number;
  totalRecipes: number;
  completedRecipes?: number;
  createdAt: Date;
  updatedAt?: Date;
  suggestedMealPlan?: SuggestedMealPlan;
}

export interface GetUserActivePlanFilter {
  userId?: string;
  id?: string;
  suggestedMealPlanId?: string;
  includeSuggestedMealPlan?: boolean;
}

export interface UpdateUserActiveMealPlan extends Partial<UserActiveMealPlan> {
  id: string;
  addToCompleatedRecipes?: number;
}

export interface SuggestedMealPlanCategory {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface SuggestedMealPlan {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  dietType: string;
  durationDays: number;
  targetCalories?: number | null;
  targetProteins?: number | null;
  targetFats?: number | null;
  targetCarbohydrates?: number | null;
  difficulty?: string | null;
  tags?: string[] | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface CreateMealPlanFromSuggestion {
  mealPlanEntries: SuggestedMealplanRecipe[];
  excludedDays: number[];
  startDate: string;
}

export interface SuggestedMealPlanRecipeEntry {
  id: string;
  suggestedMealPlanId: string;
  recipeId: string;
  mealType: MealType;
  createdAt: Date;
}

export interface MealplanEntriesFilter {
  startDate?: string;
  endDate?: string;
  userId: string;
}

export interface SuggestedMealplanFilter {
  limit?: number;
  isRandom?: boolean;
  sortOrderSkipAfter?: number;
  dietType?: DietType;
  suitableForGoals?: string;
  difficulty?: string;
  query?: string;
  sort?: {
    caloriesAvg?: number;
    proteinsAvg?: number;
    fatsAvg?: number;
    carbsAvg?: number;
  };
}

export interface SuggestedMealPlanRecipe {
  id: string;
  suggestedMealPlanId: string;
  recipeId: string;
  dayNumber: number;
  mealType: string;
  servings: number;
  sortOrder: number;
  createdAt: Date;
}

export interface getSuggestedMealIngredients {
  recipeId: string;
  ingredientId: string;
  name: {
    en: string;
    es: string;
    fr: string;
  };
  category: string;
  measurementValue: number;
  measurementType: string;
  conversions: Conversions;
  isSuccessConversion?: boolean;
}

export interface GetMealplanByCategory {
  limit?: number;
  categoryId?: string;
  categoryName?: string;
}

export interface SuggestedMealPlanCategoryWithPlans {
  id: string;
  name: string;
  description?: string | null;
  mealplans: SuggestedMealPlan[];
}

export interface GetMealplanRecipeItems {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface MealPlanEntry {
  id: string;
  userId: string;
  activeMealPlanId?: string | null;
  name?: string;
  recipeId: string;
  plannedDate: string;
  mealType: string;
  servings: number;
  isCooked: boolean;
  completedAt?: Date | null;
  planDay?: number | null;
  createdAt: Date;
  updatedAt?: Date;
  recipe?: Recipe;
}

export interface RemoveMealPlanEntry {
  userId: string;
  selectedDate: string;
  mealType: string;
  recipeId: string;
}

export interface MealPlanEntryFilters {
  userId: string;
  includeRecipes?: true;
  isCooked?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface MealPlanWithEntries extends MealPlan {
  entries?: MealPlanEntry[];
}

export interface MealPlanEntryWithRecipe extends MealPlanEntry {
  recipe?: Recipe;
}

export interface SuggestedMealplanRecipe {
  id: string;
  image: string;
  name: string;
  mealType: MealType;
  dayNumber: number;
  recipeId: string;
  recipe?: Recipe;
}

export interface SuggestedMealplanRecipesFilter {
  suggestedMealplanId: string;
  includeRecipe?: boolean;
}

export interface MealPlanEntryWithIngredient {
  id?: string;
  plannedDate?: string;
  ingredientId: string;
  name: {
    en: string;
    es: string;
    fr: string;
  };
  category: string;
  measurementValue: number;
  measurementType: string;
  conversions: Conversions;
  recipe?: string;
}
