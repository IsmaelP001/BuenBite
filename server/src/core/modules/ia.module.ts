import { Module } from "@nestjs/common";
import { IAFacadeImpl } from "../application/facades/ia-facade";
import { RecipeAIServiceDeepseekImpl } from "../application/services/recipe-deepseek-service-impl";
import { ProcessScannedIngredientsUseCase } from "../application/use-cases/ingredient/scanned-ingredient-with-matches.use-case";
import { IaController } from "../insfrastructure/controller/ia-controller";
import { IaRepositoryImpl } from "../insfrastructure/repositories/ia-repository";
import { IngredientsModule } from "./ingredient.module";

@Module({
  controllers: [IaController],
  imports: [IngredientsModule],
  providers: [
    {
      provide: "IaFacade",
      useClass: IAFacadeImpl,
    },
    {
      provide: "RecipeAIService",
      useClass: RecipeAIServiceDeepseekImpl,
    },
    {
      provide: "IaRepository",
      useClass: IaRepositoryImpl,
    },
    ProcessScannedIngredientsUseCase,
  ],
})
export class IaModule {}
