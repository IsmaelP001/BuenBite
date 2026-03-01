/**
 * Use Case: RegisterMealPlanEntryAsCooked
 *
 * Marks a meal plan entry as cooked and optionally updates the active plan progress.
 * Extracted from MealplanFacadeImpl.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { GamificationAction, GamificationEvent } from '../../../domain/gamification.model';
import { MarkMealPlanAsCookedDto } from '../../dto';
import { MealplanService } from '../../services/interfaces/mealplan';
import { GamificationService } from '../../services/interfaces/gamification';

@Injectable()
export class RegisterMealPlanAsCookedUseCase {
  private readonly logger = new Logger(RegisterMealPlanAsCookedUseCase.name);

  constructor(
    @Inject('MealplanService') private readonly mealplanService: MealplanService,
    @Inject('GamificationService') private readonly gamificationService: GamificationService,
  ) {}

  async execute(data: MarkMealPlanAsCookedDto): Promise<void> {
    const registerPromise = this.mealplanService.registerMealPlanEntryAsCooked(data);
    const promises: Promise<any>[] = [registerPromise];

    if (data?.activeMealplanId) {
      const updatePromise = this.mealplanService.updateUserActivePlan({
        addToCompleatedRecipes: 1,
        id: data.activeMealplanId,
      });
      promises.push(updatePromise);
    }

    await Promise.all(promises);

    await this.emitGamificationEvent({
      userId: data.userId,
      action: GamificationAction.RECIPE_COOKED,
      referenceId: data.recipeId,
      referenceType: "mealplan_entry",
      metadata: { mealplanEntryId: data.id },
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
