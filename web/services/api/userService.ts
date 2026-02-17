import { HttpClient } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types";
import {
  SaveUserRecipe,
  UserCookedRecipes,
  UserNutritionalHistory,
  UserNutritionMetrics,
  UserPreferences,
  UserSavedRecipeEntry,
  WeeklyNutritionalData,
} from "@/types/models/user";

export class UserService {
  constructor(
    private httpClient: HttpClient,
  ) {}

  async verifyUserExist() {
    return await this.httpClient.get<any>(`user/verify-user-exist`);
  }

  async getUserSavedRecipeEntries() {
    return await this.httpClient.get<UserSavedRecipeEntry[]>(`user/saved-recipe-entries`);
  }
  async setUpUserNutritionalMetrics(
    data: any
  ): Promise<ApiResponse<UserNutritionMetrics>> {
    return this.httpClient.post("user/nutritional-metrics", data);
  }

  async updateUserPrefenrences(
    data: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    return this.httpClient.patch("user/preferences", data);
  }

  async getUserNutritionalMetrics() {
    return await this.httpClient.get<UserNutritionMetrics>(
      `user/nutritional-metrics`
    );
  }

   async getUserNutritionalMetricsById(id: string) {
    return await this.httpClient.get<UserNutritionMetrics>(
      `user/nutritional-metrics/${id}`
    );
  }

  async getUserCookedRecipes(startDate: Date) {
    return await this.httpClient.get<UserCookedRecipes[]>(
      `user/cooked-recipes`,
      { queryParams: { startDate: startDate.toISOString() } }
    );
  }

  async getUserNutricionalHistory(startDate: Date) {
    return await this.httpClient.get<UserNutritionalHistory[]>(
      `user/nutritional-history`,
      { queryParams: { startDate: startDate?.toISOString()! } }
    );
  }

  async getWeeklyNutricionalDataConsumed() {
    return await this.httpClient.get<WeeklyNutritionalData>(
      `user/weekly-nutritional-resume`
    );
  }

  async getUserPreferences() {
    return await this.httpClient.get<UserPreferences>(`user/preferences`);
  }

  async saveUserRecipe(data: SaveUserRecipe) {
    return await this.httpClient.post<UserPreferences>(
      `user/save-recipe`,
      data
    );
  }

  async removeUserRecipe(recipeId: string) {
    return await this.httpClient.delete<UserPreferences>(
      `user/remove-recipe/${recipeId}`
    );
  }
}
