import { Module } from "@nestjs/common";

import { IngredientFacadeImpl } from "../application/facades/ingredients-facade";
import { IngredientServiceImpl } from "../application/services/ingredient-service-impl";
import { IngredientsController } from "../insfrastructure/controller/ingredient-controller";
import { IngredientsRepositoryImpl } from "../insfrastructure/repositories/ingredients-repository-impl";

@Module({
  controllers: [IngredientsController],
  providers: [
    {
      provide: "IngredientFacade",
      useClass: IngredientFacadeImpl,
    },
    {
      provide: "IngredientService",
      useClass: IngredientServiceImpl,
    },
    {
      provide: "IngredientRepository",
      useClass: IngredientsRepositoryImpl,
    },
  ],
  exports:['IngredientFacade','IngredientService']
})
export class IngredientsModule {}
