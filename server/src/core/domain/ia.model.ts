import { Ingredient } from "./ingredients.model";

export interface ScannedIngredient {
  scannedName: string;
  originalText: string;
  measurementType: string;
  measurementValue: number;
  existsInDatabase: boolean;
  ingredientData: Ingredient | null;
}

export interface ScanReceipt {
  raw?: string;
  standardName: string;
  measurementType: string;
  measurementValue: number;
}

export interface ScannedIngredientWithMatches {
  id: string;
  scannedName: string;
  originalText: string;
  measurementType: string;
  measurementValue: number;
  matches: Array<{
    ingredient: Ingredient;
    matchScore: number;
  }>;
  hasMatches: boolean;
}
