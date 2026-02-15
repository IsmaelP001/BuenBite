import { HttpClient } from "@/lib/http/httpClient";
import { ApiResponse } from "@/types";
import {
  CreatePantryDto,
  IaScanPantryItems,
  PantryItem,
  PantryTransaction,
  PendingPurchase,
} from "@/types/models/pantry";
import { PurchaseItem } from "@/types/models/purchase";

export class PantryService {
  constructor(private httpClient: HttpClient) {}

  async getUserPantryItems(): Promise<ApiResponse<PantryItem[]>> {
    const userId = await HttpClient.getUserId();
    return this.httpClient.get<PantryItem[]>(`pantry/user/${userId}`);
  }

  async getPantryById(pantryId: string): Promise<ApiResponse<PantryItem>> {
    return this.httpClient.get<PantryItem>(`pantry/${pantryId}`);
  }

  async createPantryItem(data: CreatePantryDto[]): Promise<ApiResponse<PantryItem>> {
    return await this.httpClient.post<PantryItem>("pantry", data);
  }

  async saveIaScanPantryItems(
    data: IaScanPantryItems[]
  ): Promise<ApiResponse<PantryItem[]>> {
    return await this.httpClient.post<PantryItem[]>(
      "pantry/scan-ia-pantry",
      data
    );
  }

  async saveIaScanPantryItemsUsage(
    data: IaScanPantryItems[]
  ): Promise<ApiResponse<PantryItem[]>> {
    return await this.httpClient.put<PantryItem[]>(
      "pantry/update-ia-scan",
      data
    );
  }

  async uploadPantryImage(data: FormData): Promise<ApiResponse<PantryItem>> {
    return await this.httpClient.post<PantryItem>("pantry/upload-image", data, {
      isFormDataType: true,
    });
  }

  async updatePantryItem(
    data: Partial<PantryItem>
  ): Promise<ApiResponse<PantryItem>> {
    const userId = await HttpClient.getUserId();
    return this.httpClient.put<PantryItem>("pantry", {
      ...data,
      userId,
    });
  }

  async registerPendingPurchase(
    data: PendingPurchase
  ): Promise<ApiResponse<PantryItem>> {
    const userId = await HttpClient.getUserId();

    return this.httpClient.put<PantryItem>("pantry/register-pending-purchase", {
      ...data,
      userId,
    });
  }

  async getPantryPurchaseItems(): Promise<ApiResponse<PurchaseItem[]>> {
    const userId = await HttpClient.getUserId();

    return this.httpClient.get<PurchaseItem[]>(
      `pantry/user/${userId}/purchase-items`
    );
  }

  async scanReceiptImage(data: FormData): Promise<ApiResponse<any>> {
    return this.httpClient.post("ia/scan-receipt", data, {
      isFormDataType: true,
    });
  }

  async getPantryTransactions(
    pantryId: string
  ): Promise<ApiResponse<PantryTransaction[]>> {
    return this.httpClient.get(`pantry/${pantryId}/transactions`);
  }
}
