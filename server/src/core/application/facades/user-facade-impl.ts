import { Inject, Injectable, Logger } from "@nestjs/common";
import { Recipe } from "../../domain/recipe.model";
import { GamificationAction, GamificationEvent } from "../../domain/gamification.model";
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
import { UserNutritionalIMetricsDto, UserPreferencesDto, UserSavedRecipeDto } from "../dto";
import { UserFacade, UserService } from "../services/interfaces/user";
import { GamificationService } from "../services/interfaces/gamification";
import { CreateUserNutritionMetricsUseCase } from "../use-cases/user/create-user-nutrition-metrics.use-case";
import { RecalculateUserNutritionalValuesUseCase } from "../use-cases/user/recalculate-user-nutritional-values.use-case";

@Injectable()
export class UserFacadeImpl implements UserFacade {
  private readonly logger = new Logger(UserFacadeImpl.name);

  constructor(
    @Inject("UserService")
    private userService: UserService,
    @Inject("GamificationService")
    private gamificationService: GamificationService,
    private readonly createUserNutritionMetricsUseCase: CreateUserNutritionMetricsUseCase,
    private readonly recalculateUserNutritionalValuesUseCase: RecalculateUserNutritionalValuesUseCase,
  ) {}
  createUserPreferences(data: UserPreferencesDto): Promise<UserPreferences> {
    return this.userService.createUserPreferences(data);
  }
  getUserSavedRecipeEntries(userId: string): Promise<UserSavedRecipeEntry[]> {
    return this.userService.getUserSavedRecipeEntries(userId);
  }
  updateUserPreference(
    dto: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    return this.userService.updateUserPreference(dto);
  }

  async recalculateUserNutritionalValues(
    dto: Partial<UserNutritionMetrics>
  ): Promise<UserNutritionMetrics> {
    return this.recalculateUserNutritionalValuesUseCase.execute(dto);
  }
  getUserCookedRecipes(
    filter: getUserNutricionalDataDto
  ): Promise<UserCookedRecipes[]> {
    return this.userService.getUserCookedRecipes(filter);
  }
  getUserNutricionalHistory(
    filters: getUserNutricionalDataDto
  ): Promise<UserNutritionalHistory[]> {
    return this.userService.getUserNutricionalHistory(filters);
  }
  getWeeklyNutricionalDataConsumed(
    userId: string
  ): Promise<WeeklyNutritionalData> {
    return this.userService.getWeeklyNutricionalDataConsumed(userId);
  }
  getUserActiveNutritionalMetrics(
    userId: string
  ): Promise<UserNutritionMetrics> {
    return this.userService.getUserActiveNutritionalMetrics(userId);
  }

  getUserNutritionalMetricsById(id: string): Promise<UserNutritionMetrics> {
    return this.userService.getUserNutritionalMetricsById(id);
  }

  async createUserNutritionMetrics(
    dto: UserNutritionalIMetricsDto
  ): Promise<UserNutritionMetrics> {
    return this.createUserNutritionMetricsUseCase.execute(dto);
  }

  removeRecipeFavorite(data: RemoveFavorite): Promise<UserSavedRecipeEntry> {
    return this.userService.removeRecipeFavorite(data);
  }
  async saveRecipeFavorite(data: UserSavedRecipeDto): Promise<UserSavedRecipeEntry> {
    const result = await this.userService.saveRecipeFavorite(data);

    await this.emitGamificationEvent({
      userId: data.userId,
      action: GamificationAction.RECIPE_SAVED,
      referenceId: data.recipeId,
      referenceType: "recipe",
      metadata: {},
      timestamp: new Date(),
    });

    return result;
  }
  getUserSavedRecipes(userId: string): Promise<Recipe[]> {
    return this.userService.getUserSavedRecipes(userId);
  }
  getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.userService.getUserPreferences(userId);
  }
  getUserById(userId: string): Promise<User> {
    return this.userService.getUserById(userId);
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
