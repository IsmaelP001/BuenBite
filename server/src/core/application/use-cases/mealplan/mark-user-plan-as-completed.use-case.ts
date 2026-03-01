/**
 * Use Case: MarkUserPlanAsCompleted
 *
 * Marks a user's active meal plan as completed.
 * Extracted from MealplanFacadeImpl.
 */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { UserActiveMealPlan } from '../../../domain/mealplan';
import { GamificationAction, GamificationEvent } from '../../../domain/gamification.model';
import { MealplanService } from '../../services/interfaces/mealplan';
import { GamificationService } from '../../services/interfaces/gamification';

@Injectable()
export class MarkUserPlanAsCompletedUseCase {
  private readonly logger = new Logger(MarkUserPlanAsCompletedUseCase.name);

  constructor(
    @Inject('MealplanService') private readonly mealplanService: MealplanService,
    @Inject('GamificationService') private readonly gamificationService: GamificationService,
  ) {}

  async execute(userId: string): Promise<UserActiveMealPlan> {
    const activePlan = await this.mealplanService.getUserActivePlan({ userId });
    const result = await this.mealplanService.markUserPlanAsCompleated(activePlan.id!);

    await this.emitGamificationEvent({
      userId,
      action: GamificationAction.MEALPLAN_COMPLETED,
      referenceId: activePlan.id!,
      referenceType: "mealplan",
      metadata: {},
      timestamp: new Date(),
    });

    return result;
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
