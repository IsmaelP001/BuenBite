import {
  AddItemsToPurchase,
  ConfirmPurchaseItem,
  PurchaseData,
  PurchaseItem,
  PurchaseItemDto,
} from "@/types/models/purchase";

import { HttpClient } from "@/lib/http/httpClient";

export class PurchaseService {
  constructor(private httpClient: HttpClient) {}

  async createPurchase(data: PurchaseItemDto[]) {
    return this.httpClient.post("purchases", data);
  }

  async confirmPurchase(data: ConfirmPurchaseItem[]) {
    return this.httpClient.post("purchases/confirm", data);
  }

  async addItemsToPurchase(data: AddItemsToPurchase) {
    return this.httpClient.post(
      `purchases/${data.purchaseId}/add-items`,
      data.items
    );
  }

  async removePurchaseItem(purchaseItemId: string) {
    return this.httpClient.delete(`purchases/${purchaseItemId}/remove-item`);
  }

  async getUserPurchases() {
    const userId = await HttpClient.getUserId();
    return this.httpClient.get<PurchaseData[]>("purchases", {
      queryParams: { userId: userId ?? "" },
    });
  }

  async getPurchaseOrder(purchaseId: string) {
    return this.httpClient.get<PurchaseData>(`purchases/${purchaseId}`);
  }
  async getPurchaseItems(purchaseId: string) {
    return this.httpClient.get<PurchaseItem[]>(`purchases/${purchaseId}/items`);
  }
}
