import { Recipe } from "../../../domain/recipe.model";
import {
  getUserNutricionalDataDto,
  RemoveFavorite,
  User,
  UserCookedRecipes,
  UserNutritionalHistory,
  UserNutritionMetrics,
  UserPreferences,
  UserSavedRecipeEntry,
  WeeklyNutritionalData
} from "../../../domain/user.model";
import {
  UserNutritionalIMetricsDto,
  UserPreferencesDto,
  UserSavedRecipeDto,
} from "../../dto";

export interface UserService {
  getUserById(userId: string): Promise<User>;
  getUserPreferences(userId: string): Promise<UserPreferences>;
  getUserSavedRecipes(userId: string): Promise<Recipe[]>;
  saveRecipeFavorite(dto: UserSavedRecipeDto): Promise<UserSavedRecipeEntry>;
  removeRecipeFavorite(data: RemoveFavorite): Promise<UserSavedRecipeEntry>;
  createUserNutritionMetrics(
    dto: UserNutritionMetrics
  ): Promise<UserNutritionMetrics>;
  updateUserPreferences(
    data: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  getUserActiveNutritionalMetrics(
    userId: string
  ): Promise<UserNutritionMetrics>;
  getUserNutricionalHistory(
    filters: getUserNutricionalDataDto
  ): Promise<UserNutritionalHistory[]>;
  getWeeklyNutricionalDataConsumed(
    userId: string
  ): Promise<WeeklyNutritionalData>;
  getUserCookedRecipes(
    filter: getUserNutricionalDataDto
  ): Promise<UserCookedRecipes[]>;
  updateUserPreference(
    userId: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  updateUserNutritionalMetrics(
    data: Partial<UserNutritionMetrics>
  ): Promise<UserNutritionMetrics>;
  getUserSavedRecipeEntries(userId: string): Promise<UserSavedRecipeEntry[]>;
  getUserNutritionalMetricsById(id: string): Promise<UserNutritionMetrics>;
  createUserPreferences(data: UserPreferencesDto): Promise<UserPreferences>;
}

export interface UserFacade {
  getUserById(userId: string): Promise<User>;
  getUserPreferences(userId: string): Promise<UserPreferences>;
  getUserSavedRecipes(userId: string): Promise<Recipe[]>;
  saveRecipeFavorite(dto: UserSavedRecipeDto): Promise<UserSavedRecipeEntry>;
  removeRecipeFavorite(data: RemoveFavorite): Promise<UserSavedRecipeEntry>;
  createUserNutritionMetrics(
    dto: UserNutritionalIMetricsDto
  ): Promise<UserNutritionMetrics>;
  getUserActiveNutritionalMetrics(
    userId: string
  ): Promise<UserNutritionMetrics>;
  getUserNutricionalHistory(
    filters: getUserNutricionalDataDto
  ): Promise<UserNutritionalHistory[]>;
  getWeeklyNutricionalDataConsumed(
    userId: string
  ): Promise<WeeklyNutritionalData>;
  getUserCookedRecipes(
    filter: getUserNutricionalDataDto
  ): Promise<UserCookedRecipes[]>;
  updateUserPreference(
    userId: Partial<UserPreferences>
  ): Promise<UserPreferences>;
  getUserSavedRecipeEntries(userId: string): Promise<UserSavedRecipeEntry[]>;
  getUserNutritionalMetricsById(id: string): Promise<UserNutritionMetrics>;
  createUserPreferences(data: UserPreferencesDto): Promise<UserPreferences>;
}
