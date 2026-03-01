import { Injectable } from "@nestjs/common";
import { and, desc, eq, getTableColumns, gte, lte, sql } from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  recipesSchema,
  userNutritionalHistorySchema,
  userNutritionMetrics,
  userNutritionMetricsHistorySchema,
  userPreferencesSchema,
  userSavedRecipesSchema,
  usersSchema,
} from "../../../config/drizzle/schemas";
import { dbGetAll, dbGetOne } from "../../../lib/db/drizzle-client";
import { Recipe } from "../../domain/recipe.model";
import { UserRepository } from "../../domain/repositories";
import {
  getUserNutricionalData,
  RemoveFavorite,
  User,
  UserCookedRecipes,
  UserFilters,
  UserNutritionalHistory,
  UserNutritionMetrics,
  UserPreferences,
  UserSavedRecipeEntry,
} from "../../domain/user.model";
@Injectable()
export class UserReposotoryImpl implements UserRepository {
  async getUserNutritionalMetricsById(
    id: string
  ): Promise<UserNutritionMetrics> {
    const [result] = await db
      .select({ ...getTableColumns(userNutritionMetrics) })
      .from(userNutritionMetrics)
      .where(eq(userNutritionMetrics.id, id));
    return result as UserNutritionMetrics;
  }
  async getAll(filter: UserFilters): Promise<User[]> {
    return (await dbGetAll("usersSchema")) as User[];
  }

  async getBy(filters: Partial<User>): Promise<User> {
    const whereClauses = Object.entries(filters).map(([key, value]) =>
      eq(usersSchema[key as keyof User], value)
    );

    return (await dbGetOne("usersSchema", {
      where: and(...whereClauses),
    })) as User;
  }

  async createUserNutritionMetrics(
    data: UserNutritionMetrics
  ): Promise<UserNutritionMetrics> {
    const [result] = await db
      .insert(userNutritionMetrics)
      .values(data)
      .returning();
    return result as UserNutritionMetrics;
  }

  async getUserActiveNutritionalMetrics(
    userId: string
  ): Promise<UserNutritionMetrics> {
    const [result] = await db
      .select({ ...getTableColumns(userNutritionMetrics) })
      .from(userNutritionMetrics)
      .where(eq(userNutritionMetrics.userId, userId));
    return result as UserNutritionMetrics;
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    return (await dbGetOne("userPreferencesSchema", {
      where: eq(userPreferencesSchema.userId, userId),
    })) as UserPreferences;
  }

  async createUserPreferences(data: UserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(userPreferencesSchema)
      .values(data)
      .returning();
    return result as UserPreferences;
  }

  async updateUserPreference(
    data: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const [result] = await db
      .update(userPreferencesSchema)
      .set(data)
      .where(eq(userPreferencesSchema.userId, data.userId!));
    return result;
  }

  async updateUserNutritionalMetrics(
    data: Partial<UserNutritionMetrics>
  ): Promise<UserNutritionMetrics> {
    return await db.transaction(async (tx) => {
      const [updatedMetrics] = await tx
        .update(userNutritionMetrics)
        .set(data)
        .where(eq(userNutritionMetrics.userId, data.userId!))
        .returning();

      if (updatedMetrics) {
        const { id, calculatedAt, ...rest } = updatedMetrics;
        await tx.insert(userNutritionMetricsHistorySchema).values({
          ...rest,
          calculatedAt: new Date(),
        });
      }

      return updatedMetrics as UserNutritionMetrics;
    });
  }

  async updateUserPreferences(
    data: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const [result] = await db
      .update(userPreferencesSchema)
      .set(data)
      .where(eq(userPreferencesSchema.userId, data.userId!));
    return result;
  }

  async getUserSavedRecipes(userId: string): Promise<Recipe[]> {
    const results = await db
      .select({ ...getTableColumns(recipesSchema) })
      .from(userSavedRecipesSchema)
      .innerJoin(
        recipesSchema,
        eq(userSavedRecipesSchema.recipeId, recipesSchema.id)
      )
      .where(eq(userSavedRecipesSchema.userId, userId));
    return results as Recipe[];
  }

  async getUserSavedRecipeEntries(
    userId: string
  ): Promise<UserSavedRecipeEntry[]> {
    const results = await db
      .select({ ...getTableColumns(userSavedRecipesSchema) })
      .from(userSavedRecipesSchema)
      .where(eq(userSavedRecipesSchema.userId, userId));
    return results;
  }

  async getUserCookedRecipes(
    filter: getUserNutricionalData
  ): Promise<UserCookedRecipes[]> {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 7);
    const results = await db
      .select({
        ...getTableColumns(recipesSchema),
        consumedCarbs: sql<number>`${userNutritionalHistorySchema.carbohydrates}`,
        consumedCalories: sql<number>`${userNutritionalHistorySchema.calories}`,
        consumedFats: sql<number>`${userNutritionalHistorySchema.fats}`,
        consumedProtein: sql<number>`${userNutritionalHistorySchema.proteins}`,
      })
      .from(userNutritionalHistorySchema)
      .innerJoin(
        recipesSchema,
        eq(recipesSchema.id, userNutritionalHistorySchema.recipeId)
      )
      .where(
        and(
          eq(userNutritionalHistorySchema.userId, filter.userId),
          gte(
            userNutritionalHistorySchema.createdAt,
            filter.startDate ?? startDate
          ),
          filter.endDate
            ? gte(userNutritionalHistorySchema.createdAt, filter.endDate)
            : undefined
        )
      )
      .orderBy(desc(userNutritionalHistorySchema.createdAt));
    return results as UserCookedRecipes[];
  }

  async getUserNutricionalHistory(
    filter: getUserNutricionalData
  ): Promise<UserNutritionalHistory[]> {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - 7);

    const results = await db
      .select({
        date: sql<string>`DATE(${userNutritionalHistorySchema.createdAt})`,
        protein: {
          consumed: sql<number>`CAST(SUM(${userNutritionalHistorySchema.proteins}) AS INTEGER)`,
          goal: sql<number>`MAX(${userNutritionalHistorySchema.dailyProteinTarget})`,
        },
        fats: {
          consumed: sql<number>`CAST(SUM(${userNutritionalHistorySchema.fats}) AS INTEGER)`,
          goal: sql<number>`MAX(${userNutritionalHistorySchema.dailyFatTarget})`,
        },
        carbs: {
          consumed: sql<number>`CAST(SUM(${userNutritionalHistorySchema.carbohydrates}) AS INTEGER)`,
          goal: sql<number>`MAX(${userNutritionalHistorySchema.dailyCarbsTarget})`,
        },
        calories: {
          consumed: sql<number>`CAST(SUM(${userNutritionalHistorySchema.calories}) AS INTEGER)`,
          goal: sql<number>`MAX(${userNutritionalHistorySchema.dailyCaloriesTarget})`,
        },
      })
      .from(userNutritionalHistorySchema)
      .groupBy(sql`DATE(${userNutritionalHistorySchema.createdAt})`)
      .where(
        and(
          eq(userNutritionalHistorySchema.userId, filter.userId),
          gte(
            userNutritionalHistorySchema.createdAt,
            filter?.startDate ?? startDate
          ),
          filter.endDate
            ? lte(userNutritionalHistorySchema.createdAt, filter.endDate)
            : undefined
        )
      )
      .orderBy(sql`DATE(${userNutritionalHistorySchema.createdAt}) ASC`);

    return results;
  }
  async saveRecipeFavorite(
    data: UserSavedRecipeEntry
  ): Promise<UserSavedRecipeEntry> {
    const [result] = await db
      .insert(userSavedRecipesSchema)
      .values(data)
      .returning();
    return result as UserSavedRecipeEntry;
  }

  async removeRecipeFavorite(
    data: RemoveFavorite
  ): Promise<UserSavedRecipeEntry> {
    const [result] = await db
      .delete(userSavedRecipesSchema)
      .where(
        and(
          eq(userSavedRecipesSchema.userId, data.userId),
          eq(userSavedRecipesSchema.recipeId, data.recipeId)
        )
      )
      .returning();
    return result as UserSavedRecipeEntry;
  }
}
