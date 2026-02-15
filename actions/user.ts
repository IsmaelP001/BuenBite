import { ApiClient } from "@/services/apiClient";
import {
  SaveUserRecipe,
  UserNutritionMetrics,
  UserPreferences,
} from "@/types/models/user";

const apiClient = new ApiClient();

export async function getUserNutricionalHistory(startDate: Date) {
  return apiClient.userService.getUserNutricionalHistory(startDate);
}

export async function getUserNutritionalMetrics() {
  return apiClient.userService.getUserNutritionalMetrics();
}

export async function getUserPreferences() {
  return apiClient.userService.getUserPreferences();
}

export async function getWeeklyNutricionalDataConsumed() {
  return apiClient.userService.getWeeklyNutricionalDataConsumed();
}

export async function getUserSavedRecipeEntries() {
  return apiClient.userService.getUserSavedRecipeEntries();
}
export async function saveUserRecipe(data: SaveUserRecipe) {
  return apiClient.userService.saveUserRecipe(data);
}

export async function removeUserRecipe(recipeId: string) {
  return apiClient.userService.removeUserRecipe(recipeId);
}

export async function setUpUserNutritionalMetrics(data: any) {
  return apiClient.userService.setUpUserNutritionalMetrics(data);
}

export async function updateUserNutritionalMetrics(
  dto: Partial<UserNutritionMetrics>
) {
  return apiClient.mealplanService.updateUserNutritionalMetrics(dto);
}

export async function updateUserPrefenrences(dto: Partial<UserPreferences>) {
  return apiClient.userService.updateUserPrefenrences(dto);
}
