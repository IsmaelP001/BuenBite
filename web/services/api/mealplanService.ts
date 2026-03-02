// import { ApiResponse } from "@/types";
import { HttpClient } from "@/lib/http/httpClient";
import { ApiResponse, Pagination } from "@/types";
import {
  FilterSearchSuggestedPlan,
  MarkMealPlanAsCooked,
  MealPlanNutritionSummary,
  SuggestedMealIngredients,
  SuggestedMealPlan,
  SuggestedMealplanRecipes,
  UserActiveMealPlan,
  UserMealPlanConfig,
} from "@/types/models/mealplan";
import {
  IngredientsAnalysisResult,
  MealPlanEntry,
  MissingMealplanIngredient,
  RegisterUsedIngredient,
} from "@/types/models/pantry";
import {
  GetRecentlyViewdRecipes,
  RecipeFormDataIa,
  RecipeItem,
  RecipeTip,
  RecommendedRecipe,
  RegisterRecipeAsCooked,
  RemoveMealPlanEntry,
  FilterMealplanMissingIngredients,
  CreateMealPlanFromSuggestion,
  ScheduleRecipeMealPlanDto,
} from "@/types/models/recipes";
import { UserNutritionMetrics } from "@/types/models/user";

export class MealplanService {
  constructor(private httpClient: HttpClient) {}

  async getDefaultSuggestedMealPlans(): Promise<ApiResponse<any>> {
    return await this.httpClient.get(`meal-plan/suggested/random`);
  }

  async markMealplanRecipeAsCooked(
    data: MarkMealPlanAsCooked
  ): Promise<ApiResponse<void>> {
    return await this.httpClient.post(
      `meal-plan/entries/register-cooked`,
      data
    );
  }

  async getAllSuggestedMealPlans(
    filters: FilterSearchSuggestedPlan
  ): Promise<ApiResponse<any>> {
    return await this.httpClient.get(`meal-plan/suggested`, {
      queryParams: { ...filters },
    });
  }

  async getAllSuggestedMealPlansByUserMetrics(): Promise<ApiResponse<any>> {
    return await this.httpClient.get(`meal-plan/suggested/user-metrics`);
  }

  async getActiveUserPlan(): Promise<ApiResponse<UserActiveMealPlan>> {
    return await this.httpClient.get("meal-plan/active-user-plan/current");
  }

  markActiveUserPlanAsCompleated(): Promise<ApiResponse<UserActiveMealPlan>> {
    return this.httpClient.post("meal-plan/active-user-plan/current");
  }

  cancelActiveUserPlan(): Promise<ApiResponse<UserActiveMealPlan>> {
    return this.httpClient.post("meal-plan/active-user-plan/current/cancel");
  }

  async getSuggestedMealPlanIngredient(
    suggestedMealplanId: string
  ): Promise<ApiResponse<any>> {
    return await this.httpClient.get(
      `meal-plan/suggested/${suggestedMealplanId}/ingredients`
    );
  }

  async getSuggestedMealPlan(
    suggestedMealplanId: string
  ): Promise<ApiResponse<SuggestedMealPlan>> {
    return await this.httpClient.get(
      `meal-plan/suggested/${suggestedMealplanId}`
    );
  }
  async getSuggestedMealPlanRecipes(
    suggestedMealplanId: string
  ): Promise<ApiResponse<SuggestedMealplanRecipes[]>> {
    return await this.httpClient.get(
      `meal-plan/suggested/${suggestedMealplanId}/recipes`
    );
  }
  async getSuggestedMealPlansByCategory(
    filter?: Pagination
  ): Promise<ApiResponse<any>> {
    return await this.httpClient.get(`meal-plan/suggested/categories`, {
      queryParams: { ...filter },
    });
  }

  async getUserMealPlanConfig(): Promise<ApiResponse<UserMealPlanConfig>> {
    return await this.httpClient.get(`meal-plan/user`);
  }

  async getUserMealPlanEntries(): Promise<ApiResponse<MealPlanEntry[]>> {
    return await this.httpClient.get(`meal-plan/entries`);
  }

  async getUserMealPlanSummary(): Promise<
    ApiResponse<MealPlanNutritionSummary>
  > {
    return await this.httpClient.get(`meal-plan/summary`);
  }

  async getTodaysUserMealPlanEntries(): Promise<ApiResponse<MealPlanEntry[]>> {
    return await this.httpClient.get(`meal-plan/entries/today`);
  }

  async getMealPlanMissingPantryItems(
    filter: FilterMealplanMissingIngredients
  ): Promise<ApiResponse<IngredientsAnalysisResult<SuggestedMealIngredients>>> {
    const userId = await HttpClient.getUserId();
    return await this.httpClient.get(
      `pantry/user/${userId}/meal-plan-missing-ingredients`,
      {
        queryParams: { startDate: filter?.startDate, endDate: filter?.endDate },
      }
    );
  }

  async getSuggestedMealPlanMissingPantryItems(
    id: string
  ): Promise<ApiResponse<IngredientsAnalysisResult<SuggestedMealIngredients>>> {
    return await this.httpClient.get(
      `pantry/user/${id}/suggested-meal-plan-missing-ingredients`
    );
  }

  async createMealPlanEntry(
    mealPlanEntry: ScheduleRecipeMealPlanDto
  ): Promise<ApiResponse<any>> {
    return this.httpClient.post("meal-plan/entries", mealPlanEntry);
  }

  async updateUserNutritionalMetrics(
    dto: Partial<UserNutritionMetrics>
  ): Promise<ApiResponse<any>> {
    return this.httpClient.patch("user/recalculate-nutritional-metrics", dto);
  }

  async removeMealPlanEntry(
    data: RemoveMealPlanEntry
  ): Promise<ApiResponse<any>> {
    return this.httpClient.delete(
      `meal-plan/entries/${data.mealType}/${data.plannedDate}`
    );
  }

  async createMealPlanFromSuggestion(
    dto: CreateMealPlanFromSuggestion
  ): Promise<ApiResponse<any>> {
    return this.httpClient.post("meal-plan/from-suggested", dto);
  }
}
