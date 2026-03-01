import { Pagination } from "../../shared/types";
import { Conversions } from "../../utils/unitConverterV2";
import { MealPlanEntryWithIngredient } from "../domain/mealplan";
import {
  NutricionalValues,
  PantryItem,
  PantryMeasurementTransactionType,
  RegisterPantryItemsCooked,
} from "../domain/pantry.model";
import { Recipe, RecipeIngredient, RecipeTip } from "../domain/recipe.model";
import { UploadedImage, UploadedImageDto } from "../domain/upload";
import {
  ActivityLevel,
  DietType,
  Gender,
  HeightUnit,
  PrimaryGoal,
  WeightChangePace,
  WeightUnit,
} from "../domain/user.model";

export interface ConfirmCookRecipeDto {
  id: string;
  userId: string;
  recipeName: string;
  measurementValue: number;
  measurementType: string;
}

export interface UploadRecipeImageDto {
  recipeId: string;
  image: UploadedImage;
}

export interface SaveRecipeRatingDto {
  image?: UploadedImage;
  userId: string;
  recipeId: string;
  rating: number;
  tip: string;
}

export interface RecipeTipDto {
  userId: string;
  recipeId: string;
  tip: string;
  image?: UploadedImage | string | undefined;
}

export interface UpdateTipDto extends Partial<RecipeTip> {
  id: string;
}

export interface UploadPantryImageDto {
  pantryId: string;
  image: UploadedImage;
}

export interface RecipesByPantryItemsDto {
  userId: string;
  pantryItems: PantryItem[];
}

interface BaseIngredientForAnalysis {
  ingredientId: string;
  measurementValue: number;
  measurementType: string;
  conversions?: Conversions; // Opcional, se puede obtener del pantryItem
}

// Interfaz genérica del DTO
export interface AnalyzeIngredientsDto<
  T extends BaseIngredientForAnalysis = BaseIngredientForAnalysis,
> {
  pantryItems: any[];
  recipeIngredients: T[];
  recipeServing?: number;
  targetServings?: number;
}

// Interfaz para el resultado base que se añade a todos los ingredientes
export interface BaseAnalysisData {
  pantryId: string | null;
  availabilityStatus: "COMPLETE" | "PARTIAL" | "MISSING";
  isAvailableInPantry: boolean;
  originalPantryQuantity: number;
  availableInPantry: number;
  availableConvertedQuantity: number;
  missingAmount: number;
  pantryMeasurementType: string | null;
  isSuccessConvertion: boolean | null;
  errorConvertion: string | null;
}

// Tipo genérico que preserva el tipo original + análisis
export type AnalyzedIngredient<T> = T & BaseAnalysisData;

export interface IngredientsAnalysisResult<
  T extends BaseIngredientForAnalysis,
> {
  totalIngredients: number;
  totalInPantryIngredients: number;
  totalPartialIngredients: number;
  totalMissingIngredients: number;
  completionPercentage: number;
  ingredients: AnalyzedIngredient<T>[];
  completeIngredients: AnalyzedIngredient<T>[];
  partialIngredients: AnalyzedIngredient<T>[];
  missingIngredients: AnalyzedIngredient<T>[];
  sufficientIngredients: AnalyzedIngredient<T>[];
  insufficientIngredients: AnalyzedIngredient<T>[];
}

export interface GetRecipeIngredientsWithPantryDto {
  recipeId: string;
  userId: string;
}

export interface AnalizeMultipleRecipesByPantryDto {
  userId: string;
  recipesIngredients: {
    recipeId: string;
    recipeServing: number;
    targetServings: number;
    ingredients: RecipeIngredient[];
  }[];
}

export interface UserSavedRecipeDto {
  userId: string;
  recipeId: string;
  isFavorite?: boolean;
}

export interface UserPreferencesDto {
  userId: string;
  primaryGoal: string | null;
  breakfastTime: string;
  lunchTime: string;
  servings: number;
  dinnerTime: string;
  dietType: DietType | null;
  isNutritionMetricsConfigured: boolean;
  allergies: string[];
  dislikes: string[];
  autoFilterByDiet: boolean;
}

export interface UserNutritionalIMetricsDto {
  gender: Gender;
  age: number;
  userId: string;
  dietType: DietType;
  currentWeight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  weightChangePace: WeightChangePace;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
}

export interface RecipeDto {
  userId: string;
  parentRecipeId?: string;
  name: string;
  description?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  instructions?: instructions[];
  image?: string;
  mealTypes: string[];
  isSharedCommunity?: boolean;
  ingredients: RecipeIngredientDto[];
  nutricionalValues?: NutricionalValues;
}

interface instructions {
  step: string;
}

export interface RecipeIngredientDto {
  ingredientName: string;
  ingredientId: string;
  measurementType: string;
  measurementValue: number;
}

export interface PantryDto {
  userId: string;
  isRecurrent?: boolean;
  expirationDate?: string;
  measurementType: string;
  measurementValue: number;
  ingredientId: string;
}

export interface GenerateRecipeIaDto {
  description: string;
  cuisineType: string;
  difficulty: string;
  servings: number;
  selectedPantryItems?: string[];
  surpriseMe?: boolean;
  userId: string;
}

export interface UpdatePantryDto extends Partial<PantryDto> {
  id: string;
  changeAmount?: number;
}

export interface RegisterPendingPurchaseDto {
  ingredientId: string;
  userId: string;
  pendingPurchaseQuantity: number;
  measurementValue: number;
}

export interface PantryResponseDto {
  id: string;
  userId: string;
  ingredientName: string;
  image?: string;
  isRecurrent: boolean;
  category: string;
  expirationDate?: string;
  brand?: string;
  updatedAt?: string;
  measurementType: string;
  measurementValue: number;
}

export interface PantryIngredientMeasurementDto {
  pantryId: string;
  transactionType: PantryMeasurementTransactionType;
  measurementType: string;
  measurementValue: number;
  lowValueAlert?: number;
}

// export interface UserPreferencesDto {
//   userId: string;
//   primaryGoal: string | null;
//   dailyCaloriesTarget: number | null;
//   dailyProteinTarget: number | null;
//   dailyFatTarget: number | null;
//   dailyCarbsTarget: number | null;
//   isVegan: boolean;
//   isVegetarian: boolean;
//   isGlutenFree: boolean;
//   allergies: string[];
//   dislikes: string[];
//   autoFilterByDiet: boolean;
//   currentWeight: number | null;
//   targetWeight: number | null;
//   activityLevel: string | null;
// }

export interface RecipeCookWithPantryItemsDto {
  userId: string;
  recipeId: string;
  ingredients: RegisterPantryItemsCooked[];
  servings?: number;
  rating: number | null;
  image?: UploadedImageDto;
  notes?: string;
}

export interface RecipeCookDto {
  userId: string;
  recipeId: string;
  recipe?: Recipe;
  servings?: number;
  image?: string;
  notes?: string;
}

export interface IaRecipeCookDto {
  userId: string;
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
}

export interface PurchaseDto {
  userId: string;
  purchaseItems: PurchaseItemDto[];
}

export interface PurchaseItemDto {
  ingredientId: string;
  measurementType: string;
  amountToBuy: number;
}

export interface ConfirmPurchaseItem {
  orderId: string;
  ingredientId: string;
  purchaseItemId: string;
  amountToBuy: number;
  userId: string;
}

export interface ConfirmPurchaseDto {
  purchaseId: string;
  items: ConfirmPurchaseItem[];
  userId: string;
}

export interface FindRecipesByPantryIngredientsDto extends Pagination {
  userId: string;
  searchQuery?: string;
}

export interface MealPlanDto {
  userId: string;
  name: string;
  dietType: string;
  targetCalories?: number;
  targetProteins?: number;
  targetFats?: number;
  targetCarbohydrates?: number;
}

export interface MealPlanEntryDto {
  activeMealPlanId?: string | null;
  recipeId: string;
  plannedDate: string;
  name?: string;
  mealType: string;
  servings: number;
  userId: string;
  recipe?: Recipe;
}

export interface UserActiveMealPlanDto {
  userId: string;
  id?: string;
  suggestedMealPlanId: string;
  startDate: string;
  endDate?: string | null;
  currentDay: number;
  totalRecipes: number;
}

export interface CreateMealPlanFromSuggestionDto {
  suggestedMealplanId: string;
  userId: string;
  excludedDays: number[];
  startDate: string;
}

export interface GetMealplanRecipeItemsDto {
  userId: string;
  startDate: string;
  endDate: string;
}

export interface GetSuggestedMealplanMissingPantryItems {
  userId: string;
  suggestedMealplanId: string;
}

export interface SearchRecipeDto extends Pagination {
  ingredientIds?: string[];
  ingredientCount?: number;
  query?: string;
  dificulty?: string;
  includeAuthor?: boolean;
  userId?: string;
  cookTime?: number;
  mealType?: string;
}

export interface UpdateMealPlanDto extends Partial<MealPlanDto> {
  id: string;
}

export interface UpdateMealPlanEntryDto extends Partial<MealPlanEntryDto> {
  id: string;
}

export interface MealPlanEntryFiltersDto {
  mealPlanId?: string;
}

export interface MarkMealPlanAsCookedDto {
  id: string;
  userId: string;
  recipeId: string;
  isCooked: boolean;
  activeMealplanId?: string;
}

export interface RegisterPantryItemsCookedDto {
  id: string;
  measurementValue: number;
  measurementType: string;
}

export interface RegisterRecipeAsCooked {
  recipeId: string;
  userId: string;
  image?: any;
  mealPlanEntryId?: string;
}

export interface RecipeViewDto {
  id: string;
  userId: string;
  sessionId: string;
  recipeId: string;
}

export interface IngredientNutricionalValuesDto {
  ingredientId: string;
  value: number;
  originalMeasurementType: string;
}

export interface IngredientDto {
  name_es: string;
  name_en: string;
  name_fr: string;
  category: string;
  image?: string | null;
  notes?: string | null;
  alias?: string[];
  calories_100g?: number;
  protein_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
}

export interface UserUnregisterPantryItem {
  name: string;
  category: string;
  measurementType: string;
  measurementValue: number;
  userId: string;
}

export interface IaScanIngredientsDto {
  userId: string;
  items: IaScanIngredientItemDto[];
}

export interface IaScanIngredientItemDto {
  ingredientId: string;
  name: string;
  category: string;
  measurementType: string;
  measurementValue: number;
}

export interface AddItemsToPurchase {
  purchaseId: string;
  items: PurchaseItemDto[];
}

export interface MealPlanMissingIngredientsDto {
  userId: string;
  pantryItems: PantryItem[];
  ingredients: MealPlanEntryWithIngredient[];
}
