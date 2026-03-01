import { Injectable } from "@nestjs/common";
import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  ingredientsSchema,
  purchaseItemsSchema,
  purchasesSchema,
} from "../../../config/drizzle/schemas";
import { dbGetOne } from "../../../lib/db/drizzle-client";
import {
  Purchase,
  PurchaseData,
  PurchaseFilters,
  PurchaseItem,
} from "../../domain/purchases.model";
import { PurchaseRepository } from "../../domain/repositories";

@Injectable()
export class PurchasesRepositoryImpl implements PurchaseRepository {



async getAll(filter: PurchaseFilters): Promise<(PurchaseData)[]> {
  const result = await db
    .select({
      ...getTableColumns(purchasesSchema), 
      totalItems: count(purchaseItemsSchema.id), 
    })
    .from(purchasesSchema)
    .leftJoin(
      purchaseItemsSchema,
      eq(purchasesSchema.id, purchaseItemsSchema.purchaseId)
    )
    .where(
      filter.userId
        ? eq(purchasesSchema.userId, filter.userId)
        : undefined
    )
    .groupBy(purchasesSchema.id)
    .orderBy(
      desc(sql`(${purchasesSchema.status} = 'pending')`),
      desc(purchasesSchema.createdAt)
    );

  return result as PurchaseData[];
}

  async getBy(filters: Partial<PurchaseData>): Promise<PurchaseData> {
    const whereClauses = Object.entries(filters).map(([key, value]) =>
      eq(purchasesSchema[key as keyof PurchaseData], value as any)
    );

    return (await dbGetOne("purchasesSchema", {
      where: and(...whereClauses),
    })) as PurchaseData;
  }
  

  async getById(purchaseOrderId: string): Promise<PurchaseData> {
    return (await dbGetOne("purchasesSchema", {
      where: and(eq(purchasesSchema.id, purchaseOrderId)),
    })) as PurchaseData;
  }

  async addItemsToPurchase(data: PurchaseItem[]): Promise<PurchaseItem[]> {
    return (await db
      .insert(purchaseItemsSchema)
      .values(data)
      .returning()
      .onConflictDoNothing()) as PurchaseItem[];
  }

  async removePurchaseItem(purchaseItemId: string): Promise<PurchaseItem> {
    const [result] = await db
      .delete(purchaseItemsSchema)
      .where(eq(purchaseItemsSchema.id, purchaseItemId))
      .returning();
    return result as PurchaseItem;
  }

  async getPurchaseOrderItems(purchaseId: string): Promise<PurchaseItem[]> {
    return (await db
      .select({
        id: purchaseItemsSchema.id,
        purchaseId: purchaseItemsSchema.purchaseId,
        name: {
          en: ingredientsSchema.name_en,
          es: ingredientsSchema.name_es,
          fr: ingredientsSchema.name_fr,
        },
        category: ingredientsSchema.category,
        amountToBuy: purchaseItemsSchema.amountToBuy,
        measurementType: purchaseItemsSchema.measurementType,
        ingredientId: purchaseItemsSchema.ingredientId,
      })
      .from(purchaseItemsSchema)
      .leftJoin(
        ingredientsSchema,
        eq(ingredientsSchema.id, purchaseItemsSchema.ingredientId)
      )
      .where(eq(purchaseItemsSchema.purchaseId, purchaseId))) as any;
  }

  async save(purchase: Purchase): Promise<Purchase> {
    await db.transaction(async (tx) => {
      const purchasePromise = tx
        .insert(purchasesSchema)
        .values(purchase.purchaseData);
      const purchaseItemsPromises = tx
        .insert(purchaseItemsSchema)
        .values(purchase.purchaseItems as any);
      await Promise.all([purchasePromise, purchaseItemsPromises]);
    });

    return purchase;
  }

  async confirmPurchase(purchase: Purchase): Promise<Purchase> {
    await db.transaction(async (tx) => {
      const updatePromise = tx
        .update(purchasesSchema)
        .set({ status: "confirmed" })
        .where(eq(purchasesSchema.id, purchase.purchaseData.id));

      const updateItemsPromise = purchase.purchaseItems.map((item) =>
        tx
          .update(purchaseItemsSchema)
          .set({ amountToBuy: item.amountToBuy })
          .where(eq(purchaseItemsSchema.id, item.id))
      );
      await Promise.all([updatePromise, ...updateItemsPromise]);
    });
    return purchase;
  }
}
