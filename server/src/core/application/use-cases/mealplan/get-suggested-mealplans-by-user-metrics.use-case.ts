import { Inject, Injectable } from "@nestjs/common";
import { PaginatedResponse } from "../../../../shared/dto/response";
import { SuggestedMealPlan } from "../../../domain/mealplan";
import { MealplanService } from "../../services/interfaces/mealplan";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class GetSuggestedMealplansByUserMetricsUseCase {
  constructor(
    @Inject("MealplanService")
    private mealplanService: MealplanService,
    @Inject("UserService")
    private userService: UserService,
  ) {}

  async execute(userId: string): Promise<PaginatedResponse<SuggestedMealPlan>> {
    const metrics =
      await this.userService.getUserActiveNutritionalMetrics(userId);

    return await this.mealplanService.getAllSuggestedMealplans(
      {
        limit: 10,
        page: 1,
      },
      {
        dietType: metrics.dietType as any,
        suitableForGoals: metrics.primaryGoal,
        sort: {
          caloriesAvg: metrics.dailyCaloriesTarget,
          proteinsAvg: metrics.dailyProteinTarget,
          fatsAvg: metrics.dailyFatTarget,
          carbsAvg: metrics.dailyCarbsTarget,
        },
      },
    );
  }
}
