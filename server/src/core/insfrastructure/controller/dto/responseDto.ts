import { Conversions } from "../../../../utils/unitConverterV2";
import { RecipeDto } from "../../../application/dto";
import { PantryItem } from "../../../domain/pantry.model";

export interface MealPlanEntryDto {
  id: string;
  mealPlanId: string;
  recipeId: string;
  plannedDate: string; // ISO date string (e.g., "2025-07-23")
  mealType: string;
  servings: number;
  createdAt: string; // ISO timestamp
  updatedAt: string;
  originalPlannedDate: string | null;
  recipe: RecipeDto;
}

export interface NutrientStat {
  target: number;
  consumed: number;
}



export interface MealPlanNutritionSummary {
  consumedProtein: number;
  consumedCarbs: number;
  consumedCalories: number;
  consumedFats: number;
}

export interface GetMealplanEntries{
  userId:string;
  startDate:string;
  endDate:string
}
export interface MealPlanEntryResponseDto {
  id: string;
  plannedDate: string;
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
}



export interface MealPlanMissingIngredientsDto {
  ingredients: {
    id: string;
    pantryId: string;
    ingredientName: string;
    measurementValue: number;
    measurementType: string;
    category: string;
  }[];
  pantryItems: PantryItem[];
}


