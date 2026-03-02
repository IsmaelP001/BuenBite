/**
 * Use Case: CreateUserNutritionMetrics
 *
 * Orchestrates nutrition plan calculation + user preferences update.
 * Extracted from UserFacadeImpl. Uses the domain NutritionCalculator.
 */
import { Inject, Injectable } from '@nestjs/common';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { NutritionCalculatorDomainService } from '../../../domain/services/nutrition-calculator.domain-service';
import { UserNutritionMetrics } from '../../../domain/user.model';
import { UserNutritionalIMetricsDto } from '../../dto';
import { UserService } from '../../services/interfaces/user';

@Injectable()
export class CreateUserNutritionMetricsUseCase {
  constructor(
    @Inject('UserService') private readonly userService: UserService,
  ) {}

  async execute(dto: UserNutritionalIMetricsDto): Promise<UserNutritionMetrics> {
    const metrics = NutritionCalculatorDomainService.calculatePlan(dto);

    const userNutritionMetricsPromise = this.userService.createUserNutritionMetrics({
      ...metrics,
      id: uuidv4(),
      userId: dto.userId,
      dietType: dto.dietType,
      primaryGoal: dto.primaryGoal,
      estimatedCompletionDate: !isNaN(metrics.estimatedCompletionDate.getTime())
        ? format(metrics.estimatedCompletionDate, 'yyyy-MM-dd')
        : undefined,
      age: dto.age!,
      gender: dto.gender!,
      activityLevel: dto.activityLevel!,
      weightChangePace: dto.weightChangePace!,
    });

    const updateUserPreferencesPromise = this.userService.updateUserPreferences({
      lunchTime: dto.lunchTime ?? undefined,
      dinnerTime: dto.dinnerTime ?? undefined,
      breakfastTime: dto.breakfastTime ?? undefined,
      primaryGoal: dto.primaryGoal ?? undefined,
      userId: dto.userId,
      isNutritionMetricsConfigured: true,
      dietType: dto.dietType ?? undefined,
    });

    await Promise.all([userNutritionMetricsPromise, updateUserPreferencesPromise]);
    return userNutritionMetricsPromise;
  }
}
