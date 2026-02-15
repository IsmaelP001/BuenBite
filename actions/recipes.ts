"use server";
import { ApiClient } from "@/services/apiClient";
import {
  GetPantryBasedRecommendedRecipesParams,
  RecipeTipFilter,
  RegisterRecipeAsCooked,
  SearchRecipeFilters,
} from "@/types/models/recipes";

const apiClient = new ApiClient();

export async function getCommunityRecipes() {
  return apiClient.recipeService.getCommunityRecipes();
}

export async function getUserRecipesFromPantry() {
  return apiClient.recipeService.getUserRecommendedRecipes();
}

export async function getSuggestedPlans() {
  return apiClient.recipeService.getCommunityRecipes();
}

export async function getLatestCookedCommunityRecipes() {
  return apiClient.recipeService.getLatestCookedCommunityRecipes();
}

export async function getPantryBasedRecommendedRecipes(
  params: GetPantryBasedRecommendedRecipesParams
) {
  return apiClient.recipeService.getRecommendedRecipes(params);
}

export async function getRecipeById(recipeId: string) {
  return apiClient.recipeService.getRecipeById(recipeId);
}

export async function getAllRecipes(queryParams: Record<string, any>) {
  return apiClient.recipeService.getRecipes(queryParams);
}

export async function searchRecipes(props: SearchRecipeFilters) {
  return apiClient.recipeService.searchRecipes(props);
}

export async function createRecipe(props: FormData) {
  return apiClient.recipeService.createRecipe(props);
}

export async function getUserSavedRecipes() {
  return apiClient.recipeService.getUserSavedRecipes();
}

export async function getLatestCommunityRecipes() {
  return apiClient.recipeService.getLatestCommunityRecipes();
}
export async function getRecipes(queryParams: Record<string, any>) {
  return apiClient.recipeService.getRecipes(queryParams);
}

export async function getLatestRecipesViewed() {
  return apiClient.recipeService.getLatestRecipesViewed();
}
export async function getRecipeCooked(filter: RecipeTipFilter) {
  return apiClient.recipeService.getRecipeCooked(filter);
}
export async function getRecipeIngredients(recipeId: string) {
  return apiClient.recipeService.getRecipeIngredients(recipeId);
}

export async function getRecipeTips(filter: RecipeTipFilter) {
  return apiClient.recipeService.getRecipeTips(filter);
}

export async function getUserCookedRecipes(startDate: Date) {
  return apiClient.userService.getUserCookedRecipes(startDate);
}

export async function getUserRecommendedRecipes() {
  return apiClient.recipeService.getUserRecommendedRecipes();
}

export async function saveRecipeCooked(data: RegisterRecipeAsCooked) {
  return apiClient.recipeService.saveRecipeCooked(data);
}
