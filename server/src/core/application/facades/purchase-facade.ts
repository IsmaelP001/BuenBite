import { Inject, Injectable } from "@nestjs/common";
import {
  Purchase,
  PurchaseData,
  PurchaseItem,
} from "../../domain/purchases.model";
import {
  AddItemsToPurchase,
  ConfirmPurchaseDto,
  PurchaseDto
} from "../dto";
import {
  PurchaseFacade,
  PurchaseService,
} from "../services/interfaces/purchase";
import { ConfirmPurchaseUseCase } from "../use-cases/purchase/confirm-purchase.use-case";
import { SavePurchaseUseCase } from "../use-cases/purchase/save-purchase.use-case";

@Injectable()
export class PurchaseFacadeImpl implements PurchaseFacade {
  constructor(
    @Inject("PurchaseService")
    private readonly purchaseService: PurchaseService,
    private readonly confirmPurchaseUseCase: ConfirmPurchaseUseCase,
    private readonly savePurchaseUseCase: SavePurchaseUseCase,
  ) {}
  getPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseData> {
    return this.purchaseService.getPurchaseOrderById(purchaseOrderId);
  }
  removePurchaseItem(purchaseItemId: string): Promise<PurchaseItem> {
    return this.purchaseService.removePurchaseItem(purchaseItemId);
  }
  addItemsToPurchase(data: AddItemsToPurchase): Promise<PurchaseItem[]> {
    return this.purchaseService.addItemsToPurchase(data);
  }

  async savePurchase(purchaseDto: PurchaseDto): Promise<Purchase> {
    return this.savePurchaseUseCase.execute(purchaseDto);
  }

  getAllUserPurchases(userId: string): Promise<PurchaseData[]> {
    return this.purchaseService.getAllUserPurchases(userId);
  }

  async getPurchaseOrderItems(
    purchaseOrderId: string
  ): Promise<PurchaseItem[]> {
    return await this.purchaseService.getPurchaseOrderItems(purchaseOrderId);
  }

  async confirmPurchase(dto: ConfirmPurchaseDto): Promise<Purchase> {
    return this.confirmPurchaseUseCase.execute(dto);
  }
}
