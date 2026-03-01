import { Recipe } from "./recipe.model";

export interface User {
  id: string;
  fullName: string;
  avatarUrl: string;
  email: string;
  registeredAt: Date;
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum WeightUnit {
  KG = "kg",
  LBS = "lbs",
}

export enum HeightUnit {
  CM = "cm",
  INCHES = "inches",
}

export enum ActivityLevel {
  SEDENTARY = "sedentary", // Poco o ningún ejercicio
  LIGHTLY_ACTIVE = "lightly_active", // Ejercicio ligero 1-3 días/semana
  MODERATELY_ACTIVE = "moderately_active", // Ejercicio moderado 3-5 días/semana
  VERY_ACTIVE = "very_active", // Ejercicio intenso 6-7 días/semana
  EXTREMELY_ACTIVE = "extremely_active", // Ejercicio muy intenso + trabajo físico
}

export enum PrimaryGoal {
  LOSE_WEIGHT = "lose_weight", // Perder peso
  MAINTAIN_WEIGHT = "maintain_weight", // Mantener peso
  GAIN_WEIGHT = "gain_weight", // Ganar peso
  BUILD_MUSCLE = "build_muscle", // Ganar músculo
}

export enum WeightChangePace {
  SLOW = "slow", // Lento: 0.25kg/semana
  MODERATE = "moderate", // Moderado: 0.5kg/semana
  AGGRESSIVE = "aggressive",
}

export type DietType =
  | "balanced"
  | "low_carb"
  | "keto"
  | "vegetarian"
  | "vegan"
  | "high-protein"
  | "mediterranean";

export interface UserInput {
  gender: Gender;
  age: number;
  currentWeight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  activityLevel: ActivityLevel;
  primaryGoal: PrimaryGoal;
  pace: WeightChangePace;
  dietType: DietType;
}

export interface UserNutritionMetrics {
  id: string;
  userId: string;
  bmr: number;
  tdee: number;
  dietType: DietType | string;
  primaryGoal: PrimaryGoal | string;
  currentWeight: number;
  weightUnit: string;
  height: number;
  heightUnit: string;
  activityMultiplier: number;
  currentBMI: number;
  age: number;
  gender: Gender | string;
  activityLevel: ActivityLevel | string;
  weightChangePace: WeightChangePace | string;
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

export interface UserCookedRecipes extends Recipe {
  consumedCarbs: number;
  consumedCalories: number;
  consumedFats: number;
  consumedProtein: number;
}

export interface getUserNutricionalData {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}


export interface getUserNutricionalDataDto {
  userId: string;
  startDate?: string;
  endDate?: string;
}


export interface WeeklyNutritionalData {
  caloriesConsumedAvg: number;
  carbsConsumedAvg: number;
  proteinsConsumedAvg: number;
  fatsConsumedAvg: number;
  startDate?: Date;
  endDate?: Date;
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

export interface NutritionalSummary {
  date: string;
  proteins: number;
  carbs: number;
  fats: number;
  calories: number;
}

export interface UserFilters {
  userId?: string;
}

export interface UserByIdResponseDto {
  isUserExist: boolean;
  registeredAt?: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  primaryGoal: string | null;
  breakfastTime: string;
  lunchTime: string;
  servings:number;
  dinnerTime: string;
  dietType:DietType | null;
  isNutritionMetricsConfigured: boolean;
  allergies: string[];
  dislikes: string[];
  autoFilterByDiet: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSavedRecipeEntry {
  id: string;
  userId: string;
  recipeId: string;
  savedAt?: Date;
  isFavorite: boolean;
}

export interface RemoveFavorite {
  recipeId: string;
  userId: string;
}
