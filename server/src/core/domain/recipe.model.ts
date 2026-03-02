import { Pagination } from "../../shared/types";
import { Conversions } from "../../utils/unitConverterV2";
import { ScannedIngredientWithMatches } from "./ia.model";
import { IngredientsAnalysisResult } from "./pantry.model";

export interface RecipeFilter {
  userId?: string;
  ingredientIds?: string[];
  searchQuery?: string;
  recipeType?: RecipeBrandType;
  includeIngredients?: boolean;
  onlyCommunityRecipes?: boolean;
  onlyFavoriteRecipes?: boolean;
  includeAuthor?: boolean;
}

export interface RecipeCookedFilter {
  limit?: number;
  page?: number;
  recipeId?: string;
  userId?: string;
}

export interface RecipeCook {
  id: string;
  userId: string;
  recipeId: string;
  image: string | null;
  notes: string | null;
  rating: number | null;
  servings: number;
  createdAt: Date;
  user: {
    fullName: string;
    avatarUrl: string | null;
  };
}

interface Instructions {
  step: string;
}

export interface SaveRecipeRating {
  id?: string;
  image?: string;
  userId: string;
  recipeId: string;
  rating: number;
  tip: string;
}

export interface GetRecentlyViewdRecipes {
  limit?: number;
  sessionId: string;
  userId?: string;
}

export interface SaveRecipeCook {
  id?: string;
  userId: string;
  recipeId?: string;
  rating?: number;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
  image?: string;
  notes?: string;
  cookedAt: string;
  createdAt?: any;
}

export interface RecipeTipsFIlter {
  limit?: number;
  page?: number;
  recipeId: string;
}

export interface RecipeView {
  id: string;
  userId: string;
  sessionId: string;
  recipeId: string;
  date: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RecipeMetrics {
  id: string;
  userId: string | null;
  recipeId: string;
  date: string;
  viewsCount: number;
  cookedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveRecipeMetrics {
  startDate: Date;
  endDate: Date;
}

export interface RecipeRating {
  id?: string;
  userId: string;
  recipeId: string;
  rating: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface RecipeTip {
  id: string;
  userId: string;
  recipeId: string;
  tip: string;
  image?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ResponseRecipeTipDto {
  id: string;
  user: {
    fullName: string;
  };
  tip: string;
  image?: string;
  isActive?: boolean;
  createdAt: Date;
}

export interface UpdateTip extends Partial<RecipeTip> {
  id: string;
}

type RecipeBrandType = "COMMUNITY" | "BRAND";
type Dificulty = "easy" | "medium" | "hard";

export interface Recipe {
  id: string;
  userId: string;
  parentRecipeId?: string | null;
  isDeleted?: boolean;
  name: string;
  recipeType: RecipeBrandType;
  description?: string;
  mealTypes: string[];
  totalTime: number;
  ingredients?: RecipeIngredient[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  dificulty?: Dificulty;
  instructions?: Instructions[];
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  image?: string;
  notes?: string;
  createdAt: Date;
}

export interface RecipesWithAnalysis extends IngredientsAnalysisResult<RecipeIngredient> {}

export interface GetSuggestedMealIngredientsInput {
  recipes: Recipe[];
  recipeIngredients: RecipeIngredient[];
  targetServings: number;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  ingredientId: string;
  name: {
    es: string;
    fr: string;
    en: string;
  };
  conversions: Conversions;
  measurementType: string;
  measurementValue: number;
  notes?: string;
}

export interface FilterRecipeIngredient {
  recipeId?: string;
  recipeIds?: string[];
}

export enum IngredientAvailabilityStatus {
  COMPLETE = "COMPLETE",
  PARTIAL = "PARTIAL",
  MISSING = "MISSING",
}
export interface AnalyzedIngredient {
  id: string;
  ingredientName: string;
  ingredientId: string;
  pantryId: string | null;
  quantity: number;

  // Estado de disponibilidad (nuevo campo)
  availabilityStatus: IngredientAvailabilityStatus;

  // Mediciones de la receta
  recipeMeasurementType: string;
  recipeMeasurementValue: number;

  // Información de la despensa
  isAvailableInPantry: boolean;
  originalPantryQuantity: number;
  pantryMeasurementType: string | null;

  // Conversión y disponibilidad
  isSuccessConvertion: boolean | null;
  errorConvertion: string | null;
  availableInPantry: number;
  availableConvertedQuantity: number;
  measurementType: string;
  missingAmount: number;
}

export interface RecipeAdvancedFilter<T> {
  field: keyof T;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in";
  value: any;
}

export interface SearchRecipe extends Pagination {
  ingredientIds?: string[];
  ingredientCount?: number;
  mealTypes?: string[];
  cuisines?: string[];
  times?: string[];
  difficulties?: string[];
  query?: string;
  prepTime?: number;
  includeAuthor?: boolean;
  userId?: string;
  simpleFilters?: Partial<Recipe>;
  advancedFilters?: RecipeAdvancedFilter<Recipe>[];
}

export interface SaveFavoriteRecipe {
  userId: string;
  recipeId: string;
}

export interface FavoriteRecipe {
  userId: string;
  recipeId: string;
  savedAt: Date;
}

export interface FavoriteRecipeResponse {
  id: string;
  name: string;
  image?: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  isSharedCommunity: boolean;
  includeInSuggestedRecipes: boolean;
  servings?: number;
  dificulty?: string;
  mealTypes: any;
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  instructions?: any;
  notes?: string;
  createdAt: Date;
  userId: string;
  savedAt: Date;
  ingredients: RecipeIngredient[];
}

export interface FavoriteRecipeFilter {
  userId: string;
  mealType?: string;
  difficulty?: string;
  maxCookTime?: number;
  sortBy?: "savedAt" | "name" | "cookTime" | "calories";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface DishAnalysis {
  dishName: string;
  ingredients: {
    standardName: string;
    measurementType: string;
    measurementValue: number;
  }[];
  totalNutrition: {
    calories: string;
    proteins: string;
    carbohydrates: string;
    fats: string;
    fiber: string;
    sodium: string;
  };
  servingSize: string;
}

export interface DishAnalysisWithIngredients {
  dishName: string;
  ingredients: ScannedIngredientWithMatches[];
  totalNutrition: {
    calories: string;
    proteins: string;
    carbohydrates: string;
    fats: string;
    fiber: string;
    sodium: string;
  };
  servingSize: string;
}
