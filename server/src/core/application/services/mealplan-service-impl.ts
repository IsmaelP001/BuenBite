import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { IngredientUnitConverter } from "../../../utils/unitConverterV2";
import {
  GetMealplanRecipeItems,
  getSuggestedMealIngredients,
  GetUserActivePlanFilter,
  MealPlanEntry,
  MealPlanEntryFilters,
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
} from "../../domain/mealplan";
import { ALLOW_PURCHASE_UNITS } from "../../domain/purchases.model";
import { MealplanRepository } from "../../domain/repositories";
import {
  MealPlanEntryResponseDto,
  MealPlanNutritionSummary,
} from "../../insfrastructure/controller/dto/responseDto";
import {
  MarkMealPlanAsCookedDto,
  MealPlanEntryDto,
  UpdateMealPlanEntryDto,
  UserActiveMealPlanDto,
} from "../dto";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { RedisCacheService } from "./redis-cache.service";
import { MealplanService } from "./interfaces/mealplan";

@Injectable()
export class MealplanServiceImpl implements MealplanService {
  constructor(
    @Inject("MealplanRepository")
    private readonly mealplanRepository: MealplanRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}
  getSuggestedMealPlanRecipeEntry(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlanRecipeEntry[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_RECIPE_ENTRY(suggestedMealplanId),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      () => this.mealplanRepository.getSuggestedMealPlanRecipeEntry(suggestedMealplanId),
      CacheTTL.LONG,
    );
  }

  getSuggestedMealPlansById(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlan> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_BY_ID(suggestedMealplanId),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      () => this.mealplanRepository.getSuggestedMealPlansById(suggestedMealplanId),
      CacheTTL.LONG,
    );
  }

  getAllSuggestedMealplans(
    pagination: PaginationParams,
    filter?: SuggestedMealplanFilter
  ): Promise<PaginatedResponse<SuggestedMealPlan>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_ALL(pagination, filter),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      () => this.mealplanRepository.getAllSuggestedMealplans(pagination, filter),
      CacheTTL.LONG,
    );
  }

  getUserActivePlan(
    filters: GetUserActivePlanFilter
  ): Promise<UserActiveMealPlan> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.ACTIVE(filters),
      CacheKeys.MEALPLAN.ACTIVE_PREFIX,
      () => this.mealplanRepository.getUserActivePlan(filters),
      CacheTTL.MEDIUM,
    );
  }

  async updateUserActivePlan(
    data: UpdateUserActiveMealPlan
  ): Promise<UserActiveMealPlan> {
    const result = await this.mealplanRepository.updateUserActivePlan(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ACTIVE_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    return result;
  }

  async markUserPlanAsCompleated(
    userMealplanId: string
  ): Promise<UserActiveMealPlan> {
    const result = await this.mealplanRepository.updateUserActivePlan({
      id: userMealplanId,
      status: "completed",
    });
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ACTIVE_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    return result;
  }
  

  async canceActiveUserPlan(userMealplanId: string): Promise<UserActiveMealPlan> {
    const result = await this.mealplanRepository.updateUserActivePlan({
      id: userMealplanId,
      status: "canceled",
    });
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ACTIVE_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    return result;
  }

  async createUserActivePlan(
    data: UserActiveMealPlanDto
  ): Promise<UserActiveMealPlanDto> {
    const newActiveUserPlan: UserActiveMealPlan = {
      ...data,
      createdAt: new Date(),
      status: "active",
    };
    const result = await this.mealplanRepository.createUserActivePlan(newActiveUserPlan);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ACTIVE_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    return result;
  }

  getSuggestedMealPlanRecipes(
    filter: SuggestedMealplanRecipesFilter
  ): Promise<SuggestedMealplanRecipes[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_RECIPES(filter),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      () => this.mealplanRepository.getSuggestedMealPlanRecipes(filter),
      CacheTTL.LONG,
    );
  }

  async getSuggestedMealIngredients(
    suggestedMealplanId: string
  ): Promise<getSuggestedMealIngredients[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_INGREDIENTS(suggestedMealplanId),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      async () => {
    const ingredients =
      await this.mealplanRepository.getSuggestedMealIngredients(
        suggestedMealplanId
      );
    const allowUnitsMap: Record<string, boolean> = Object.fromEntries(
      ALLOW_PURCHASE_UNITS.map((unit) => [unit, true])
    );
    const results = ingredients.reduce<
      Record<string, getSuggestedMealIngredients>
    >((acc, item: getSuggestedMealIngredients) => {
      const key = item.ingredientId;
      const currentItem = acc[key];

      if (!currentItem) {
        const shouldConvertUnit = !allowUnitsMap[item.measurementType];
        const measurementType = shouldConvertUnit
          ? "gram"
          : item.measurementType;

        const { value, success, error } = IngredientUnitConverter.convert(
          Number(item.measurementValue),
          item.measurementType,
          measurementType,
          item.conversions
        );

        acc[key] = {
          ...item,
          measurementValue: success
            ? Math.round(value!)
            : item.measurementValue,
          measurementType: success ? measurementType : item.measurementType,
          isSuccessConversion: success,
        };
      } else {
        const { value, success, error } = IngredientUnitConverter.convert(
          Number(item.measurementValue),
          item.measurementType,
          currentItem.measurementType,
          item.conversions
        );

        const newMeasurementValue = Math.round(
          (success ? value : item.measurementValue!) ?? 0
        );

        acc[key] = {
          ...currentItem,
          measurementValue:
            (currentItem.measurementValue ?? 0) + (newMeasurementValue ?? 0)!,
          isSuccessConversion: success,
        };
      }

      return acc;
    }, {});

    return Object.values(results);
      },
      CacheTTL.LONG,
    );
  }

  getSuggestedMealPlansByCategoryId(
    categoryId: string
  ): Promise<SuggestedMealPlanCategoryWithPlans> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_BY_CATEGORY_ID(categoryId),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      () => this.mealplanRepository.getSuggestedMealPlansByCategoryId(categoryId),
      CacheTTL.LONG,
    );
  }

  getSuggestedMealPlansByCategory(
    filter?: SuggestedMealplanFilter
  ): Promise<SuggestedMealPlanCategoryWithPlans[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_BY_CATEGORY(filter),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      () => this.mealplanRepository.getSuggestedMealPlansByCategory(filter),
      CacheTTL.LONG,
    );
  }

  async getRamdomSuggestedMealPlans(): Promise<SuggestedMealPlanCategoryWithPlans> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.SUGGESTED_RANDOM(),
      CacheKeys.MEALPLAN.SUGGESTED_PREFIX,
      async () => {
        const [result] =
          await this.mealplanRepository.getSuggestedMealPlansByCategory({
            isRandom: true,
            limit: 1,
          });
        return result;
      },
      CacheTTL.SHORT,
    );
  }

  getMealPlanEntriesWithRecipes(
    filters: MealPlanEntryFilters
  ): Promise<MealPlanEntryWithRecipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.ENTRIES(filters),
      CacheKeys.MEALPLAN.ENTRIES_PREFIX,
      async () => {
    let results = await this.mealplanRepository.getMealPlanEntries({
      ...filters,
      includeRecipes: true,
      userId: filters.userId,
    });

    results = results.map((item) => ({
      ...item,
      nutritionalValuesPerServing: {
        calories: Math.max(item.recipe?.calories! / item?.servings!, 0),
        carbohydrates: Math.max(item.recipe?.carbs! / item?.servings!, 0),
        protein: Math.max(item.recipe?.proteins! / item?.servings!, 0),
        fat: Math.max(item.recipe?.fats! / item?.servings!, 0),
      },
    }));

    const groupedResults = results.reduce((acc: any, item) => {
      if (!acc[item.plannedDate]) {
        acc[item.plannedDate] = [];
      }
      acc[item.plannedDate].push(item);
      return acc;
    }, {});

    return groupedResults;
      },
      CacheTTL.SHORT,
    );
  }

  getTodaysMealPlanEntriesWithRecipes(
    userId: string
  ): Promise<MealPlanEntryWithRecipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.ENTRIES_TODAY(userId),
      CacheKeys.MEALPLAN.ENTRIES_PREFIX,
      async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString().split("T")[0];
        return this.mealplanRepository.getMealPlanEntries({
          includeRecipes: true,
          userId,
          startDate: todayISO,
          endDate: todayISO,
          isCooked: false,
        });
      },
      CacheTTL.VERY_SHORT,
    );
  }

  async registerMealPlanEntryAsCooked(
    data: MarkMealPlanAsCookedDto
  ): Promise<MealPlanEntry> {
    const result = await this.mealplanRepository.updateMealPlanEntry(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    return result;
  }

  getMealPlanRecipeItems(
    dto: GetMealplanRecipeItems
  ): Promise<MealPlanEntryResponseDto[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.RECIPE_ITEMS(dto),
      CacheKeys.MEALPLAN.ENTRIES_PREFIX,
      () => this.mealplanRepository.getMealPlanRecipeItems(dto),
      CacheTTL.MEDIUM,
    );
  }

  getUserNutricionalPlanSummary(
    userId: string
  ): Promise<MealPlanNutritionSummary> {
    return this.redisCacheService.getOrSet(
      CacheKeys.MEALPLAN.NUTRITION_SUMMARY(userId),
      CacheKeys.MEALPLAN.NUTRITION_PREFIX,
      () => this.mealplanRepository.getUserNutricionalPlanSummary(userId),
      CacheTTL.SHORT,
    );
  }

  async updateMealPlanEntry(data: UpdateMealPlanEntryDto): Promise<MealPlanEntry> {
    const result = await this.mealplanRepository.updateMealPlanEntry(data as any);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.NUTRITION_PREFIX);
    return result;
  }

  async deleteMealPlanEntry(data: RemoveMealPlanEntry): Promise<void> {
    await this.mealplanRepository.deleteMealPlanEntry(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
  }

  async createMealPlanEntry(
    data: MealPlanEntryDto | MealPlanEntryDto[]
  ): Promise<MealPlanEntry> {
    const date = new Date();
    let entriesArray = Array.isArray(data) ? data : [data];
    const itemsToInsert: MealPlanEntry[] = entriesArray.map((item) => ({
      ...item,
      isCooked: false,
      id: uuidv4(),
      createdAt: date,
    }));
    const result = (await this.mealplanRepository.createMealPlanEntry(
      itemsToInsert
    )) as any;
    await this.redisCacheService.invalidatePrefix(CacheKeys.MEALPLAN.ENTRIES_PREFIX);
    return result;
  }
}
