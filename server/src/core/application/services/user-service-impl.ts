import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { Recipe } from "../../domain/recipe.model";
import { UserRepository } from "../../domain/repositories";
import {
  getUserNutricionalDataDto,
  RemoveFavorite,
  User,
  UserCookedRecipes,
  UserNutritionalHistory,
  UserNutritionMetrics,
  UserPreferences,
  UserSavedRecipeEntry,
  WeeklyNutritionalData
} from "../../domain/user.model";
import { UserPreferencesDto, UserSavedRecipeDto } from "../dto";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { RedisCacheService } from "./redis-cache.service";
import { UserService } from "./interfaces/user";

@Injectable()
export class UserServiceImpl implements UserService {
  constructor(
    @Inject("UserRepository")
    private userRepository: UserRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  getUserById(userId: string): Promise<User> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.BY_ID(userId),
      CacheKeys.USER.PREFIX,
      () => this.userRepository.getBy({ id: userId }),
      CacheTTL.MEDIUM,
    );
  }
  async createUserPreferences(data: UserPreferencesDto): Promise<UserPreferences> {
    const result = await this.userRepository.createUserPreferences({
      ...data,
      id: uuidv4(),
      isNutritionMetricsConfigured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.PREFERENCES_PREFIX);
    return result;
  }

  getUserNutritionalMetricsById(id: string): Promise<UserNutritionMetrics> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.NUTRITION_BY_ID(id),
      CacheKeys.USER.NUTRITION_PREFIX,
      () => this.userRepository.getUserNutritionalMetricsById(id),
      CacheTTL.MEDIUM,
    );
  }

  getUserSavedRecipeEntries(userId: string): Promise<UserSavedRecipeEntry[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.SAVED_RECIPE_ENTRIES(userId),
      CacheKeys.USER.SAVED_RECIPES_PREFIX,
      () => this.userRepository.getUserSavedRecipeEntries(userId),
      CacheTTL.MEDIUM,
    );
  }
  async updateUserNutritionalMetrics(
    data: Partial<UserNutritionMetrics>
  ): Promise<UserNutritionMetrics> {
    const result = await this.userRepository.updateUserNutritionalMetrics(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.NUTRITION_PREFIX);
    return result;
  }
  async updateUserPreference(
    userId: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const result = await this.userRepository.updateUserPreference(userId);
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.PREFERENCES_PREFIX);
    return result;
  }
  getUserCookedRecipes(
    filter: getUserNutricionalDataDto
  ): Promise<UserCookedRecipes[]> {
    const startDate = filter?.startDate
      ? new Date(filter.startDate)
      : undefined;
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }
    const endDate = filter?.endDate ? new Date(filter.endDate) : undefined;
    if (endDate) {
      endDate.setHours(0, 0, 0, 0);
    }
    const normalizedFilter = { ...filter, endDate, startDate };
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.COOKED_RECIPES(normalizedFilter),
      CacheKeys.USER.COOKED_PREFIX,
      () => this.userRepository.getUserCookedRecipes(normalizedFilter),
      CacheTTL.SHORT,
    );
  }

  getUserNutricionalHistory(
    filters: getUserNutricionalDataDto
  ): Promise<UserNutritionalHistory[]> {
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : undefined;
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
    }
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;
    if (endDate) {
      endDate.setHours(0, 0, 0, 0);
    }
    const normalizedFilters = { ...filters, startDate, endDate };
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.NUTRITIONAL_HISTORY(normalizedFilters),
      CacheKeys.USER.HISTORY_PREFIX,
      () => this.userRepository.getUserNutricionalHistory(normalizedFilters),
      CacheTTL.SHORT,
    );
  }

  getUserActiveNutritionalMetrics(
    userId: string
  ): Promise<UserNutritionMetrics> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.NUTRITION(userId),
      CacheKeys.USER.NUTRITION_PREFIX,
      () => this.userRepository.getUserActiveNutritionalMetrics(userId),
      CacheTTL.MEDIUM,
    );
  }

  getWeeklyNutricionalDataConsumed(
    userId: string
  ): Promise<WeeklyNutritionalData> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.WEEKLY_NUTRITION(userId),
      CacheKeys.USER.HISTORY_PREFIX,
      async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);

        const queryResults = await this.userRepository.getUserNutricionalHistory({
          startDate: startDate,
          userId,
        });

        const results = queryResults.reduce(
          (acc, item) => {
            acc.caloriesConsumedAvg += item.calories.consumed ?? 0;
            acc.carbsConsumedAvg += item.carbs.consumed ?? 0;
            acc.proteinsConsumedAvg += item.protein.consumed ?? 0;
            acc.fatsConsumedAvg += item.fats.consumed ?? 0;
            return acc;
          },
          {
            caloriesConsumedAvg: 0,
            carbsConsumedAvg: 0,
            proteinsConsumedAvg: 0,
            fatsConsumedAvg: 0,
          }
        );
        return {
          caloriesConsumedAvg: results.caloriesConsumedAvg / 7,
          carbsConsumedAvg: results.carbsConsumedAvg / 7,
          proteinsConsumedAvg: results.proteinsConsumedAvg / 7,
          fatsConsumedAvg: results.fatsConsumedAvg / 7,
        };
      },
      CacheTTL.SHORT,
    );
  }

  async updateUserPreferences(
    data: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const result = await this.userRepository.updateUserPreferences(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.PREFERENCES_PREFIX);
    return result;
  }

  async createUserNutritionMetrics(
    dto: UserNutritionMetrics
  ): Promise<UserNutritionMetrics> {
    const result = await this.userRepository.createUserNutritionMetrics(dto);
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.NUTRITION_PREFIX);
    return result;
  }

  async removeRecipeFavorite(data: RemoveFavorite): Promise<UserSavedRecipeEntry> {
    const result = await this.userRepository.removeRecipeFavorite(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.SAVED_RECIPES_PREFIX);
    return result;
  }

  async saveRecipeFavorite(dto: UserSavedRecipeDto): Promise<UserSavedRecipeEntry> {
    const data: UserSavedRecipeEntry = {
      ...dto,
      id: uuidv4(),
      isFavorite: dto?.isFavorite ? dto.isFavorite : false,
    };
    const result = await this.userRepository.saveRecipeFavorite(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.USER.SAVED_RECIPES_PREFIX);
    return result;
  }

  getUserSavedRecipes(userId: string): Promise<Recipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.SAVED_RECIPES(userId),
      CacheKeys.USER.SAVED_RECIPES_PREFIX,
      () => this.userRepository.getUserSavedRecipes(userId),
      CacheTTL.MEDIUM,
    );
  }

  getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.redisCacheService.getOrSet(
      CacheKeys.USER.PREFERENCES(userId),
      CacheKeys.USER.PREFERENCES_PREFIX,
      () => this.userRepository.getUserPreferences(userId),
      CacheTTL.MEDIUM,
    );
  }

}
