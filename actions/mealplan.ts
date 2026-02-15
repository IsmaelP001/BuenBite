"use server";
import { ApiClient } from "@/services/apiClient";
import { Pagination } from "@/types";
import {
  FilterSearchSuggestedPlan,
  GetUserMealPlanEntriesFilters,
  MarkMealPlanAsCooked,
} from "@/types/models/mealplan";
import {
  CreateMealPlanFromSuggestion,
  FilterMealplanMissingIngredients,
  RemoveMealPlanEntry,
  ScheduleRecipeMealPlan,
  ScheduleRecipeMealPlanDto,
} from "@/types/models/recipes";

const apiClient = new ApiClient();

export async function getSuggestedMealPlan(id: string) {
  return await apiClient.mealplanService.getSuggestedMealPlan(id);
}

export async function getAllSuggestedMealPlans(
  props: FilterSearchSuggestedPlan
) {
  return apiClient.mealplanService.getAllSuggestedMealPlans(props);
}

export async function getSuggestedMealPlansByCategory(filter?: Pagination) {
  return apiClient.mealplanService.getSuggestedMealPlansByCategory(filter);
}
export async function getMealPlanMissingPantryItems(
  filter: FilterMealplanMissingIngredients
) {
  return apiClient.mealplanService.getMealPlanMissingPantryItems(filter);
}

export async function getSuggestedMealplanIngredients(id: string) {
  return apiClient.recipeService.getRecipeSuggestedRecipesIngredients(id);
}

export async function createMealPlanFromSuggestion(
  dto: CreateMealPlanFromSuggestion
) {
  return apiClient.mealplanService.createMealPlanFromSuggestion(dto);
}

export async function removeMealPlanEntry(dto: RemoveMealPlanEntry) {
  return apiClient.recipeService.removeMealPlanEntry(dto);
}

export async function markMealplanRecipeAsCooked(dto: MarkMealPlanAsCooked) {
  return apiClient.mealplanService.markMealplanRecipeAsCooked(dto);
}

export async function createMealPlanEntry(dto: ScheduleRecipeMealPlanDto) {
  return apiClient.mealplanService.createMealPlanEntry(dto);
}

export async function cancelActiveUserPlan() {
  return apiClient.mealplanService.cancelActiveUserPlan();
}

export async function getActiveUserPlan() {
  return apiClient.mealplanService.getActiveUserPlan();
}

export async function getDefaultSuggestedMealPlans() {
  return apiClient.mealplanService.getDefaultSuggestedMealPlans();
}

export async function getUserMealPlanEntries(
  filters: GetUserMealPlanEntriesFilters
) {
  return apiClient.recipeService.getUserMealPlanEntries(filters);
}

export async function getSuggestedMealPlanRecipes(suggestedMealplanId: string) {
  return apiClient.mealplanService.getSuggestedMealPlanRecipes(
    suggestedMealplanId
  );
}

export async function getAllSuggestedMealPlansByUserMetrics() {
  return apiClient.mealplanService.getAllSuggestedMealPlansByUserMetrics();
}

export async function getUserMealPlanConfig() {
  return apiClient.recipeService.getUserMealPlanConfig();
}

export async function markActiveUserPlanAsCompleated() {
  return apiClient.mealplanService.markActiveUserPlanAsCompleated();
}

export async function getTodaysUserMealPlanEntries() {
  return apiClient.mealplanService.getTodaysUserMealPlanEntries();
}









