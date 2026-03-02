import { Pagination } from "..";
import { PantryItem } from "./pantry";
import { RecipeItem } from "./recipes";

export interface MealPlanNutritionSummary {
  consumedProtein: number;
  consumedCarbs: number;
  consumedCalories: number;
  consumedFats: number;
}

export interface SuggestedMealPlan {
  id: string;
  categoryId: string;

  name: string;
  description: string;
  imageUrl: string;

  dietType: string;
  difficulty: string;

  durationDays: number;
  sortOrder: number;

  dailyCaloriesAvg: number;
  dailyProteinsAvg: number;
  dailyCarbsAvg: number;
  dailyFatsAvg: number;

  suitableForGoals: string[];
  tags: string[];

  isActive: boolean;
  isGlutenFreeFriendly: boolean;
  isVeganFriendly: boolean;
  isVegetarianFriendly: boolean;

  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}



export interface MissingMealplanIngredient extends PantryItem{
  isSuccessConvertion:boolean;
  requiredQuantity:number
    isInPantry:boolean

}

export interface GetUserMealPlanEntriesFilters {
  startDate: string;
  endDate: string;
}

export interface UserMealPlanConfig {
  id: string;
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

export interface SuggestedMealplanRecipes {
  id: string;
  mealType: string;
  dayNumber: number;
  recipeId: string;
  recipe?: RecipeItem;
}

export interface SuggestedMealIngredients {
  ingredientId: string;
  name: {
    en: string;
    es: string;
    fr: string;
  };
  category: string;
  measurementValue: number;
  measurementType: string;
  conversions: Record<string,string>;
  isSuccessConversion?: boolean;
}


export interface MealPlanEntry {
  id: string;
  recipeId: string;
  activeMealplanId: string | null;
  plannedDate: string; // ISO date: YYYY-MM-DD
  mealType: string;
  servings: number;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  isCooked: boolean;
  recipe: RecipeItem;
}


export interface FilterSearchSuggestedPlan extends Pagination {
  dietType?: string;
  suitableForGoals?: string;
  query?:string
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

export interface MarkMealPlanAsCooked {
  id: string;
  isCooked: boolean;
  recipeId: string;
  activeMealplanId?: string;
}
