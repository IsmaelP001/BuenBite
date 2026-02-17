import { Ingredient } from "./ingredient";
import { RecipeItem } from "./recipes";

export interface PantryItem {
  id: string;
  userId: string;
  name: {
    en: string;
    fr: string;
    es: string;
  };
  ingredientId: string;
  category: string;
  expirationDate: string | null; 
  image: string; 
  isRecurrent: boolean;
  recurrentAmount: number;
  brand: string | null;
  isRegisteredByUser: boolean;
  measurementType: string; 
  pendingPurchaseQuantity: number;
  measurementValue: number;
  lowValueAlert: number;
  updatedAt: string; 
  include: boolean;
  isLowStock: boolean;
  isOutStock: boolean;
  isExpiring: boolean;
  remainingDaysExpire: number | null;
  hasPurchaseQuantity: boolean;
}


export interface PantryIngredientInput {
  id: string;
  quantity: number;
  unit: string;
  ingredient: Ingredient;
  expiryDate: string | null ;
  addedAt: string;
}

export interface CreatePantryDto {
  isRecurrent?: boolean;
  expirationDate: string | null;
  measurementType: string;
  measurementValue: number;
  ingredientId: string;
}

export type IngredientAvailabilityStatus = "COMPLETE" | "PARTIAL" | "MISSING" | "UNSUCCESSFUL_CONVERSION" | "NO_STOCK" | "PANTRY_NOT_PROVIDED";
export interface BaseAnalysisData {
  pantryId: string | null;
  availabilityStatus: IngredientAvailabilityStatus;
  isAvailableInPantry: boolean;
  originalPantryQuantity: number;
  availableInPantry: number;
  availableConvertedQuantity: number;
  missingAmount: number;
  pantryMeasurementType: string | null;
  isSuccessConvertion: boolean | null;
  errorConvertion: string | null;
}
export interface BaseIngredientForAnalysis {
  ingredientId: string;
  measurementValue: number;
  name:{
    es:string,
    fr:string,
    en:string
  }
  measurementType: string;
  conversions?:Record<string,any> ; // Opcional, se puede obtener del pantryItem
}export type AnalyzedIngredient<T> = T & BaseAnalysisData;

export interface IngredientsAnalysisResult<T extends BaseIngredientForAnalysis> {
  totalIngredients: number;
  totalInPantryIngredients: number;
  totalPartialIngredients: number;
  targetServingsCompletionPercentage:number
  targetServings:number
  totalMissingIngredients: number;
  completionPercentage: number;
  ingredients: AnalyzedIngredient<T>[];
  completeIngredients: AnalyzedIngredient<T>[];
  partialIngredients: AnalyzedIngredient<T>[];
  missingIngredients: AnalyzedIngredient<T>[];
  sufficientIngredients: AnalyzedIngredient<T>[];
  insufficientIngredients: AnalyzedIngredient<T>[];
}

export interface MissingMealplanIngredient extends PantryItem {
  isSuccessConvertion?: boolean;
  requiredQuantity: number;
  totalRequiredQuantity:number;
  originalPantryQuantity:number;
  pantryMeasurementType?:string
  isInPantry: boolean;
  recipes:string[]
}

export type PantryMeasurementTransactionType =
  | "add"
  | "remove"
  | "update"
  | "purchase";

export interface PantryIngredientMeasurement {
  pantryId: string;
  transactionType: PantryMeasurementTransactionType;
  recipeName?: string;
  measurementType: string;
  measurementValue: number;
  lowValueAlert?: number;
}

export interface Transaction {
  id: string;
  transactionType:
    | "add"
    | "used"
    | "update"
    | "pendingForPurchase"
    | "purchased";
  recipeName?: string;
  measurementType: string;
  measurementValue: number;
  createdAt: string;
}

interface MostUsedRecipe {
  recipeName: string;
  usageCount: number;
}

export interface PantryItemDetail {
  id: string;
  ingredientName: string;
  image: string;
  currentAmount: number;
  category: string;
  isRecurrent: boolean;
  expirationDate?: string;
  brand?: string;
  lowValueAlert: number;
  updatedAt: string;
  measurementType: string;
  measurementValue: number;
  transactions: Transaction[];
  monthlyConsumption?: number;
  weeklyConsumption?: number;
  mostUsedRecipe?: MostUsedRecipe;
}

export interface PendingPurchase {
  ingredientId: string;
  pendingPurchaseQuantity: number;
  // recipeName: string;
  measurementType: string;
}

export interface RegisterUsedIngredient {
  id: string;
  measurementType: string;
  measurementValue: string;
}

export interface PantryTransaction {
  id: string;
  userId: string;
  ingredientId: string;
  recipeName: string;
  transactionType: "used" | "added" | "purchased" | "update";
  measurementType: string;
  measurementValue: number;
  createdAt: string;
}

export interface IaScanPantryItems {
  ingredientId: string;
  name: string;
  measurementType: string;
  measurementValue: number;
}

export interface MealPlanEntry {
  id: string;
  userId: string;
  activeMealPlanId?: string | null;
  recipeId: string;
  plannedDate: string;
  mealType: string;
  servings: number;
  isCooked: boolean;
  completedAt?: Date | null;
  planDay?: number | null;
  createdAt: Date;
  updatedAt?: Date;
  recipe?: RecipeItem;
}
