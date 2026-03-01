import { PaginationParams } from "../../../../shared/dto/input";
import { PaginatedResponse } from "../../../../shared/dto/response";
import {
  GetMealplanRecipeItems,
  getSuggestedMealIngredients,
  GetUserActivePlanFilter,
  MealPlanEntry,
  MealPlanEntryFilters,
  MealPlanEntryWithIngredient,
  MealPlanEntryWithRecipe,
  RemoveMealPlanEntry,
  SuggestedMealPlan,
  SuggestedMealPlanCategoryWithPlans,
  SuggestedMealplanFilter,
  SuggestedMealPlanRecipeEntry,
  SuggestedMealplanRecipes,
  SuggestedMealplanRecipesFilter,
  UpdateUserActiveMealPlan,
  UserActiveMealPlan,
} from "../../../domain/mealplan";
import { MealPlanNutritionSummary } from "../../../insfrastructure/controller/dto/responseDto";
import {
  CreateMealPlanFromSuggestionDto,
  GetMealplanRecipeItemsDto,
  MarkMealPlanAsCookedDto,
  MealPlanEntryDto,
  UpdateMealPlanEntryDto,
  UserActiveMealPlanDto,
} from "../../dto";

export interface MealplanService {
  getSuggestedMealPlansById(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlan>;
  deleteMealPlanEntry(data: RemoveMealPlanEntry): Promise<void>;
  getUserNutricionalPlanSummary(
    userId: string
  ): Promise<MealPlanNutritionSummary>;
  getMealPlanRecipeItems(
    dto: GetMealplanRecipeItems
  ): Promise<MealPlanEntryWithIngredient[]>;
  updateMealPlanEntry(data: UpdateMealPlanEntryDto): Promise<MealPlanEntry>;
  createMealPlanEntry(
    data: MealPlanEntryDto | MealPlanEntryDto[]
  ): Promise<MealPlanEntry>;
  getMealPlanEntriesWithRecipes(
    filters: MealPlanEntryFilters
  ): Promise<MealPlanEntryWithRecipe[]>;
  registerMealPlanEntryAsCooked(
    data: MarkMealPlanAsCookedDto
  ): Promise<MealPlanEntry>;
  getSuggestedMealPlansByCategoryId(
    categoryId: string
  ): Promise<SuggestedMealPlanCategoryWithPlans>;
  getSuggestedMealPlansByCategory(
    filter?: SuggestedMealplanFilter
  ): Promise<SuggestedMealPlanCategoryWithPlans[]>;
  getRamdomSuggestedMealPlans(): Promise<SuggestedMealPlanCategoryWithPlans>;
  getSuggestedMealIngredients(
    suggestedMealplanId: string
  ): Promise<getSuggestedMealIngredients[]>;
  getSuggestedMealPlanRecipes(
    filter: SuggestedMealplanRecipesFilter
  ): Promise<SuggestedMealplanRecipes[]>;
  createUserActivePlan(
    data: UserActiveMealPlanDto
  ): Promise<UserActiveMealPlanDto>;
  updateUserActivePlan(
    data: UpdateUserActiveMealPlan
  ): Promise<UserActiveMealPlan>;
  getUserActivePlan(
    filters: GetUserActivePlanFilter
  ): Promise<UserActiveMealPlan>;
  getTodaysMealPlanEntriesWithRecipes(
    userId: string
  ): Promise<MealPlanEntryWithRecipe[]>;
  markUserPlanAsCompleated(userMealplanId: string): Promise<UserActiveMealPlan>;
  getAllSuggestedMealplans(
    pagination: PaginationParams,
    filter?: SuggestedMealplanFilter
  ): Promise<PaginatedResponse<SuggestedMealPlan>>;
  canceActiveUserPlan(userMealplanId: string): Promise<UserActiveMealPlan>;
  getSuggestedMealPlanRecipeEntry(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlanRecipeEntry[]>;
}

export interface MealplanFacade {
  getSuggestedMealPlansById(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlan>;
  deleteMealPlanEntry(data: RemoveMealPlanEntry): Promise<void>;
  createMealPlanEntry(data: MealPlanEntryDto): Promise<MealPlanEntry>;
  updateMealPlanEntry(data: UpdateMealPlanEntryDto): Promise<MealPlanEntry>;
  getUserNutricionalPlanSummary(
    userId: string
  ): Promise<MealPlanNutritionSummary>;
  getMealPlanRecipeItems(
    dto: GetMealplanRecipeItemsDto
  ): Promise<MealPlanEntryWithIngredient[]>;
  getMealPlanEntriesWithRecipes(
    filters: MealPlanEntryFilters
  ): Promise<MealPlanEntryWithRecipe[]>;
  registerMealPlanEntryAsCooked(data: MarkMealPlanAsCookedDto): Promise<void>;
  getSuggestedMealPlansByCategoryId(
    categoryId: string
  ): Promise<SuggestedMealPlanCategoryWithPlans>;
  getSuggestedMealPlansByCategory(
    filter?: SuggestedMealplanFilter
  ): Promise<SuggestedMealPlanCategoryWithPlans[]>;
  getRamdomSuggestedMealPlans(): Promise<SuggestedMealPlanCategoryWithPlans>;
  getSuggestedMealIngredients(
    suggestedMealplanId: string
  ): Promise<getSuggestedMealIngredients[]>;
  getSuggestedMealPlanRecipes(
    filter: SuggestedMealplanRecipesFilter
  ): Promise<SuggestedMealplanRecipes[]>;
  createMealPlanFromSuggestion(
    dto: CreateMealPlanFromSuggestionDto
  ): Promise<void>;
  createUserActivePlan(
    data: UserActiveMealPlanDto
  ): Promise<UserActiveMealPlanDto>;
  getUserActivePlan(
    filters: GetUserActivePlanFilter
  ): Promise<UserActiveMealPlan>;
  getTodaysMealPlanEntriesWithRecipes(
    userId: string
  ): Promise<MealPlanEntryWithRecipe[]>;
  markUserPlanAsCompleated(userId: string): Promise<UserActiveMealPlan>;
  getAllSuggestedMealplans(
    pagination: PaginationParams,
    filter?: SuggestedMealplanFilter
  ): Promise<PaginatedResponse<SuggestedMealPlan>>;
  canceActiveUserPlan(userId: string): Promise<UserActiveMealPlan>;
  getSuggestedMealplansByUserMetrics(
    userId: string
  ): Promise<PaginatedResponse<SuggestedMealPlan>>;
}
