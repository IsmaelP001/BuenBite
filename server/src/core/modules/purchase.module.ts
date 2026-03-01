import { Module } from "@nestjs/common";

import { PurchasesController } from "../insfrastructure/controller/purchases-controller";
import { PurchasesRepositoryImpl } from "../insfrastructure/repositories/purchases-repository-impl";
import { PurchaseFacadeImpl } from "../application/facades/purchase-facade";
import { PurchaseServiceImpl } from "../application/services/purchase-service-impl";
import { ConfirmPurchaseUseCase } from "../application/use-cases/purchase/confirm-purchase.use-case";
import { SavePurchaseUseCase } from "../application/use-cases/purchase/save-purchase.use-case";
import { PantryModule } from "./pantry.module";
import { GamificationModule } from "./gamification.module";

@Module({
  imports:[PantryModule, GamificationModule],
  controllers: [PurchasesController],
  providers: [
    {
      provide: "PurchaseFacade",
      useClass: PurchaseFacadeImpl,
    },
    {
      provide: "PurchaseService",
      useClass: PurchaseServiceImpl,
    },
    {
      provide: "PurchaseRepository",
      useClass: PurchasesRepositoryImpl,
    },
    ConfirmPurchaseUseCase,
    SavePurchaseUseCase,
  ],
})
export class PurchaseModule {}
