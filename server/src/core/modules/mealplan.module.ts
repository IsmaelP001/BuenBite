import { Module } from "@nestjs/common";
import { MealplanFacadeImpl } from "../application/facades/mealplan-facade-impl";
import { MealplanServiceImpl } from "../application/services/mealplan-service-impl";
import { CreateMealPlanFromSuggestionUseCase } from "../application/use-cases/mealplan/create-meal-plan-from-suggestion.use-case";
import { GetSuggestedMealplansByUserMetricsUseCase } from "../application/use-cases/mealplan/get-suggested-mealplans-by-user-metrics.use-case";
import { RegisterMealPlanAsCookedUseCase } from "../application/use-cases/mealplan/register-mealplan-as-cooked.use-case";
import { CancelActiveUserPlanUseCase } from "../application/use-cases/mealplan/cancel-active-user-plan.use-case";
import { MarkUserPlanAsCompletedUseCase } from "../application/use-cases/mealplan/mark-user-plan-as-completed.use-case";
import { MealplanController } from "../insfrastructure/controller/mealplan-controller";
import { MealplanRepositoryImpl } from "../insfrastructure/repositories/mealplan-repository-impl";
import { UploadModule } from "./upload.module";
import { UserModule } from "./user.module";
import { GamificationModule } from "./gamification.module";

@Module({
  imports: [UploadModule, UserModule, GamificationModule],
  controllers: [MealplanController],
  providers: [
    {
      provide: "MealplanFacade",
      useClass: MealplanFacadeImpl,
    },
    {
      provide: "MealplanService",
      useClass: MealplanServiceImpl,
    },
    {
      provide: "MealplanRepository",
      useClass: MealplanRepositoryImpl,
    },
    CreateMealPlanFromSuggestionUseCase,
    GetSuggestedMealplansByUserMetricsUseCase,
    RegisterMealPlanAsCookedUseCase,
    CancelActiveUserPlanUseCase,
    MarkUserPlanAsCompletedUseCase,
  ],
  exports: ["MealplanFacade", "MealplanService"],
})
export class MealplanModule {}
