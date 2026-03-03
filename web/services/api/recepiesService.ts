// import { ApiResponse } from "@/types";
import { HttpClient } from "@/lib/http/httpClient";
import { ApiResponse, Pagination } from "@/types";
import {
  DishAnalysisWithIngredients,
  IaRecipeCookDto,
} from "@/types/models/ia";
import {
  GetUserMealPlanEntriesFilters,
  MarkMealPlanAsCooked,
  MealPlanNutritionSummary,
  UserMealPlanConfig,
} from "@/types/models/mealplan";
import {
  IngredientsAnalysisResult,
  RegisterUsedIngredient,
} from "@/types/models/pantry";
import {
  FilterMealplanMissingIngredients,
  RecipeFormDataIa,
  RecipeIngredient,
  RecipeItem,
  RecipeTip,
  RecipeTipFilter,
  RecommendedRecipe,
  RemoveMealPlanEntry,
  ScheduleRecipeMealPlan,
  SearchRecipe,
  SearchRecipeFilters,
} from "@/types/models/recipes";

const sessionId = "b69ea9f4-65da-46c9-b1ae-a983cea91e27";

export class RecipeService {
  constructor(private httpClient: HttpClient) {}

  async getRecipeSuggestedRecipesIngredients(
    suggestedId: string
  ): Promise<ApiResponse<IngredientsAnalysisResult<RecipeIngredient>>> {
    return this.httpClient.get<IngredientsAnalysisResult<RecipeIngredient>>(
      `recipes/suggested/${suggestedId}`
    );
  }
  async getUserRecipes(): Promise<ApiResponse<RecipeItem[]>> {
    return this.httpClient.get<RecipeItem[]>(`recipes/user`);
  }

  async getRecipeById(recipeId: string): Promise<ApiResponse<RecipeItem>> {
    return this.httpClient.get<RecipeItem>(`recipes/${recipeId}`);
  }

  async getRecipeVariants(recipeId: string): Promise<ApiResponse<RecipeItem[]>> {
    return this.httpClient.get<RecipeItem[]>(`recipes/${recipeId}/variants`);
  }

  async getRecipeByIdWithPantry(
    recipeId: string
  ): Promise<ApiResponse<RecommendedRecipe>> {
    return this.httpClient.get<RecommendedRecipe>(`recipes/${recipeId}/cook`);
  }

  async getUserRecommendedRecipes(): Promise<ApiResponse<RecommendedRecipe[]>> {
    return this.httpClient.get<RecommendedRecipe[]>(`recipes/user/from-pantry`);
  }

  async getRecommendedRecipes(
    params: Pagination
  ): Promise<ApiResponse<RecommendedRecipe[]>> {
    console.log("params service", params);
    return this.httpClient.get<RecommendedRecipe[]>(`recipes/from-pantry`, {
      queryParams: {
        limit: params?.limit || 30,
        page: params?.page || 1,
        ...params,
      },
    });
  }

  async getUserSavedRecipes(): Promise<ApiResponse<RecommendedRecipe[]>> {
    return this.httpClient.get<RecommendedRecipe[]>(`recipes/user/saved`);
  }

  async updateRecipe(data: any): Promise<ApiResponse<RecipeItem>> {
    return this.httpClient.put<RecipeItem>("recipes", {
      ...data,
      userId: HttpClient.getCurrentUserId(),
    });
  }

  async softDeleteRecipe(recipeId: string): Promise<ApiResponse<RecipeItem>> {
    return this.httpClient.put<RecipeItem>(`recipes/${recipeId}/soft-delete`);
  }

  async getCommunityRecipes(): Promise<ApiResponse<RecipeItem[]>> {
    return this.httpClient.get<RecipeItem[]>("recipes", {
      queryParams: {
        onlyCommunityRecipes: "true",
        userId: HttpClient.getCurrentUserId() ?? "",
      },
    });
  }

  async getRecipes(
    queryParams: Record<string, any>
  ): Promise<ApiResponse<RecipeItem[]>> {
    return this.httpClient.get<RecipeItem[]>("recipes", {
      queryParams,
    });
  }

  async searchRecipes(
    filter: SearchRecipeFilters
  ): Promise<ApiResponse<SearchRecipe[]>> {
    const cleanParams = Object.fromEntries(
      Object.entries(filter).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );

    return await this.httpClient.get("recipes/search", {
      queryParams: cleanParams,
    });
  }

  async createRecipe(recipe: FormData): Promise<ApiResponse<RecipeItem>> {
    return this.httpClient.post("recipes", recipe, { isFormDataType: true });
  }

  async uploadRecipeImage(recipe: FormData): Promise<ApiResponse<any>> {
    return this.httpClient.post("recipes/upload-image", recipe, {
      isFormDataType: true,
    });
  }

  async saveRecipeRating(rating: FormData): Promise<ApiResponse<void>> {
    return this.httpClient.post("recipes/rating", rating, {
      isFormDataType: true,
    });
  }

  async saveRecipeTip(recipeTip: FormData): Promise<ApiResponse<void>> {
    return this.httpClient.post("recipes/tips", recipeTip, {
      isFormDataType: true,
    });
  }

  async updateRecipeTip(
    recipeTip: Partial<RecipeTip>
  ): Promise<ApiResponse<void>> {
    return this.httpClient.post("recipes/tips", recipeTip);
  }

  async getRecipeTips(
    filter: RecipeTipFilter
  ): Promise<ApiResponse<RecipeTip[]>> {
    return this.httpClient.get(`recipes/tips/${filter.recipeId}`, {
      queryParams: {
        limit: filter?.limit ?? "",
        page: filter?.page ?? 1,
      },
    });
  }

  async getRecipeCooked(
    filter: RecipeTipFilter
  ): Promise<ApiResponse<RecipeTip[]>> {
    console.log("getRecipeTips", filter);
    return this.httpClient.get(`recipes/cooked`, {
      queryParams: {
        limit: filter?.limit ?? "",
        page: filter?.page ?? 1,
        recipeId: filter.recipeId ?? "",
      },
    });
  }

  async getRecipeIngredients(
    recipeId: string
  ): Promise<ApiResponse<IngredientsAnalysisResult>> {
    return this.httpClient.get(`recipes/ingredients/${recipeId}`, {
      queryParams: {
        userId: (await HttpClient.getUserId()) ?? "",
      },
    });
  }

  async generateRecipeWithAI(data: RecipeFormDataIa) {
    return this.httpClient.post("ia/generate-recipe", data);
  }

  async analizeRecipeImageIa(
    recipe: FormData
  ): Promise<ApiResponse<DishAnalysisWithIngredients>> {
    return this.httpClient.post("ia/scan-food", recipe, {
      isFormDataType: true,
    });
  }

  async saveIaScanNutritionalValues(
    dto: IaRecipeCookDto
  ): Promise<ApiResponse<any>> {
    return this.httpClient.post("recipes/ia-cooked", dto);
  }

  async saveRecipeCooked(
    formData: FormData
  ): Promise<ApiResponse<any[]>> {
    return this.httpClient.post<RegisterUsedIngredient[]>(
      `recipes/register-cook`,
      formData,
      {
        isFormDataType: true,
      }
    );
  }

  async getLatestCommunityRecipes(): Promise<ApiResponse<RecipeItem[]>> {
    return await this.httpClient.get("recipes/community/latest");
  }

  async getLatestCookedCommunityRecipes(): Promise<ApiResponse<RecipeItem[]>> {
    return await this.httpClient.get("recipes/community/cooked");
  }

  async getLatestRecipesViewed(): Promise<ApiResponse<RecipeItem[]>> {
    return await this.httpClient.get("recipes/recently-viewed", {
      queryParams: { limit: 10, sessionId },
    });
  }
  async saveViewedRecipe(recipeId: string) {
    return this.httpClient.post("recipes/viewed", { sessionId, recipeId });
  }

  async getUserMealPlanConfig(): Promise<ApiResponse<UserMealPlanConfig>> {
    return await this.httpClient.get(`meal-plan/user`);
  }

  async getUserMealPlanEntries(
    filters: GetUserMealPlanEntriesFilters
  ): Promise<ApiResponse<any[]>> {
    return await this.httpClient.get(`meal-plan/entries`, {
      queryParams: {
        startDate: filters?.startDate ?? "",
        endDate: filters?.endDate ?? "",
      },
    });
  }

  async getTodaysUserMealPlanEntries(): Promise<ApiResponse<any[]>> {
    return await this.httpClient.get(`meal-plan/entries/today`);
  }

  async getMealPlanMissingPantryItems(
    filter: FilterMealplanMissingIngredients
  ): Promise<ApiResponse<MealPlanNutritionSummary>> {
    return await this.httpClient.get(
      `pantry/user/${HttpClient.getCurrentUserId()}/meal-plan-missing-ingredients`,
      {
        queryParams: { startDate: filter?.startDate, endDate: filter?.endDate },
      }
    );
  }

  async createMealPlanEntry(
    mealPlanEntry: ScheduleRecipeMealPlan
  ): Promise<ApiResponse<any>> {
    return this.httpClient.post("meal-plan/entries", mealPlanEntry);
  }

  async markMealplanAsCooked(
    data: MarkMealPlanAsCooked
  ): Promise<ApiResponse<void>> {
    return this.httpClient.post("meal-plan/entries", data);
  }

  async removeMealPlanEntry(
    data: RemoveMealPlanEntry
  ): Promise<ApiResponse<any>> {
    return this.httpClient.delete(
      `meal-plan/entries/${data.mealType}/${data.plannedDate}/${data.recipeId}`
    );
  }
}
