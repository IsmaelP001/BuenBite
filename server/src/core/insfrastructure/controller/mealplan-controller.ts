import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import { Public } from "../../../adapters/decorators/public-recorator";
import { PaginatedResponse } from "../../../shared/dto/response";
import {
  CreateMealPlanFromSuggestionDto,
  MarkMealPlanAsCookedDto,
  MealPlanEntryDto,
  UpdateMealPlanEntryDto,
} from "../../application/dto";
import { MealplanFacade } from "../../application/services/interfaces/mealplan";
import {
  MealPlanEntry,
  MealPlanEntryWithRecipe,
  RemoveMealPlanEntry,
  SuggestedMealPlanCategoryWithPlans,
} from "../../domain/mealplan";
import {
  MealPlanEntryResponseDto,
  MealPlanNutritionSummary,
} from "../controller/dto/responseDto";

@Controller("meal-plan")
export class MealplanController {
  constructor(
    @Inject("MealplanFacade")
    private readonly mealplanFacade: MealplanFacade
  ) {}

  @Post("from-suggested")
  async createMealPlanFromSuggestion(
    @Req() req: any,
    @Body() data: CreateMealPlanFromSuggestionDto
  ): Promise<void> {
    const userId = req.userId;
    await this.mealplanFacade.createMealPlanFromSuggestion({ ...data, userId });
  }

  @Public()
  @Get("suggested")
  async getSuggestedMealplans(
    @Req() req: any,
    @Query("limit") limit: number,
    @Query("page") page: number,
    @Query("sortOrderSkipAfter") sortOrderSkipAfter: number,
    @Query("dietType") dietType: string,
    @Query("query") query: string,
    @Query("suitableForGoals") suitableForGoals: string
  ): Promise<PaginatedResponse<any>> {
    return this.mealplanFacade.getAllSuggestedMealplans(
      { limit, page },
      {
        sortOrderSkipAfter: sortOrderSkipAfter,
        dietType: dietType as any,
        suitableForGoals,
        query,
      }
    );
  }

  @Get("suggested/user-metrics")
  async getSuggestedMealplansByUserMetrics(
    @Req() req: any,
    @Query("limit") limit: number,
    @Query("page") page: number
  ): Promise<PaginatedResponse<any>> {
    const userId = req.userId;
    const results =
      await this.mealplanFacade.getSuggestedMealplansByUserMetrics(userId);
    return results;
  }

  @Public()
  @Get("suggested/categories")
  async getSuggestedMealplanByCategory(
    @Req() req: any,
    @Query("limit") limit: number
  ): Promise<SuggestedMealPlanCategoryWithPlans[]> {
    return this.mealplanFacade.getSuggestedMealPlansByCategory({ limit });
  }

  @Public()
  @Get("suggested/random")
  async getRandomSuggestedMealplan(
    @Req() req: any
  ): Promise<SuggestedMealPlanCategoryWithPlans> {
    return this.mealplanFacade.getRamdomSuggestedMealPlans();
  }

  @Public()
  @Get("suggested/:suggestedMealplanId")
  async getSuggestedMealplan(
    @Param("suggestedMealplanId") suggestedMealplanId: string
  ): Promise<any> {
    return this.mealplanFacade.getSuggestedMealPlansById(suggestedMealplanId);
  }
  @Public()
  @Get("suggested/:suggestedMealplanId/recipes")
  async getSuggestedMealplanRecipes(
    @Param("suggestedMealplanId") suggestedMealplanId: string
  ): Promise<any> {
    return this.mealplanFacade.getSuggestedMealPlanRecipes({
      suggestedMealplanId,
      includeRecipe: true,
    });
  }
  @Public()
  @Get("suggested/:suggestedMealplanId/ingredients")
  async getIngredientSuggestedMealplan(
    @Param("suggestedMealplanId") suggestedMealplanId: string
  ): Promise<any> {
    return this.mealplanFacade.getSuggestedMealIngredients(suggestedMealplanId);
  }

  @Public()
  @Get("suggested/category/:categoryId")
  async getSuggestedMealplanByCategoryId(
    @Param("categoryId") categoryId: string
  ) {
    if (!categoryId) {
      throw new BadRequestException("categoryId is required");
    }
    return this.mealplanFacade.getSuggestedMealPlansByCategoryId(categoryId);
  }

  @Get("summary")
  async getUserNutricionalPlanSummary(
    @Req() req: any
  ): Promise<MealPlanNutritionSummary> {
    const userId = req.userId;
    return this.mealplanFacade.getUserNutricionalPlanSummary(userId);
  }

  @Get("active-user-plan/current")
  async getUserActivePlan(@Req() req: any): Promise<any> {
    const userId = req.userId;
    return this.mealplanFacade.getUserActivePlan({
      userId,
      includeSuggestedMealPlan: true,
    });
  }

  @Post("active-user-plan/current")
  async markActiveUserPlanAsCompleated(@Req() req: any): Promise<any> {
    const userId = req.userId;
    return this.mealplanFacade.markUserPlanAsCompleated(userId);
  }

  @Post("active-user-plan/current/cancel")
  async canceActiveUserPlan(@Req() req: any): Promise<any> {
    const userId = req.userId;
    return this.mealplanFacade.canceActiveUserPlan(userId);
  }

  @Get("entries")
  async getMealPlanEntriesWithRecipes(
    @Req() req: any,
    @Query("startDate") startDate: any,
    @Query("endDate") endDate: any
  ): Promise<MealPlanEntryWithRecipe[]> {
    console.log(
      "start date, end getMealPlanEntriesWithRecipes",
      startDate,
      endDate
    );
    const userId = req.userId;
    return this.mealplanFacade.getMealPlanEntriesWithRecipes({
      userId,
      startDate,
      endDate,
    });
  }

  @Get("entries/today")
  async getTodaysMealPlanEntriesWithRecipes(
    @Req() req: any
  ): Promise<MealPlanEntryWithRecipe[]> {
    const userId = req.userId;
    return this.mealplanFacade.getTodaysMealPlanEntriesWithRecipes(userId);
  }

  @Post("entries")
  async createMealPlanEntry(
    @Body() data: MealPlanEntryDto,
    @Req() req: any
  ): Promise<MealPlanEntry> {
    const userId = req.userId;
    return this.mealplanFacade.createMealPlanEntry({ ...data, userId });
  }

  @Post("entries/register-cooked")
  async markRecipeAsCooked(
    @Body() data: MarkMealPlanAsCookedDto,
    @Req() req: any
  ): Promise<void> {
    const userId = req.userId;
    await this.mealplanFacade.registerMealPlanEntryAsCooked({
      ...data,
      userId,
    });
  }

  @Put("entries")
  async updateMealPlanEntry(
    @Body() data: UpdateMealPlanEntryDto
  ): Promise<MealPlanEntry> {
    return this.mealplanFacade.updateMealPlanEntry(data);
  }

  @Delete("entries/:mealType/:selectedDate/:recipeId")
  async deleteMealPlanEntry(
    @Param("mealType") mealType: string,
    @Param("selectedDate") selectedDate: string,
    @Param("recipeId") recipeId: string,

    @Req() req: any
  ): Promise<void> {
    const userId = req.userId;
    return this.mealplanFacade.deleteMealPlanEntry({
      userId,
      mealType,
      selectedDate,
      recipeId,
    } as RemoveMealPlanEntry);
  }

  @Get("recipe-items")
  async getMealPlanRecipeItems(
    @Req() req: any
  ): Promise<MealPlanEntryResponseDto[]> {
    const userId = req.userId;
    return this.mealplanFacade.getMealPlanRecipeItems(userId);
  }
}
