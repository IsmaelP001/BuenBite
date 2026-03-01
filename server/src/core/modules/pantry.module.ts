import { Module } from "@nestjs/common";
import { PantryFacadeImpl } from "../application/facades/pantry-facade";
import { PantryServiceImpl } from "../application/services/pantry-service-impl";
import { AddUnregisteredIngredientUseCase } from "../application/use-cases/pantry/add-unregistered-ingredient.use-case";
import { GetMealPlanMissingPantryItemsUseCase } from "../application/use-cases/pantry/get-meal-plan-missing-pantry-items.use-case";
import { GetSuggestedMealPlanMissingPantryItemsUseCase } from "../application/use-cases/pantry/get-suggested-meal-plan-missing-pantry-items.use-case";
import { RegisterScannedPantryItemsUseCase } from "../application/use-cases/pantry/register-scanned-pantry-items.use-case";
import { UpdatePantryItemsScannedByIaUseCase } from "../application/use-cases/pantry/update-pantry-items-scanned-by-ia.use-case";
import { PantryController } from "../insfrastructure/controller/pantry-controller";
import { PantryRepositoryImpl } from "../insfrastructure/repositories/pantry-repository-impl";
import { IngredientsModule } from "./ingredient.module";
import { MealplanModule } from "./mealplan.module";
import { UserModule } from "./user.module";
import { GamificationModule } from "./gamification.module";

@Module({
  imports: [MealplanModule, IngredientsModule, UserModule, GamificationModule],
  controllers: [PantryController],
  providers: [
    {
      provide: "PantryFacade",
      useClass: PantryFacadeImpl,
    },
    {
      provide: "PantryService",
      useClass: PantryServiceImpl,
    },
    {
      provide: "PantryRepository",
      useClass: PantryRepositoryImpl,
    },
    AddUnregisteredIngredientUseCase,
    UpdatePantryItemsScannedByIaUseCase,
    RegisterScannedPantryItemsUseCase,
    GetMealPlanMissingPantryItemsUseCase,
    GetSuggestedMealPlanMissingPantryItemsUseCase,
  ],
  exports: ["PantryFacade", "PantryService"],
})
export class PantryModule {}
