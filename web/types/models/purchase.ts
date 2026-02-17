export type PurchaseStatus = "pending" | "confirmed" | "cancelled" ;

export interface Purchase {
  purchaseItems: PurchaseItemDto[];
}

export interface PurchaseData {
  id: string;
  userId: string;
  orderNumber:number;
  purchaseDate: string;
  status: PurchaseStatus;
  totalItems: number ;
  createdAt:string
}

export interface PurchaseItem {
  id:string;
  pantryId?: string;
  name:{
    en:string;
    es:string;
    fr:string;
  };
  category: string;
  expirationDate?: string;
  measurementType: string;
  amountToBuy: number;
}


export interface ConfirmPurchaseItem {
  orderId: string;
  ingredientId:string;
  purchaseItemId?: string;
  amountToBuy: number;
}

export interface RecommendedPurchaseItem {
  id: string;
  ingredientName: string;
  isRecurrent: boolean;
  category: string;
  isLowStock:boolean;
  isOutStock:boolean;
  remainingDaysExpire:number;
  isExpiring:boolean;
  recurrentAmount: number;
  measurementValue: number;
  measurementType: string;
  pendingPurchaseQuantity: number;
  lowValueAlert: number;
  recommendedAmountToBuy: number;
  amountToBuyMeasurementType: string;
  recipeDetails: any[];
  amountToBuy: number;
}


export interface PurchaseItemDto {
  ingredientId: string;
  measurementType: string;
  amountToBuy: number;
}


export interface AddItemsToPurchase{
    purchaseId:string;
    items:PurchaseItemDto[]
  }