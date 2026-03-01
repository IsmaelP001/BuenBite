import { Inject, Injectable } from "@nestjs/common";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import {
  getSuggestedMealIngredients,
  GetUserActivePlanFilter,
  MealPlanEntry,
  MealPlanEntryFilters,
  MealPlanEntryWithRecipe,
  RemoveMealPlanEntry,
  SuggestedMealPlan,
  SuggestedMealPlanCategoryWithPlans,
  SuggestedMealplanFilter,
  SuggestedMealplanRecipesFilter,
  UserActiveMealPlan,
} from "../../domain/mealplan";
import {
  MealPlanEntryResponseDto,
  MealPlanNutritionSummary,
} from "../../insfrastructure/controller/dto/responseDto";
import {
  CreateMealPlanFromSuggestionDto,
  GetMealplanRecipeItemsDto,
  MarkMealPlanAsCookedDto,
  MealPlanEntryDto,
  UpdateMealPlanEntryDto,
  UserActiveMealPlanDto,
} from "../dto";
import {
  MealplanFacade,
  MealplanService,
} from "../services/interfaces/mealplan";
import { CreateMealPlanFromSuggestionUseCase } from "../use-cases/mealplan/create-meal-plan-from-suggestion.use-case";
import { GetSuggestedMealplansByUserMetricsUseCase } from "../use-cases/mealplan/get-suggested-mealplans-by-user-metrics.use-case";
import { RegisterMealPlanAsCookedUseCase } from "../use-cases/mealplan/register-mealplan-as-cooked.use-case";
import { CancelActiveUserPlanUseCase } from "../use-cases/mealplan/cancel-active-user-plan.use-case";
import { MarkUserPlanAsCompletedUseCase } from "../use-cases/mealplan/mark-user-plan-as-completed.use-case";

@Injectable()
export class MealplanFacadeImpl implements MealplanFacade {
  constructor(
    @Inject("MealplanService")
    private readonly mealplanService: MealplanService,
    private readonly getSuggestedMealplansByUserMetricsUseCase: GetSuggestedMealplansByUserMetricsUseCase,
    private readonly createMealPlanFromSuggestionUseCase: CreateMealPlanFromSuggestionUseCase,
    private readonly registerMealPlanAsCookedUseCase: RegisterMealPlanAsCookedUseCase,
    private readonly cancelActiveUserPlanUseCase: CancelActiveUserPlanUseCase,
    private readonly markUserPlanAsCompletedUseCase: MarkUserPlanAsCompletedUseCase,
  ) {}

  getSuggestedMealPlansById(
    suggestedMealplanId: string,
  ): Promise<SuggestedMealPlan> {
    return this.mealplanService.getSuggestedMealPlansById(suggestedMealplanId);
  }
  async canceActiveUserPlan(userId: string): Promise<UserActiveMealPlan> {
    return this.cancelActiveUserPlanUseCase.execute(userId);
  }

  async getSuggestedMealplansByUserMetrics(
    userId: string,
  ): Promise<PaginatedResponse<SuggestedMealPlan>> {
    return this.getSuggestedMealplansByUserMetricsUseCase.execute(userId);
  }

  getAllSuggestedMealplans(
    pagination: PaginationParams,
    filter?: SuggestedMealplanFilter,
  ): Promise<PaginatedResponse<SuggestedMealPlan>> {
    return this.mealplanService.getAllSuggestedMealplans(pagination, filter);
  }
  async markUserPlanAsCompleated(userId: string): Promise<UserActiveMealPlan> {
    return this.markUserPlanAsCompletedUseCase.execute(userId);
  }
  async getTodaysMealPlanEntriesWithRecipes(
    userId: string,
  ): Promise<MealPlanEntryWithRecipe[]> {
    const result =
      await this.mealplanService.getTodaysMealPlanEntriesWithRecipes(userId);
    return result;
  }

  getUserActivePlan(
    filters: GetUserActivePlanFilter,
  ): Promise<UserActiveMealPlan> {
    return this.mealplanService.getUserActivePlan(filters);
  }

  createUserActivePlan(
    data: UserActiveMealPlanDto,
  ): Promise<UserActiveMealPlanDto> {
    return this.mealplanService.createUserActivePlan(data);
  }

  getSuggestedMealPlanRecipes(
    filter: SuggestedMealplanRecipesFilter,
  ): Promise<any[]> {
    return this.mealplanService.getSuggestedMealPlanRecipes(filter);
  }

  getSuggestedMealIngredients(
    suggestedMealplanId: string,
  ): Promise<getSuggestedMealIngredients[]> {
    return this.mealplanService.getSuggestedMealIngredients(
      suggestedMealplanId,
    );
  }

  async createMealPlanFromSuggestion(
    dto: CreateMealPlanFromSuggestionDto,
  ): Promise<void> {
    return this.createMealPlanFromSuggestionUseCase.execute(dto);
  }
  getRamdomSuggestedMealPlans(): Promise<SuggestedMealPlanCategoryWithPlans> {
    return this.mealplanService.getRamdomSuggestedMealPlans();
  }

  getSuggestedMealPlansByCategoryId(
    categoryId: string,
  ): Promise<SuggestedMealPlanCategoryWithPlans> {
    return this.mealplanService.getSuggestedMealPlansByCategoryId(categoryId);
  }

  getSuggestedMealPlansByCategory(
    filter?: SuggestedMealplanFilter,
  ): Promise<SuggestedMealPlanCategoryWithPlans[]> {
    return this.mealplanService.getSuggestedMealPlansByCategory(filter);
  }

  async registerMealPlanEntryAsCooked(
    data: MarkMealPlanAsCookedDto,
  ): Promise<void> {
    return this.registerMealPlanAsCookedUseCase.execute(data);
  }

  async getMealPlanEntriesWithRecipes(
    filters: MealPlanEntryFilters,
  ): Promise<MealPlanEntryWithRecipe[]> {
    return this.mealplanService.getMealPlanEntriesWithRecipes(filters);
  }

  async getMealPlanRecipeItems(
    dto: GetMealplanRecipeItemsDto,
  ): Promise<MealPlanEntryResponseDto[]> {
    return this.mealplanService.getMealPlanRecipeItems({
      ...dto,
    });
  }

  getUserNutricionalPlanSummary(
    userId: string,
  ): Promise<MealPlanNutritionSummary> {
    return this.mealplanService.getUserNutricionalPlanSummary(userId);
  }

  async deleteMealPlanEntry(data: RemoveMealPlanEntry): Promise<void> {
    return this.mealplanService.deleteMealPlanEntry({
      ...data,
      userId: data.userId,
    });
  }

  async createMealPlanEntry(data: MealPlanEntryDto): Promise<MealPlanEntry> {
    return this.mealplanService.createMealPlanEntry({
      ...data,
      userId: data?.userId,
    });
  }

  updateMealPlanEntry(data: UpdateMealPlanEntryDto): Promise<MealPlanEntry> {
    return this.mealplanService.updateMealPlanEntry(data);
  }
}
