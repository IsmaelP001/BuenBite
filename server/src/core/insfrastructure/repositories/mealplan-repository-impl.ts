import { Injectable } from "@nestjs/common";
import {
  and,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  ingredientsSchema,
  mealEntriesSchema,
  recipeIngredientsSchema,
  recipesSchema,
  suggestedMealPlanCategoriesSchema,
  suggestedMealPlanRecipesSchema,
  suggestedMealPlansSchema,
  userActiveMealPlansSchema,
  userNutritionalHistorySchema,
} from "../../../config/drizzle/schemas";
import { jsonAgg } from "../../../helper/db";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import {
  GetMealplanRecipeItems,
  getSuggestedMealIngredients,
  GetUserActivePlanFilter,
  MealPlanEntry,
  MealPlanEntryFilters,
  RemoveMealPlanEntry,
  SuggestedMealPlan,
  SuggestedMealPlanCategoryWithPlans,
  SuggestedMealplanFilter,
  SuggestedMealPlanRecipeEntry,
  SuggestedMealplanRecipes,
  SuggestedMealplanRecipesFilter,
  UpdateUserActiveMealPlan,
  UserActiveMealPlan,
} from "../../domain/mealplan";
import { MealplanRepository } from "../../domain/repositories";
import {
  MealPlanEntryResponseDto,
  MealPlanNutritionSummary,
} from "../controller/dto/responseDto";

const recipeFields = {
  id: recipesSchema.id,
  name: recipesSchema.name,
  image: recipesSchema.image,
  description: recipesSchema.description,
  prepTime: recipesSchema.prepTime,
  cookTime: recipesSchema.cookTime,
  servings: recipesSchema.servings,
  dificulty: recipesSchema.dificulty,
  mealTypes: recipesSchema.mealTypes,
  calories: recipesSchema.calories,
  proteins: recipesSchema.proteins,
  fats: recipesSchema.fats,
  carbs: recipesSchema.carbs,
};

@Injectable()
export class MealplanRepositoryImpl implements MealplanRepository {
  getSuggestedMealIngredients(suggestedMealplanId: string): Promise<getSuggestedMealIngredients[]> {
    throw new Error("Method not implemented.");
  }
  getSuggestedMealPlanBy(
    filter: SuggestedMealplanRecipesFilter
  ): Promise<SuggestedMealplanRecipes[]> {
    throw new Error("Method not implemented.");
  }
  async getAllSuggestedMealplans(
    { limit = 10, page = 1 }: PaginationParams,
    filter?: SuggestedMealplanFilter
  ): Promise<PaginatedResponse<SuggestedMealPlan>> {
    const offset = Math.max((page - 1) * limit, 0);

    const query = db
      .select({
        ...getTableColumns(suggestedMealPlansSchema),
        ...(filter?.sort && {
          matchPercentage: this.buildMatchPercentageSQL(filter.sort),
        }),
      })
      .from(suggestedMealPlanCategoriesSchema)
      .$dynamic();

    query.leftJoin(
      suggestedMealPlansSchema,
      eq(
        suggestedMealPlanCategoriesSchema.id,
        suggestedMealPlansSchema.categoryId
      )
    );

    const conditions = [
      eq(suggestedMealPlansSchema.isActive, true),
      eq(suggestedMealPlanCategoriesSchema.isActive, true),
    ];

    if (filter?.sortOrderSkipAfter) {
      conditions.push(
        gt(
          suggestedMealPlanCategoriesSchema.sortOrder,
          filter.sortOrderSkipAfter
        )
      );
    }

    if (filter?.dietType) {
      conditions.push(eq(suggestedMealPlansSchema.dietType, filter.dietType));
    }

    if (filter?.query) {
      const searchPattern = `%${filter.query}%`;

      conditions.push(
        or(
          // Búsqueda en el nombre
          ilike(suggestedMealPlansSchema.name, searchPattern),
          // Búsqueda en cualquier elemento del array de tags
          sql`EXISTS (
        SELECT 1 FROM unnest(${suggestedMealPlansSchema.tags}) AS tag 
        WHERE tag ILIKE ${searchPattern}
      )`
        )
      );
    }

    if (filter?.difficulty) {
      conditions.push(
        eq(suggestedMealPlansSchema.difficulty, filter.difficulty)
      );
    }

    if (filter?.suitableForGoals) {
      conditions.push(
        sql`${suggestedMealPlansSchema.suitableForGoals} @> ARRAY[${filter.suitableForGoals}]::text[]`
      );
    }

    query.where(and(...conditions));

    if (filter?.sort) {
      query.orderBy(sql`match_percentage DESC`);
    } else if (filter?.isRandom) {
      query.orderBy(sql`RANDOM()`);
    } else {
      query.orderBy(
        suggestedMealPlanCategoriesSchema.sortOrder,
        suggestedMealPlansSchema.sortOrder
      );
    }

    query
      .limit(limit + 1)
      .offset(offset)
      .groupBy(
        suggestedMealPlanCategoriesSchema.id,
        suggestedMealPlansSchema.sortOrder,
        suggestedMealPlansSchema.id
      );

    const results = await query;
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    return {
      items,
      hasMore,
      page,
    };
  }

  private buildMatchPercentageSQL(
    sortCriteria: NonNullable<SuggestedMealplanFilter["sort"]>
  ) {
    // Definir pesos (suman 100)
    const weights = {
      calories: 30,
      proteins: 40, // Más importante para build_muscle
      fats: 15,
      carbs: 15,
    };

    const parts: any[] = [];
    let totalWeight = 0;

    if (sortCriteria.caloriesAvg) {
      parts.push(sql`
      (GREATEST(0, 100 - (ABS(${suggestedMealPlansSchema.dailyCaloriesAvg} - ${sortCriteria.caloriesAvg}) 
        / NULLIF(${sortCriteria.caloriesAvg}, 0) * 100)) * ${weights.calories})
    `);
      totalWeight += weights.calories;
    }

    if (sortCriteria.proteinsAvg) {
      parts.push(sql`
      (GREATEST(0, 100 - (ABS(${suggestedMealPlansSchema.dailyProteinsAvg} - ${sortCriteria.proteinsAvg}) 
        / NULLIF(${sortCriteria.proteinsAvg}, 0) * 100)) * ${weights.proteins})
    `);
      totalWeight += weights.proteins;
    }

    if (sortCriteria.fatsAvg) {
      parts.push(sql`
      (GREATEST(0, 100 - (ABS(${suggestedMealPlansSchema.dailyFatsAvg} - ${sortCriteria.fatsAvg}) 
        / NULLIF(${sortCriteria.fatsAvg}, 0) * 100)) * ${weights.fats})
    `);
      totalWeight += weights.fats;
    }

    if (sortCriteria.carbsAvg) {
      parts.push(sql`
      (GREATEST(0, 100 - (ABS(${suggestedMealPlansSchema.dailyCarbsAvg} - ${sortCriteria.carbsAvg}) 
        / NULLIF(${sortCriteria.carbsAvg}, 0) * 100)) * ${weights.carbs})
    `);
      totalWeight += weights.carbs;
    }

    if (parts.length === 0) {
      return sql<number>`100`.as("match_percentage");
    }

    return sql<number>`
    ROUND(
      CAST((${sql.join(parts, sql` + `)}) / ${totalWeight} AS NUMERIC),
      2
    )
  `.as("match_percentage");
  }

  async getSuggestedMealPlansByCategory(
    filter?: SuggestedMealplanFilter
  ): Promise<SuggestedMealPlanCategoryWithPlans[]> {
    const results = await db
      .select({
        id: suggestedMealPlanCategoriesSchema.id,
        name: suggestedMealPlanCategoriesSchema.name,
        description: suggestedMealPlanCategoriesSchema.description,
        imageUrl: suggestedMealPlanCategoriesSchema.imageUrl,
        mealplans: sql`
        (
          SELECT json_agg(
            json_build_object(
              'id', p.id,
              'name', p.name,
              'description', p.description,
              'sort_order', p.sort_order,
              'is_active', p.is_active,
              'imageUrl', p.image_url,
              'category_id', p.category_id
            )
            ORDER BY p.sort_order
          )
          FROM suggested_meal_plans AS p
          WHERE p.category_id = suggested_meal_plan_categories.id
          AND p.is_active = true
        )
      `.as("mealplans"),
      })
      .from(suggestedMealPlanCategoriesSchema)
      .where(eq(suggestedMealPlanCategoriesSchema.isActive, true))
      .orderBy(
        filter?.isRandom
          ? sql`RANDOM()`
          : suggestedMealPlanCategoriesSchema.sortOrder
      )
      .limit(filter?.limit ?? 1);

    return results as SuggestedMealPlanCategoryWithPlans[];
  }

  async getSuggestedMealPlansByCategoryId(
    categoryId: string
  ): Promise<SuggestedMealPlanCategoryWithPlans> {
    const [result] = await db
      .select({
        id: suggestedMealPlanCategoriesSchema.id,
        name: suggestedMealPlanCategoriesSchema.name,
        description: suggestedMealPlanCategoriesSchema.description,
        imageUrl: suggestedMealPlanCategoriesSchema.imageUrl,
        mealplans: jsonAgg({
          ...getTableColumns(suggestedMealPlansSchema),
        }),
      })
      .from(suggestedMealPlanCategoriesSchema)
      .leftJoin(
        suggestedMealPlansSchema,
        eq(
          suggestedMealPlanCategoriesSchema.id,
          suggestedMealPlansSchema.categoryId
        )
      )
      .where(eq(suggestedMealPlanCategoriesSchema.id, categoryId));

    return result;
  }

  async getSuggestedMealPlansById(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlan> {
    const [result] = await db
      .select({
        ...getTableColumns(suggestedMealPlansSchema),
      })
      .from(suggestedMealPlansSchema)
      .where(eq(suggestedMealPlansSchema.id, suggestedMealplanId));

    return result;
  }

  // async getSuggestedMealIngredients(
  //   suggestedMealplanId: string
  // ): Promise<getSuggestedMealIngredients[]> {
  //   const results = await db
  //     .select({
  //       ingredientId: recipeIngredientsSchema.ingredientId,
  //       name: {
  //         es: ingredientsSchema.name_es,
  //         fr: ingredientsSchema.name_fr,
  //         en: ingredientsSchema.name_en,
  //       },
  //       category: ingredientsSchema.category,
  //       measurementValue: sql<number>`SUM(${recipeIngredientsSchema.measurementValue})`,
  //       measurementType: recipeIngredientsSchema.measurementType,
  //       conversions: ingredientsSchema.conversions,
  //       image: ingredientsSchema.image,
  //     })
  //     .from(suggestedMealPlanRecipesSchema)
  //     .leftJoin(
  //       recipeIngredientsSchema,
  //       eq(
  //         recipeIngredientsSchema.recipeId,
  //         suggestedMealPlanRecipesSchema.recipeId
  //       )
  //     )
  //     .leftJoin(
  //       ingredientsSchema,
  //       eq(ingredientsSchema.id, recipeIngredientsSchema.ingredientId)
  //     )
  //     .where(
  //       eq(
  //         suggestedMealPlanRecipesSchema.suggestedMealPlanId,
  //         suggestedMealplanId
  //       )
  //     )
  //     .groupBy(
  //       recipeIngredientsSchema.ingredientId,
  //       recipeIngredientsSchema.measurementType,
  //       ingredientsSchema.name_es,
  //       ingredientsSchema.name_fr,
  //       ingredientsSchema.name_en,
  //       ingredientsSchema.category,
  //       ingredientsSchema.conversions,
  //       ingredientsSchema.image
  //     );

  //   return results as getSuggestedMealIngredients[];
  // }

  async getSuggestedMealPlanRecipeEntry(
    suggestedMealplanId: string
  ): Promise<SuggestedMealPlanRecipeEntry[]> {
    const results = await db
      .select({
        ...getTableColumns(suggestedMealPlanRecipesSchema),
      })
      .from(suggestedMealPlanRecipesSchema)
      .where(
        eq(
          suggestedMealPlanRecipesSchema.suggestedMealPlanId,
          suggestedMealplanId
        )
      )
     

    return results as SuggestedMealPlanRecipeEntry[];
  }

  async getSuggestedMealPlanRecipes(
    filter: SuggestedMealplanRecipesFilter
  ): Promise<SuggestedMealplanRecipes[]> {
    const query = db
      .select({
        id: suggestedMealPlanRecipesSchema.id,
        mealType: suggestedMealPlanRecipesSchema.mealType,
        recipeId: suggestedMealPlanRecipesSchema.recipeId,
        dayNumber: suggestedMealPlanRecipesSchema.dayNumber,
        ...(filter?.includeRecipe
          ? {
              recipe: recipeFields,
            }
          : null),
      })
      .from(suggestedMealPlanRecipesSchema)
      .$dynamic();

    if (filter?.includeRecipe) {
      query.leftJoin(
        recipesSchema,
        eq(recipesSchema.id, suggestedMealPlanRecipesSchema.recipeId)
      );
    }

    query.where(
      eq(
        suggestedMealPlanRecipesSchema.suggestedMealPlanId,
        filter.suggestedMealplanId
      )
    );
    return (await query) as SuggestedMealplanRecipes[];
  }
  async deleteMealPlanEntry(data: RemoveMealPlanEntry): Promise<void> {
    await db
      .delete(mealEntriesSchema)
      .where(
        and(
          eq(mealEntriesSchema.mealType, data.mealType),
          eq(mealEntriesSchema.plannedDate, data.selectedDate),
          eq(mealEntriesSchema.userId, data.userId),
          eq(mealEntriesSchema.recipeId, data.recipeId)
        )
      );
  }

  async createMealPlanEntry(data: MealPlanEntry[]): Promise<MealPlanEntry> {
    const [result] = await db
      .insert(mealEntriesSchema)
      .values(data)
      .returning();

    return result as MealPlanEntry;
  }

  async createUserActivePlan(
    data: UserActiveMealPlan
  ): Promise<UserActiveMealPlan> {
    const [result] = await db
      .insert(userActiveMealPlansSchema)
      .values(data)
      .returning();
    return result as UserActiveMealPlan;
  }

  async getUserActivePlan(
    filters: GetUserActivePlanFilter
  ): Promise<UserActiveMealPlan> {
    const query = db
      .select({
        ...getTableColumns(userActiveMealPlansSchema),
        ...(filters?.includeSuggestedMealPlan
          ? {
              suggestedMealPlan: {
                ...getTableColumns(suggestedMealPlansSchema),
              },
            }
          : null),
      })
      .from(userActiveMealPlansSchema)
      .where(
        and(
          eq(userActiveMealPlansSchema.status, "active"),
          filters?.userId
            ? eq(userActiveMealPlansSchema.userId, filters.userId)
            : undefined,
          filters?.id
            ? eq(userActiveMealPlansSchema.id, filters.id)
            : undefined,
          filters?.suggestedMealPlanId
            ? eq(
                userActiveMealPlansSchema.suggestedMealPlanId,
                filters.suggestedMealPlanId
              )
            : undefined
        )
      )
      .$dynamic();

    if (filters?.includeSuggestedMealPlan) {
      query.leftJoin(
        suggestedMealPlansSchema,
        eq(
          suggestedMealPlansSchema.id,
          userActiveMealPlansSchema.suggestedMealPlanId
        )
      );
    }
    query.orderBy(desc(userActiveMealPlansSchema.createdAt)).limit(1);
    const [result] = await query;
    return result as UserActiveMealPlan;
  }

  async updateUserActivePlan(
    data: UpdateUserActiveMealPlan
  ): Promise<UserActiveMealPlan> {
    const [result] = await db
      .update(userActiveMealPlansSchema)
      .set({
        ...data,
        ...(data?.addToCompleatedRecipes && {
          completedRecipes: sql<number>`${userActiveMealPlansSchema.completedRecipes} + ${data.addToCompleatedRecipes}`,
        }),
      })
      .where(eq(userActiveMealPlansSchema.id, data.id))
      .returning();
    return result as UserActiveMealPlan;
  }

  async getUserNutricionalPlanSummary(
    userId: string
  ): Promise<MealPlanNutritionSummary> {
    const [result] = await db
      .select({
        consumedProtein: sql<number>`SUM(${userNutritionalHistorySchema.proteins})`,
        consumedCarbs: sql<number>`SUM(${userNutritionalHistorySchema.carbohydrates})`,
        consumedCalories: sql<number>`SUM(${userNutritionalHistorySchema.calories})`,
        consumedFats: sql<number>`SUM(${userNutritionalHistorySchema.fats})`,
      })
      .from(userNutritionalHistorySchema)
      .where(eq(userNutritionalHistorySchema.userId, userId));
    return result as MealPlanNutritionSummary;
  }

  async getUserNutricionalData(
    userId: string
  ): Promise<MealPlanNutritionSummary> {
    const [result] = await db
      .select({
        consumedProtein: sql<number>`SUM(${userNutritionalHistorySchema.proteins})`,
        consumedCarbs: sql<number>`SUM(${userNutritionalHistorySchema.carbohydrates})`,
        consumedCalories: sql<number>`SUM(${userNutritionalHistorySchema.calories})`,
        consumedFats: sql<number>`SUM(${userNutritionalHistorySchema.fats})`,
      })
      .from(userNutritionalHistorySchema)
      .where(eq(userNutritionalHistorySchema.userId, userId));
    return result as MealPlanNutritionSummary;
  }

  async getMealPlanEntries(
    filters: MealPlanEntryFilters
  ): Promise<MealPlanEntry[]> {
    const today = new Date();
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split("T")[0];
    const query = db
      .select({
        id: mealEntriesSchema.id,
        recipeId: mealEntriesSchema.recipeId,
        activeMealplanId: mealEntriesSchema.activeMealPlanId,
        plannedDate: mealEntriesSchema.plannedDate,
        mealType: mealEntriesSchema.mealType,
        servings: mealEntriesSchema.servings,
        createdAt: mealEntriesSchema.createdAt,
        updatedAt: mealEntriesSchema.updatedAt,
        isCooked: mealEntriesSchema.isCooked,
        ...(filters?.includeRecipes && { recipe: recipeFields }),
      })
      .from(mealEntriesSchema)
      .where(
        and(
          eq(mealEntriesSchema.userId, filters?.userId),
          gte(mealEntriesSchema.plannedDate, filters?.startDate ?? localToday),
          filters?.isCooked !== undefined
            ? eq(mealEntriesSchema.isCooked, filters?.isCooked)
            : undefined,
          filters?.endDate
            ? lte(mealEntriesSchema.plannedDate, filters.endDate)
            : undefined
        )
      )
      .orderBy(mealEntriesSchema.plannedDate, mealEntriesSchema.mealType)
      .$dynamic();

    if (filters?.includeRecipes) {
      query.leftJoin(
        recipesSchema,
        eq(mealEntriesSchema.recipeId, recipesSchema.id)
      );
    }

    return (await query) as any[];
  }

  async updateMealPlanEntry(
    data: Partial<MealPlanEntry>
  ): Promise<MealPlanEntry> {
    const [result] = await db
      .update(mealEntriesSchema)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mealEntriesSchema.id, data.id!))
      .returning();

    return result as MealPlanEntry;
  }

  async getMealPlanRecipeItems(
    data: GetMealplanRecipeItems
  ): Promise<MealPlanEntryResponseDto[]> {
    const today = new Date();
    const localToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split("T")[0];

    const response = await db
      .select({
        id: recipeIngredientsSchema.id,
        plannedDate: mealEntriesSchema.plannedDate,
        ingredientId: recipeIngredientsSchema.ingredientId,
        name: {
          en: ingredientsSchema.name_en,
          es: ingredientsSchema.name_es,
          fr: ingredientsSchema.name_fr,
        },
        category: ingredientsSchema.category,
        measurementValue: recipeIngredientsSchema.measurementValue,
        measurementType: recipeIngredientsSchema.measurementType,
        conversions: ingredientsSchema.conversions,
        recipe:mealEntriesSchema.name
      })
      .from(mealEntriesSchema)
      .innerJoin(
        recipeIngredientsSchema,
        eq(recipeIngredientsSchema.recipeId, mealEntriesSchema.recipeId)
      )
      .innerJoin(
        ingredientsSchema,
        eq(ingredientsSchema.id, recipeIngredientsSchema.ingredientId)
      )
      .where(
        and(
          eq(mealEntriesSchema.userId, data.userId),
          eq(mealEntriesSchema.isCooked, false),
          gte(mealEntriesSchema.plannedDate, data?.startDate ?? localToday),
          data?.endDate
            ? lte(mealEntriesSchema.plannedDate, data.endDate)
            : undefined
        )
      );

    return response as MealPlanEntryResponseDto[];
  }
}
