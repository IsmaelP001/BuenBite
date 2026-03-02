import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
  Purchase,
  PurchaseData,
  PurchaseItem,
} from "../../domain/purchases.model";
import { PurchaseRepository } from "../../domain/repositories";
import { AddItemsToPurchase } from "../dto";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { RedisCacheService } from "./redis-cache.service";
import { PurchaseService } from "./interfaces/purchase";

@Injectable()
export class PurchaseServiceImpl implements PurchaseService {
  constructor(
    @Inject("PurchaseRepository")
    private purchaseRepository: PurchaseRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  getPurchaseOrderById(purchaseOrderId: string): Promise<PurchaseData> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PURCHASE.BY_ID(purchaseOrderId),
      CacheKeys.PURCHASE.PREFIX,
      () => this.purchaseRepository.getById(purchaseOrderId),
      CacheTTL.MEDIUM,
    );
  }

  async removePurchaseItem(purchaseItemId: string): Promise<PurchaseItem> {
    const result = await this.purchaseRepository.removePurchaseItem(purchaseItemId);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.ITEMS_PREFIX);
    return result;
  }

  async addItemsToPurchase(data: AddItemsToPurchase): Promise<PurchaseItem[]> {
    const purchaseItems: PurchaseItem[] = data.items.map((item) => ({
      ...item,
      purchaseId: data.purchaseId,
      id: uuidv4(),
    }));
    const result = await this.purchaseRepository.addItemsToPurchase(purchaseItems);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.ITEMS_PREFIX);
    return result;
  }

  async savePurchase(purchase: Purchase): Promise<Purchase> {
    const result = await this.purchaseRepository.save(purchase);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.PREFIX);
    return result;
  }

  canCreatePurchaseOrder(
    userId: string
  ): Promise<{ canCreate: boolean }> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PURCHASE.CAN_CREATE(userId),
      CacheKeys.PURCHASE.PREFIX,
      async () => {
        const currentPending = await this.purchaseRepository.getBy({
          status: "pending",
          userId,
        });
        return { canCreate: !currentPending };
      },
      CacheTTL.SHORT,
    );
  }

  getPurchaseById(purchaseId: string): Promise<PurchaseData> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PURCHASE.BY_ID(purchaseId),
      CacheKeys.PURCHASE.PREFIX,
      () => this.purchaseRepository.getBy({ id: purchaseId }),
      CacheTTL.MEDIUM,
    );
  }

  getAllUserPurchases(userId: string): Promise<PurchaseData[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PURCHASE.BY_USER(userId),
      CacheKeys.PURCHASE.PREFIX,
      () => this.purchaseRepository.getAll({ userId }),
      CacheTTL.MEDIUM,
    );
  }

  getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseItem[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PURCHASE.ORDER_ITEMS(purchaseOrderId),
      CacheKeys.PURCHASE.ITEMS_PREFIX,
      () => this.purchaseRepository.getPurchaseOrderItems(purchaseOrderId),
      CacheTTL.MEDIUM,
    );
  }

  async confirmPurchase(purchase: Purchase): Promise<Purchase> {
    const result = await this.purchaseRepository.confirmPurchase(purchase);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PURCHASE.ITEMS_PREFIX);
    return result;
  }
}
