import { Module } from "@nestjs/common";
import { UserController } from "../insfrastructure/controller/user-controller";
import { UserFacadeImpl } from "../application/facades/user-facade-impl";
import { UserServiceImpl } from "../application/services/user-service-impl";
import { UserReposotoryImpl } from "../insfrastructure/repositories/user-repository-impl";
import { NutritionCalculatorService } from "../application/services/nutricional-calculator.service";
import { CreateUserNutritionMetricsUseCase } from "../application/use-cases/user/create-user-nutrition-metrics.use-case";
import { RecalculateUserNutritionalValuesUseCase } from "../application/use-cases/user/recalculate-user-nutritional-values.use-case";
import { GamificationModule } from "./gamification.module";

@Module({
  imports: [GamificationModule],
  controllers: [UserController],
  providers: [
    {
      provide: "UserFacade",
      useClass: UserFacadeImpl,
    },
    {
      provide: "UserService",
      useClass: UserServiceImpl,
    },
    {
      provide: "UserRepository",
      useClass: UserReposotoryImpl,
    },
    NutritionCalculatorService,
    CreateUserNutritionMetricsUseCase,
    RecalculateUserNutritionalValuesUseCase,
  ],
  exports: ["UserFacade", "UserService"],
})
export class UserModule {}
