import { Ingredient } from "./ingredient";

export interface ScannedIngredient {
  id: string;
  scannedName: string;
  originalText: string;
  existsInDatabase: boolean;
  measurementValue: number;
  measurementType: string;
  ingredientData: Ingredient | null;
}

export interface DishAnalysisWithIngredients {
  dishName: string;
  ingredients:ScannedIngredient[];
  totalNutrition: {
    calories: number;
    proteins: number;
    carbohydrates: number;
    fats: number;
  };
  servingSize: number;
}

export interface IaRecipeCookDto {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
}