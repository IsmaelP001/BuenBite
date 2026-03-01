/**
 * Use Case: RecalculateUserNutritionalValues
 *
 * Recalculates and updates a user's nutritional metrics when their profile changes.
 * Extracted from UserFacadeImpl to isolate cross-concern logic.
 */
import { Inject, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { NutritionCalculatorDomainService } from '../../../domain/services/nutrition-calculator.domain-service';
import { UserNutritionMetrics } from '../../../domain/user.model';
import { UserService } from '../../services/interfaces/user';

@Injectable()
export class RecalculateUserNutritionalValuesUseCase {
  constructor(
    @Inject('UserService') private readonly userService: UserService,
  ) {}

  async execute(dto: Partial<UserNutritionMetrics>): Promise<UserNutritionMetrics> {
    const currentMetrics = await this.userService.getUserActiveNutritionalMetrics(dto.userId!);

    const metrics = NutritionCalculatorDomainService.calculatePlan({
      age: currentMetrics.age,
      gender: currentMetrics.gender as any,
      activityLevel: currentMetrics.activityLevel as any,
      weightChangePace: currentMetrics.weightChangePace as any,
      height: currentMetrics.height,
      currentWeight: currentMetrics.currentWeight,
      primaryGoal: currentMetrics.primaryGoal as any,
      weightUnit: currentMetrics.weightUnit as any,
      heightUnit: currentMetrics.heightUnit as any,
      ...dto,
    });

    return await this.userService.updateUserNutritionalMetrics({
      ...metrics,
      ...dto,
      estimatedCompletionDate: metrics.estimatedCompletionDate
        ? format(new Date(metrics.estimatedCompletionDate), 'yyyy-MM-dd')
        : '',
      userId: dto.userId,
    });
  }
}
