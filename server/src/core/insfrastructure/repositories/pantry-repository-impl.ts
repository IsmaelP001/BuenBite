import { Injectable } from "@nestjs/common";
import { and, desc, eq, getTableColumns, inArray, or, sql } from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  ingredientsSchema,
  pantryIngredientMeasurementsEventsSchema,
  pantrySchema,
} from "../../../config/drizzle/schemas";
import {
  PantryFilter,
  PantryIngredientMeasurement,
  Pantry,
  PantryItemWithIngredient,
  PantryTransactionsFilter,
} from "../../domain/pantry.model";
import { PantryRepository } from "../../domain/repositories";

@Injectable()
export class PantryRepositoryImpl implements PantryRepository {
  private tx?: any;

  withTransaction(tx: any): PantryRepository {
    const instance = new PantryRepositoryImpl();
    instance.tx = tx;
    return instance;
  }

  private getDbInstance() {
    return this.tx || db;
  }

  async getAll(filter?: PantryFilter): Promise<Pantry[]> {
    let qb = this.getDbInstance()
      .select({
        ...getTableColumns(pantrySchema),
        measurementType: pantrySchema.measurementType,
        measurementValue: pantrySchema.measurementValue,
        name: {
          es: ingredientsSchema.name_es,
          en: ingredientsSchema.name_en,
          fr: ingredientsSchema.name_fr,
        },
        conversions: ingredientsSchema.conversions,
        image: ingredientsSchema.image,
        category: ingredientsSchema.category,
        ...(filter?.includeNutricionalValues
          ? {
              nutricionalValues: {
                calories: ingredientsSchema.calories_100g,
                protein: ingredientsSchema.protein_100g,
                fat: ingredientsSchema.fat_100g,
                carbohydrates: ingredientsSchema.carbohydrates_100g,
              },
            }
          : {}),
      })
      .from(pantrySchema);

    qb = qb.leftJoin(
      ingredientsSchema,
      eq(pantrySchema.ingredientId, ingredientsSchema.id),
    );

    qb = qb.where(
      and(
        eq(pantrySchema.isDeleted, false),
        filter?.userId ? eq(pantrySchema.userId, filter.userId) : undefined,
        filter?.ids ? inArray(pantrySchema.id, filter.ids) : undefined,
        filter?.ingredientIds
          ? inArray(pantrySchema.ingredientId, filter.ingredientIds)
          : undefined,
      ),
    );

    const rows = (await qb.$dynamic()) as PantryItemWithIngredient[];
    return Pantry.fromResponseMany(rows);
  }

  async getPantryTransactions(
    filter?: PantryTransactionsFilter,
  ): Promise<PantryIngredientMeasurement[]> {
    const daysStr = filter?.lastNDays ? `-${filter.lastNDays} days` : null;
    const limit = filter?.limit ?? 50;
    const page = Math.max(filter?.page ?? 1, 1);
    const offset = (page - 1) * limit;

    const res = await this.getDbInstance()
      .select({
        ...getTableColumns(pantryIngredientMeasurementsEventsSchema),
      })
      .from(pantryIngredientMeasurementsEventsSchema)
      .limit(limit)
      .offset(offset)
      .where(
        and(
          filter?.ingredientId
            ? eq(
                pantryIngredientMeasurementsEventsSchema.ingredientId,
                filter.ingredientId,
              )
            : undefined,
          daysStr
            ? sql`${
                pantryIngredientMeasurementsEventsSchema.createdAt
              } >= datetime('now', ${sql.raw(`'${daysStr}'`)})`
            : undefined,
        ),
      )
      .orderBy(desc(pantryIngredientMeasurementsEventsSchema.createdAt));

    return res as PantryIngredientMeasurement[];
  }

  async getById(ingredientId: string): Promise<Pantry> {
    let [result] = await db
      .select({
        ...getTableColumns(pantrySchema),
        measurementType: pantrySchema.measurementType,
        measurementValue: pantrySchema.measurementValue,
        name: {
          es: ingredientsSchema.name_es,
          en: ingredientsSchema.name_en,
          fr: ingredientsSchema.name_fr,
        },
        conversions: ingredientsSchema.conversions,
        image: ingredientsSchema.image,
        category: ingredientsSchema.category,
        nutricionalValues: {
          calories: ingredientsSchema.calories_100g,
          protein: ingredientsSchema.protein_100g,
          fat: ingredientsSchema.fat_100g,
          carbohydrates: ingredientsSchema.carbohydrates_100g,
        },
      })
      .from(pantrySchema)
      .leftJoin(
        ingredientsSchema,
        eq(ingredientsSchema.id, pantrySchema.ingredientId),
      )
      .where(
        and(
          eq(pantrySchema.isDeleted, false),
          or(
            eq(pantrySchema.id, ingredientId),
            eq(pantrySchema.ingredientId, ingredientId),
          ),
        ),
      );
    return Pantry.fromResponse(result as PantryItemWithIngredient);
  }

  async create(entities: Pantry[]): Promise<Pantry[]> {
    const items = entities.map((e) => e.toPlain());
    const events = entities
      .filter((e) => e.measurementType && e.measurementValue)
      .map((e) => e.generateEvent("created"));

    return await db.transaction(async (tx: any) => {
      const rows = await tx
        .insert(pantrySchema)
        .values(items)
        .onConflictDoUpdate({
          target: [pantrySchema.ingredientId, pantrySchema.userId],
          set: {
            expirationDate: sql`excluded.expiration_date`,
            isRecurrent: sql`excluded.is_recurrent`,
            recurrentAmount: sql`excluded.recurrent_amount`,
            brand: sql`excluded.brand`,
            measurementType: sql`excluded.measurement_type`,
            pendingPurchaseQuantity: sql`excluded.pending_purchase_quantity`,
            measurementValue: sql`excluded.measurement_value`,
            lowValueAlert: sql`excluded.low_value_alert`,
            isDeleted: false,
            updatedAt: new Date(),
          },
        })
        .returning();
      if (events.length > 0) {
        await tx
          .insert(pantryIngredientMeasurementsEventsSchema)
          .values(events);
      }
      return Pantry.fromMany(rows);
    });
  }

  // async registerPendingPurchase(
  //   data: RegisterPendingPurchase
  // ): Promise<PantryItem> {
  //   return await this.getDbInstance().transaction(async (tx: any) => {
  //     const repo = this.withTransaction(tx);

  //     const [updatedItems] = await Promise.all([
  //       repo.update(pendingPurchaseUpdate),
  //       repo.createPantryEvent(event as any),
  //     ]);

  //     return updatedItems[0];
  //   });
  // }

  async update(items: Pantry | Pantry[]): Promise<Pantry[]> {
     await this.getDbInstance().transaction(async (tx: any) => {
      const entities = Array.isArray(items) ? items : [items];
      const events: PantryIngredientMeasurement[] = [];
      const updatePromises = entities.map((entity) => {
        const { ingredientId, ...rest } = entity.toPlain();
        if (entity.getEvent()) {
          events.push(entity.getEvent() as any);
        }
        return tx
          .update(pantrySchema)
          .set(rest as any)
          .where(
            and(
              eq(pantrySchema.ingredientId, ingredientId),
              eq(pantrySchema.userId, entity.userId),
              eq(pantrySchema.isDeleted, false),
            ),
          )
          .returning();
      });

      const [updatedItems] = await Promise.all([
        Promise.all(updatePromises),
        events.length > 0 ? this.createPantryEvent(events) : Promise.resolve([]),
      ]);
      return updatedItems;
    });
    return Array.isArray(items) ? items : [items];
  }

  async delete(itemId: string, userId: string): Promise<Pantry> {
    const [result] = await db
      .delete(pantrySchema)
      .where(
        and(
          eq(pantrySchema.userId, userId),
          or(
            eq(pantrySchema.id, itemId),
            eq(pantrySchema.ingredientId, itemId),
          ),
        ),
      )
      .returning();

    if (!result) {
      throw new Error("Pantry item not found");
    }

    return Pantry.from(result as PantryItemWithIngredient);
  }

  async createPantryEvent(
    data: PantryIngredientMeasurement | PantryIngredientMeasurement[],
  ): Promise<PantryIngredientMeasurement[]> {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return [];

    return (await this.getDbInstance()
      .insert(pantryIngredientMeasurementsEventsSchema)
      .values(items as any)
      .returning()) as any;
  }

  // async getPurchaceOrderItems(userId: string): Promise<any[]> {
  //   // const pantryTotalsCTE = db.$with("pantry_totals").as(
  //   //   db
  //   //     .select({
  //   //       pantryId: pantryIngredientMeasurementsSchema.pantryId,
  //   //       measurementType: pantryIngredientMeasurementsSchema.measurementType,
  //   //       totalQuantity:
  //   //         sql<number>`SUM(CASE WHEN ${pantryIngredientMeasurementsSchema.transactionType} NOT IN ('pendingForPurchase') THEN ${pantryIngredientMeasurementsSchema.measurementValue} ELSE 0 END)`
  //   //           .mapWith(Number)
  //   //           .as("totalQuantity"),

  //   //       purchaseQuantity: sql<number>`
  //   //     SUM(
  //   //       CASE
  //   //         WHEN ${pantryIngredientMeasurementsSchema.transactionType} = 'pendingForPurchase'
  //   //           THEN ${pantryIngredientMeasurementsSchema.measurementValue}
  //   //         WHEN ${pantryIngredientMeasurementsSchema.transactionType} = 'pendingPurchaseCompleted'
  //   //           THEN -${pantryIngredientMeasurementsSchema.measurementValue}
  //   //         ELSE 0
  //   //       END
  //   //     )
  //   //   `
  //   //         .mapWith(Number)
  //   //         .as("pendingQuantity"),
  //   //     })

  //   //     .from(pantryIngredientMeasurementsSchema)
  //   //     .groupBy(
  //   //       pantryIngredientMeasurementsSchema.pantryId,
  //   //       pantryIngredientMeasurementsSchema.measurementType
  //   //     )
  //   // );

  //   const results: any[] = await this.getDbInstance()
  //     .select({
  //       id: pantrySchema.id,
  //       ingredientName: pantrySchema.ingredientName,
  //       category: pantrySchema.category,
  //       measurementValue: pantrySchema.measurementValue,
  //       measurementType: pantrySchema.measurementType,
  //       purchaseQuantity: pantrySchema.pendingPurchaseQuantity,
  //       isRecurrent: pantrySchema.isRecurrent,
  //       recurrentAmount: pantrySchema.recurrentAmount,
  //       lowValueAlert: pantrySchema.lowValueAlert,
  //       expirationDate: pantrySchema.expirationDate,
  //       recipeIngredients: jsonAgg({
  //         id: recipeIngredientsSchema.id,
  //         recipeId: recipeIngredientsSchema.recipeId,
  //         pantryId: recipeIngredientsSchema.pantryId,
  //         recipeName: recipesSchema.name,
  //         requiredValue: recipeIngredientsSchema.measurementValue,
  //         measurementType: recipeIngredientsSchema.measurementType,
  //       }),
  //     })
  //     .from(pantrySchema)
  //     .leftJoin(
  //       recipeIngredientsSchema,
  //       eq(pantrySchema.id, recipeIngredientsSchema.pantryId)
  //     )
  //     .leftJoin(
  //       recipesSchema,
  //       eq(recipeIngredientsSchema.recipeId, recipesSchema.id)
  //     )
  //     .where(eq(pantrySchema.userId, userId))
  //     .groupBy(pantrySchema.id)
  //     .orderBy(pantrySchema.ingredientName);

  //   return results;
  // }
}
