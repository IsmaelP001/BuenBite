import {
  Purchase,
  PurchaseData,
  PurchaseItem,
} from "../../../domain/purchases.model";
import {
  AddItemsToPurchase,
  ConfirmPurchaseDto,
  PurchaseDto
} from "../../dto";

export interface PurchaseService {
  savePurchase(purchaseDto: Purchase): Promise<Purchase>;
  getAllUserPurchases(userId: string): Promise<PurchaseData[]>;
  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseItem[]>;
  confirmPurchase(purchase: Purchase): Promise<Purchase>;
  canCreatePurchaseOrder(userId: string): Promise<{ canCreate: boolean }>;
  getPurchaseById(purchaseId: string): Promise<PurchaseData>;
  addItemsToPurchase(data: AddItemsToPurchase): Promise<PurchaseItem[]>;
  removePurchaseItem(purchaseItemId: string): Promise<PurchaseItem>;
  getPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseData>;
}

export interface PurchaseFacade {
  savePurchase(purchaseDto: PurchaseDto): Promise<Purchase>;
  getAllUserPurchases(userId: string): Promise<PurchaseData[]>;
  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseItem[]>;
confirmPurchase(dto: ConfirmPurchaseDto): Promise<Purchase>
  addItemsToPurchase(data: AddItemsToPurchase): Promise<PurchaseItem[]>;
  removePurchaseItem(purchaseItemId: string): Promise<PurchaseItem>;
  getPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseData>;
}
