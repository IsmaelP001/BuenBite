import { Inject, Injectable, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { GamificationAction, GamificationEvent } from "../../../domain/gamification.model";
import { CreateMealPlanFromSuggestionDto, MealPlanEntryDto } from "../../dto";
import { MealplanService } from "../../services/interfaces/mealplan";
import { GamificationService } from "../../services/interfaces/gamification";

@Injectable()
export class CreateMealPlanFromSuggestionUseCase {
  private readonly logger = new Logger(CreateMealPlanFromSuggestionUseCase.name);

  constructor(
    @Inject("MealplanService")
    private mealplanService: MealplanService,
    @Inject("GamificationService")
    private gamificationService: GamificationService,
  ) {}

  private getNextValidDate(startDate: Date, excludedDays: number[] = []): Date {
    const date = new Date(startDate);

    if (!excludedDays || excludedDays.length === 0) {
      return date;
    }

    let iterations = 0;
    while (excludedDays.includes(date.getDay()) && iterations < 7) {
      date.setDate(date.getDate() + 1);
      iterations++;
    }

    if (iterations === 7) {
      throw new Error(
        "No hay días válidos disponibles. Todos los días de la semana están excluidos.",
      );
    }

    return date;
  }

  private calculatePlannedDate(
    baseDate: Date,
    daysToAdd: number,
    excludedDays: number[] = [],
  ): Date {
    let currentDate = new Date(baseDate);
    currentDate.setHours(0, 0, 0, 0);

    if (daysToAdd === 0) {
      return this.getNextValidDate(currentDate, excludedDays);
    }

    let validDaysCount = 0;

    while (validDaysCount < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);

      if (!excludedDays || !excludedDays.includes(currentDate.getDay())) {
        validDaysCount++;
      }
    }

    return currentDate;
  }

  async execute(dto: CreateMealPlanFromSuggestionDto): Promise<void> {
    const suggestedMealplanRecipes =
      await this.mealplanService.getSuggestedMealPlanRecipes({
        suggestedMealplanId: dto.suggestedMealplanId,
        includeRecipe: false,
      });

    const activeMealPlanId = uuidv4();

    const startDate = new Date(dto.startDate);
    startDate.setHours(0, 0, 0, 0);
    const validStartDate = this.getNextValidDate(startDate, dto.excludedDays);

    const mealplanEntries: MealPlanEntryDto[] = suggestedMealplanRecipes.map(
      (item) => {
        const plannedDate = this.calculatePlannedDate(
          validStartDate,
          item.dayNumber,
          dto.excludedDays,
        );

        return {
          servings: 0,
          activeMealPlanId,
          plannedDate: plannedDate.toISOString().split("T")[0],
          recipeId: item.recipeId,
          mealType: item.mealType,
          userId: dto.userId,
        };
      },
    );

    await this.mealplanService.createUserActivePlan({
      id: activeMealPlanId,
      userId: dto.userId,
      suggestedMealPlanId: dto.suggestedMealplanId,
      startDate: validStartDate.toISOString().split("T")[0],
      currentDay: 1,
      totalRecipes: suggestedMealplanRecipes.length,
    });

    await this.mealplanService.createMealPlanEntry(mealplanEntries);

    await this.emitGamificationEvent({
      userId: dto.userId,
      action: GamificationAction.MEALPLAN_ENTRY_CREATED,
      referenceId: activeMealPlanId,
      referenceType: "mealplan",
      metadata: { totalEntries: mealplanEntries.length },
      timestamp: new Date(),
    });
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
