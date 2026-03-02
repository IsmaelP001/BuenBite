/**
 * Use Case: CancelActiveUserPlan
 *
 * Cancels a user's currently active meal plan.
 * Extracted from MealplanFacadeImpl.
 */
import { Inject, Injectable } from '@nestjs/common';
import { UserActiveMealPlan } from '../../../domain/mealplan';
import { MealplanService } from '../../services/interfaces/mealplan';

@Injectable()
export class CancelActiveUserPlanUseCase {
  constructor(
    @Inject('MealplanService') private readonly mealplanService: MealplanService,
  ) {}

  async execute(userId: string): Promise<UserActiveMealPlan> {
    const activePlan = await this.mealplanService.getUserActivePlan({ userId });
    return this.mealplanService.canceActiveUserPlan(activePlan.id!);
  }
}
