import { RecipeItem } from "./recipes";

export interface UserPreferences {
  id: string;
  userId: string;
  primaryGoal: string | null;
  dailyCaloriesTarget: number | null;
  dailyProteinTarget: number | null;
  dailyFatTarget: number | null;
  dailyCarbsTarget: number | null;
  isVegan: boolean;
  isNutritionMetricsConfigured:boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  allergies: string[];
  dislikes: string[];
  dietType:string | null;
  autoFilterByDiet: boolean;
  currentWeight: number | null;
  targetWeight: number | null;
  activityLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCookedRecipes extends RecipeItem {
  consumedCarbs: number;
  consumedCalories: number;
  consumedFats: number;
  consumedProtein: number;
}

export interface UserPreferences {
  id: string;
  userId: string;
  primaryGoal: string | null;
  breakfastTime: string;
  lunchTime: string;
  dinnerTime: string;
  servings:number
  isNutritionMetricsConfigured: boolean;
  allergies: string[];
  dislikes: string[];
  autoFilterByDiet: boolean;
  activityLevel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserNutritionMetrics {
  id: string;
  userId: string;
  bmr: number;
  tdee: number;
  dietType: string;
  primaryGoal:  string;
  currentWeight: number;
  weightUnit: string;
  height: number;
  heightUnit: string;
  activityMultiplier: number;
  currentBMI: number;
  age: number;
  gender:string;
  activityLevel:  string;
  weightChangePace: string;
  bmiCategory: string;
  goalBMI?: number;
  suggestedGoalWeight?: number;
  totalWeightToChange?: number;
  calorieAdjustment?: number;
  dailyCaloriesTarget: number;
  dailyProteinTarget: number;
  dailyFatTarget: number;
  dailyCarbsTarget: number;
  proteinPercentage?: number;
  fatPercentage?: number;
  carbsPercentage?: number;
  weeklyWeightChange?: number;
  estimatedWeeks?: number;
  estimatedMonths?: number;
  estimatedCompletionDate?: string;
  dailyWaterTarget?: number;
  isHealthyGoal: boolean;
  warnings: any[];
  calculatedAt: Date;
}

export interface UserSavedRecipeEntry {
  id: string;
  userId: string;
  recipeId: string;
  savedAt?: Date;
  isFavorite: boolean;
}

export interface UserNutritionalHistory {
  date:string;
  protein: {
    consumed: number;
    goal: number;
  };
  fats: {
    consumed: number;
    goal: number;
  };
  carbs: {
    consumed: number;
    goal: number;
  };
  calories: {
    consumed: number;
    goal: number;
  };
}

export interface WeeklyNutritionalData {
  caloriesConsumed: number;
  carbsConsumed: number;
  proteinsConsumed: number;
  fatsConsumed: number;
  startDate?: Date;
  endDate?: Date;
}

export interface SaveUserRecipe{
  recipeId:string;
  isFavorite?:boolean
}

