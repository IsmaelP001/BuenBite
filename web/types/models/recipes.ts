import { Pagination } from "..";
import { IngredientsAnalysisResult } from "./pantry";

export interface Instruction {
  step: string;
}

export interface CreateRecipeDto {
  parentRecipeId?: string;
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  dificulty?: string;
  instructions?: Instruction[];
  image?: string | null;
  mealTypes: string[];
  isSharedCommunity?: boolean;
  ingredients: CreateRecipeIngredientDto[];
  notes?: string;
}

export interface CreateRecipeIngredientDto {
  ingredientId: string;
  measurementType: string;
  measurementValue: number;
  notes?: string;
}

export interface RecipeFormDataIa {
  description?: string;
  cuisineType: string;
  difficulty: string;
  servings: number;
  pantryUsage: "none" | "all" | "selected";
  selectedPantryItems?: string[];
  surpriseMe: boolean;
}

export interface RecipeIngredient {
  id: string;
  ingredientId: string;
  recipeId: string;
  category: string;
  name: {
    es: string;
    en: string;
    fr: string;
  };
  measurementType: string;
  measurementValue: number;
  notes?: string;
}

export interface GetRecentlyViewdRecipes {
  limit?: number;
  sessionId: string;
}

export interface RecipeItem {
  id: string;
  userId: string;
  parentRecipeId?: string | null;
  name: string;
  totalTime: number;
  description: string | null;
  prepTime: number;
  cookTime: number;
  isSharedCommunity: boolean;
  servings: number;
  dificulty: string;
  mealTypes: ("breakfast" | "lunch" | "dinner" | "dessert" | string)[];
  instructions: Instruction[];
  rating?: number;
  notes: string;
  image: string | null;
  proteins: number;
  carbs: number;
  calories: number;
  fats: number;
  isAuthor: boolean;
  createdAt: string;
  views?: number;
  user?: {
    fullName: string;
    avatarUrl?: string;
  };
}

export interface SearchRecipeFilters extends Pagination {
  ingredientIds?: string[];
  ingredientCount?: number;
  mealTypes?: string[]; // Cambiado a array
  cuisines?: string[]; // Nuevo
  times?: string[]; // Nuevo
  difficulties?: string[]; // Nuevo
  query?: string;
  prepTime?: number;
  includeAuthor?: boolean;
  userId?: string;
}

export interface SearchRecipe {
  id: string;
  userId: string;
  name: string;
  description: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;

  recipeType: string;
  difficulty: string;

  servings: number;
  mealTypes: string[];

  calories: number;
  proteins: number;
  fats: number;
  carbs: number;

  instructions: Instruction[];

  notes: string | null;
  image: string | null;

  ingredientIds: string[];

  rating: number;
  tips: number;
  comments: number;

  isSharedCommunity: boolean;
  includeInSuggestedRecipes: boolean;

  createdAt: string;

  // Search / filtering metadata
  matchingIngredientsCount: number;
  totalIngredientsCount: number;
  totalIngredientsSearched: number;
  isFilteredByIngredients: boolean;

  // Permissions
  isAuthor: boolean;
}

export enum IngredientAvailabilityStatus {
  COMPLETE = "COMPLETE", // Cantidad completa disponible
  PARTIAL = "PARTIAL", // Cantidad parcial disponible
  MISSING = "MISSING", // Sin stock o no existe en despensa
}

// Interfaz para un ingrediente analizado individual
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

export interface RecommendedRecipe
  extends RecipeItem,
    IngredientsAnalysisResult<RecipeIngredient> {}

export interface SaveRecipeRating {
  image?: string;
  userId: string;
  recipeId: string;
  rating: number;
  tip: string;
}
export interface IngredientAnalysis {
  id: string;
  ingredientName: string;
  recipeMeasurementType: string;
  recipeMeasurementValue: number;
  ingredientId: string;
  measurementType: string;
  pantryId?: string | null;
  quantity?: number | null;
  isAvailableInPantry: boolean;
  originalPantryQuantity: number;
  availableInPantry: number;
  isSuccessConvertion: boolean | null;
  availableConvertedQuantity: number;
  pantryMeasurementType: string | null;
  missingAmount: number;
}

// export interface IngredientsAnalysisResult {
//   // Totales generales
//   totalIngredients: number;
//   totalInPantryIngredients: number;
//   totalPartialIngredients: number;
//   totalMissingIngredients: number;
//   completionPercentage:number;
//   // Lista completa de ingredientes analizados
//   ingredients: AnalyzedIngredient[];

//   // Ingredientes categorizados por disponibilidad
//   completeIngredients: AnalyzedIngredient[];
//   partialIngredients: AnalyzedIngredient[];
//   missingIngredients: AnalyzedIngredient[];
//   // Propiedades legacy (para compatibilidad)
//   sufficientIngredients: AnalyzedIngredient[];
//   insufficientIngredients: AnalyzedIngredient[];
// }
export interface RecipeTipFilter {
  limit?: number;
  page?: number;
  recipeId: string;
}
export interface RecipeTip {
  id: string;
  userId: string;
  recipeId: string;
  tip: string;
  image?: string;
  isActive?: boolean;
  createdAt: string;
  user?: {
    fullName: string;
    avatarUrl: string;
  };
}

export interface ScheduleRecipeMealPlan {
  recipeId: string;
  plannedDate: string;
  mealType: string;
  servings: number;
  name?: string;
  prepTime: number;
  protein: number;
  carbohydrates: number;
  calories: number;
  image?: string;
  fat: number;
}

export interface ScheduleRecipeMealPlanDto {
  recipeId: string;
  plannedDate: string;
  mealType: string;
  servings: number;
  name?: string;
  prepTime: number;
  image?: string;
}

export interface CreateMealPlanFromSuggestion {
  startDate: string;
  excludedDays: number[];
  suggestedMealplanId: string;
}

export interface GetPantryBasedRecommendedRecipesParams extends Pagination {
  searchQuery?: string;
 
}



export interface FilterMealplanMissingIngredients {
  startDate: string;
  endDate: string;
}

export interface RemoveMealPlanEntry {
  plannedDate: string;
  mealType: string;
  recipeId: string;
}

export interface RegisterPantryItemsCookedDto {
  ingredientId: string;
  measurementValue: number;
  measurementType: string;
}

export interface RegisterRecipeAsCooked {
  ingredients: RegisterPantryItemsCookedDto[];
  recipeId: string;
  image?: any;
  servings: number;
  notes?: string;
  rating?: number;
  mealPlanEntryId?: string;
}
