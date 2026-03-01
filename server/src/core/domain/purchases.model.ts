import { ValidationError } from "../../errors/customErrors";


export const PURCHASE_UNITS: string[] = [
  // Weight (las más comunes)
  'gram',
  'kilogram',
  'ounce',
  'pound',

  // Volume (líquidos)
  'milliliter',
  'liter',
  'fluid_ounce',

  // Count / package (muy común en supermercados)
  'unit',
  'piece',
  'pack',
  'package',
  'bottle',
  'can',
  'box',
  'bag'
] as const


export const ALLOW_PURCHASE_UNITS: string[] = [
  "gram",
  "kilogram",
  "milligram",
  "ounce",
  "pound",

  "milliliter",
  "liter",
  "fluid_ounce",
  "pint",
  "quart",
  "gallon",

  "unit",
] as const
export type PurchaseStatus = "pending" | "confirmed";

export interface PurchaseData {
  id: string;
  userId: string;
  purchaseDate: string;
  status: PurchaseStatus;
  totalItems: number | null;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  ingredientId: string;
  // expirationDate?: string;
  // recommendedAmountToBuy?: number;
  // pendingPurchaseQuantity?: number;
  measurementType: string;
  amountToBuy: number;
}



export class Purchase {
  private data: PurchaseData;
  private readonly items: PurchaseItem[];

  constructor(purchase: PurchaseData, purchaseItems: PurchaseItem[]) {
    if (!purchaseItems || purchaseItems.length === 0) {
      throw new Error("A purchase must contain at least one item.");
    }

    this.data = purchase;
    this.items = purchaseItems;

  }


  get purchaseData(): PurchaseData {
    return this.data;
  }

  get purchaseItems(): PurchaseItem[] {
    return [...this.items];
  }

  public confirmPurchase(): void {
    if (this.data.status === "confirmed") {
      throw new ValidationError("This purchase is already confirmed.",'FIELD_INVALID',);
    }

    this.data = {
      ...this.data,
      status: "confirmed",
    };
  }
}

export interface PurchaseFilters {
  userId?: string;
}
