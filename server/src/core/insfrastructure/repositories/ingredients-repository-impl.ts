import { Injectable } from "@nestjs/common";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import { ingredientsSchema } from "../../../config/drizzle/schemas";
import { dbGetAll } from "../../../lib/db/drizzle-client";
import { Ingredient, IngredientsFilter } from "../../domain/ingredients.model";
import { IngredientRepository } from "../../domain/repositories";

@Injectable()
export class IngredientsRepositoryImpl implements IngredientRepository {
  async getAll(filter: IngredientsFilter): Promise<Ingredient[]> {
    const conditions = [];

    if (filter?.ingredientName) {
      conditions.push(
        or(
          ilike(ingredientsSchema.name_en, `%${filter.ingredientName}%`),
          ilike(ingredientsSchema.name_es, `%${filter.ingredientName}%`),
          ilike(ingredientsSchema.name_fr, `%${filter.ingredientName}%`)
        )
      );
    }

    if (filter?.ingredientNames && filter.ingredientNames.length > 0) {
      const nameConditions = filter.ingredientNames.map((name) =>
        or(
          ilike(ingredientsSchema.name_en, `%${name}%`),
          ilike(ingredientsSchema.name_es, `%${name}%`),
          ilike(ingredientsSchema.name_fr, `%${name}%`)
        )
      );

      conditions.push(or(...nameConditions));
    }

    if (filter?.isFilterActive !== undefined) {
      conditions.push(
        eq(ingredientsSchema.isFilterActive, filter?.isFilterActive)
      );
    }
    // conditions.push(
    //   eq(ingredientsSchema.isApproved, true)
    // );
    return (await dbGetAll("ingredientsSchema", {
      orderBy: [desc(ingredientsSchema.id)],
      where: and(...conditions),
      limit: filter?.limit ?? undefined,
    })) as Ingredient[];
  }

  async create(data: Ingredient[]): Promise<Ingredient[]> {
    return (await db
      .insert(ingredientsSchema)
      .values(data)
      .onConflictDoUpdate({
        target: [
          ingredientsSchema.name_en,
          ingredientsSchema.name_es,
          ingredientsSchema.name_fr,
        ],
        set: { updatedAt: new Date() },
      })
      .returning()) as any[];
  }
}
