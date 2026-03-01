import { Injectable } from "@nestjs/common";
import {
  and,
  asc,
  desc,
  eq,
  getTableColumns,
  gte,
  ilike,
  inArray,
  isNotNull,
  like,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../../../config/drizzle/db";
import {
  ingredientsSchema,
  recipeCooksSchema,
  recipeIngredientsSchema,
  recipeMetricsSchema,
  recipesSchema,
  recipeTipsSchema,
  recipeViewsSchema,
  suggestedMealPlanRecipesSchema,
  userNutritionalHistorySchema,
  usersSchema,
} from "../../../config/drizzle/schemas";
import { dbGetAll } from "../../../lib/db/drizzle-client";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import {
  FilterRecipeIngredient,
  GetRecentlyViewdRecipes,
  Recipe,
  RecipeCook,
  RecipeCookedFilter,
  RecipeFilter,
  RecipeIngredient,
  RecipeTip,
  RecipeTipsFIlter,
  RecipeView,
  ResponseRecipeTipDto,
  SaveRecipeCook,
  SaveRecipeMetrics,
  SearchRecipe,
  UpdateTip,
} from "../../domain/recipe.model";
import { RecipesRepository } from "../../domain/repositories";
export interface RecipeAdvancedFilter {
  field: keyof typeof recipesSchema;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in";
  value: any;
}

@Injectable()
export class RecipesRepositoryImpl implements RecipesRepository {
  async getIngredientsByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    return this.getIngredientsBy({ recipeId });
  }
  async saveRecipeViews(data: RecipeView[]): Promise<void> {
    await db.insert(recipeViewsSchema).values(data);
  }

  async getSuggestedMealsRecipeIngredients(
    suggestedMealplanId: string
  ): Promise<RecipeIngredient[]> {
    const results = await db
      .select({
        id: ingredientsSchema.id,
        ingredientName: recipeIngredientsSchema.ingredientName,
        notes: recipeIngredientsSchema.notes,
        servings:suggestedMealPlanRecipesSchema.servings,
        recipeId: suggestedMealPlanRecipesSchema.recipeId,
        ingredientId: recipeIngredientsSchema.ingredientId,
        name: {
          es: ingredientsSchema.name_es,
          fr: ingredientsSchema.name_fr,
          en: ingredientsSchema.name_en,
        },
        category: ingredientsSchema.category,
        measurementValue: recipeIngredientsSchema.measurementValue,
        measurementType: recipeIngredientsSchema.measurementType,
        conversions: ingredientsSchema.conversions,
        image: ingredientsSchema.image,
      })
      .from(suggestedMealPlanRecipesSchema)
      .leftJoin(
        recipeIngredientsSchema,
        eq(
          recipeIngredientsSchema.recipeId,
          suggestedMealPlanRecipesSchema.recipeId
        )
      )
      .leftJoin(
        ingredientsSchema,
        eq(ingredientsSchema.id, recipeIngredientsSchema.ingredientId)
      )
      .where(
        and(
          eq(
            suggestedMealPlanRecipesSchema.suggestedMealPlanId,
            suggestedMealplanId
          ),
          eq(recipesSchema.isDeleted, false)
        )
      );

    return results as RecipeIngredient[];
  }

  private buildDynamicConditions(
    simpleFilters?: Partial<Recipe>,
    advancedFilters?: RecipeAdvancedFilter[]
  ): any[] {
    const conditions: any[] = [];

    if (simpleFilters) {
      Object.entries(simpleFilters).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        const column = recipesSchema[key as keyof typeof recipesSchema];
        if (!column) return;

        conditions.push(eq(column as any, value));
      });
    }

    if (advancedFilters) {
      advancedFilters.forEach((filter) => {
        const column =
          recipesSchema[filter.field as keyof typeof recipesSchema];
        if (!column) return;

        switch (filter.operator) {
          case "eq":
            conditions.push(eq(column as any, filter.value));
            break;
          case "ne":
            conditions.push(ne(column as any, filter.value));
            break;
          case "gt":
            conditions.push(sql`${column} > ${filter.value}`);
            break;
          case "gte":
            conditions.push(gte(column as any, filter.value));
            break;
          case "lt":
            conditions.push(sql`${column} < ${filter.value}`);
            break;
          case "lte":
            conditions.push(lte(column as any, filter.value));
            break;
          case "like":
            conditions.push(like(column as any, filter.value));
            break;
          case "ilike":
            conditions.push(ilike(column as any, filter.value));
            break;
          case "in":
            conditions.push(inArray(column as any, filter.value));
            break;
        }
      });
    }

    return conditions;
  }
  async getAll(
    filter: RecipeFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Recipe>> {
    const conditions = [];
    const { limit = 10, page = 1 } = pagination ?? {};
    if (filter.userId) {
      conditions.push(eq(recipesSchema.userId, filter.userId));
    }
    conditions.push(eq(recipesSchema.isDeleted, false));

    if (filter.onlyCommunityRecipes) {
      conditions.push(eq(recipesSchema.isSharedCommunity, true));
    }

    if (filter.recipeType) {
      conditions.push(eq(recipesSchema.recipeType, filter.recipeType));
    }

    if (filter?.searchQuery) {
      conditions.push(ilike(recipesSchema.name, `%${filter.searchQuery}%`));
    }

    const hasIngredientFilter =
      filter?.ingredientIds && filter.ingredientIds.length > 0;

    const query = db
      .select({
        ...getTableColumns(recipesSchema),
        ...(filter?.includeAuthor && {
          user: {
            id: usersSchema.id,
            fullName: usersSchema.fullName,
            avatarUrl: usersSchema.avatarUrl,
          },
        }),
        ...(filter?.ingredientIds && filter.ingredientIds?.length > 0
          ? {
              matchingIngredientsCount: sql<number>`
          COALESCE(
            array_length(
              ARRAY(
                SELECT unnest(${recipesSchema.ingredientIds}::text[])
                INTERSECT
                SELECT unnest(ARRAY[${sql.join(
                  filter.ingredientIds!.map((id) => sql`${id}::text`),
                  sql`, `
                )}]::text[])
              ),
              1
            ),
            0
          )
        `.as("matching_ingredients_count"),
              totalIngredientsCount: sql<number>`
          COALESCE(array_length(${recipesSchema.ingredientIds}, 1), 0)
        `.as("total_ingredients_count"),
            }
          : null),
        ...(filter?.includeIngredients && {
          ingredients: sql<any>`
          json_agg(
            jsonb_build_object(
              'id', ${recipeIngredientsSchema.id},
              'ingredientName', ${recipeIngredientsSchema.ingredientName},
              'measurementType', ${recipeIngredientsSchema.measurementType},
              'measurementValue', ${recipeIngredientsSchema.measurementValue},
              'ingredientId', ${recipeIngredientsSchema.ingredientId}
            )
          ) FILTER (WHERE ${recipeIngredientsSchema.id} IS NOT NULL)
        `,
        }),
      })
      .from(recipesSchema)
      .$dynamic();

    if (filter?.includeAuthor) {
      query.leftJoin(usersSchema, eq(recipesSchema.userId, usersSchema.id));
    }

    if (hasIngredientFilter) {
      conditions.push(
        sql`${recipesSchema.ingredientIds}::text[] && ARRAY[${sql.join(
          filter.ingredientIds!.map((id) => sql`${id}::text`),
          sql`, `
        )}]::text[]`
      );
    }

    if (filter?.includeIngredients) {
      query.leftJoin(
        recipeIngredientsSchema,
        eq(recipeIngredientsSchema.recipeId, recipesSchema.id)
      );
      query.groupBy(recipesSchema.id);

      if (filter?.includeAuthor) {
        query.groupBy(usersSchema.id);
      }
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    if (hasIngredientFilter) {
      query.orderBy(
        desc(sql`matching_ingredients_count`),
        sql`total_ingredients_count ASC`
      );
    }

    query.orderBy(desc(recipesSchema.createdAt));
    const offset = Math.max((page - 1) * limit, 0);

    query.limit(limit + 1).offset(offset);
    const results = (await query) as Recipe[];

    const hasMore = results.length > limit;

    const items = hasMore ? results.slice(0, limit) : results;

    return {
      items,
      hasMore,
      page,
    };
  }

  async saveRecipeMetrics(data: SaveRecipeMetrics): Promise<void> {
    const todaysDate = new Date().toISOString().split("T")[0];

    const viewsEvents = await dbGetAll("recipeViewsSchema", {
      where: and(
        gte(recipeViewsSchema.createdAt, data.startDate),
        lte(recipeMetricsSchema.createdAt, data.endDate)
      ),
    });

    if (viewsEvents?.length > 0) {
      const savePromises = viewsEvents.map((item) =>
        db
          .insert(recipeMetricsSchema)
          .values({ ...item, date: todaysDate })
          .onConflictDoUpdate({
            target: [recipeMetricsSchema.date, recipeMetricsSchema.recipeId],
            set: {
              cookedCount: sql`${recipeMetricsSchema.cookedCount} + 1`,
            },
          })
      );
      await Promise.all(savePromises);
    }
  }

  async getIngredientsBy(
    filters: FilterRecipeIngredient
  ): Promise<RecipeIngredient[]> {
    const results = await db
      .select({
        ...getTableColumns(recipeIngredientsSchema),
        name: {
          en: ingredientsSchema.name_en,
          es: ingredientsSchema.name_es,
          fr: ingredientsSchema.name_fr,
        },
        category: ingredientsSchema.category,
        conversions:ingredientsSchema.conversions,
      })
      .from(recipeIngredientsSchema)
      .leftJoin(recipesSchema, eq(recipeIngredientsSchema.recipeId, recipesSchema.id))
      .leftJoin(
        ingredientsSchema,
        eq(recipeIngredientsSchema.ingredientId, ingredientsSchema.id)
      )
      .where(
        and(
          or(
            filters.recipeId
              ? eq(recipeIngredientsSchema.recipeId, filters.recipeId)
              : undefined,
            filters.recipeIds
              ? inArray(recipeIngredientsSchema.recipeId, filters.recipeIds)
              : undefined
          ),
          eq(recipesSchema.isDeleted, false),
        )
      );
    return results as RecipeIngredient[];
  }

  async latestCookedCommunityRecipes(limit?: number): Promise<Recipe[]> {
    return db
      .selectDistinctOn([recipeCooksSchema.recipeId], {
        ...getTableColumns(recipesSchema),
        user: {
          fullName: usersSchema.fullName,
          avatarUrl: usersSchema.avatarUrl,
        },
      })
      .from(recipeCooksSchema)
      .innerJoin(
        recipesSchema,
        eq(recipeCooksSchema.recipeId, recipesSchema.id)
      )
      .leftJoin(usersSchema, eq(usersSchema.id, recipeCooksSchema.userId))
      .where(eq(recipesSchema.isDeleted, false))
      .limit(limit ?? 10)
      .orderBy(
        recipeCooksSchema.recipeId,
        desc(recipeCooksSchema.createdAt)
      ) as Promise<Recipe[]>;
  }

  getRecentlyViewedRecipes(filter: GetRecentlyViewdRecipes): Promise<Recipe[]> {
    return db
      .select({ ...getTableColumns(recipesSchema) })
      .from(recipeViewsSchema)
      .innerJoin(
        recipesSchema,
        eq(recipeViewsSchema.recipeId, recipesSchema.id)
      )
      .where(
        and(
          eq(recipesSchema.isDeleted, false),
          or(
            filter?.userId ? eq(recipesSchema.userId, filter.userId) : undefined,
            eq(recipeViewsSchema.sessionId, filter.sessionId)
          )
        )
      )
      .groupBy(recipesSchema.id)
      .orderBy(desc(sql`MAX(${recipeViewsSchema.createdAt})`))
      .limit(filter.limit ?? 0) as Promise<Recipe[]>;
  }

  async searchBy(searchRecipe?: SearchRecipe): Promise<Recipe[]> {
    let query = db
      .select({
        ...getTableColumns(recipesSchema),
        ...(searchRecipe?.includeAuthor && {
          user: {
            id: usersSchema.id,
            fullName: usersSchema.fullName,
            avatarUrl: usersSchema.avatarUrl,
          },
        }),
        ...(searchRecipe?.ingredientIds &&
        searchRecipe.ingredientIds?.length > 0
          ? {
              matchingIngredientsCount: sql<number>`
            COALESCE(
              array_length(
                ARRAY(
                  SELECT unnest(${recipesSchema.ingredientIds}::text[])
                  INTERSECT
                  SELECT unnest(ARRAY[${sql.join(
                    searchRecipe.ingredientIds!.map((id) => sql`${id}::text`),
                    sql`, `
                  )}]::text[])
                ),
                1
              ),
              0
            )
          `.as("matching_ingredients_count"),
              totalIngredientsCount: sql<number>`
            COALESCE(array_length(${recipesSchema.ingredientIds}, 1), 0)
          `.as("total_ingredients_count"),
            }
          : null),
      })
      .from(recipesSchema)
      .$dynamic();

    const conditions: any[] = [];
    conditions.push(eq(recipesSchema.isDeleted, false));

    if (searchRecipe?.query) {
      conditions.push(ilike(recipesSchema.name, `%${searchRecipe.query}%`));
    }

    if (searchRecipe?.mealTypes && searchRecipe.mealTypes.length > 0) {
      const mealTypeConditions = searchRecipe.mealTypes.map(
        (mealType) => sql`${recipesSchema.mealTypes}::jsonb ? ${mealType}`
      );
      conditions.push(or(...mealTypeConditions));
    }

    // Filtro por cocinas (múltiples) - usando inArray
    // if (searchRecipe?.cuisines && searchRecipe.cuisines.length > 0) {
    //   conditions.push(inArray(recipesSchema.cuisine, searchRecipe.cuisines));
    // }

    // Filtro por tiempo (múltiples rangos)
    if (searchRecipe?.times && searchRecipe.times.length > 0) {
      const timeConditions = searchRecipe.times.map((timeRange) => {
        switch (timeRange) {
          case "under-15":
            return sql`${recipesSchema.totalTime} < 15`;
          case "15-30":
            return sql`${recipesSchema.totalTime} >= 15 AND ${recipesSchema.totalTime} <= 30`;
          case "30-60":
            return sql`${recipesSchema.totalTime} > 30 AND ${recipesSchema.totalTime} <= 60`;
          case "over-60":
            return sql`${recipesSchema.totalTime} > 60`;
          default:
            return sql`1=1`;
        }
      });
      conditions.push(or(...timeConditions));
    }

    // Filtro por dificultad (múltiples) - usando inArray
    if (searchRecipe?.difficulties && searchRecipe.difficulties.length > 0) {
      conditions.push(
        inArray(recipesSchema.dificulty, searchRecipe.difficulties)
      );
    }

    // Filtro por ingredientes
    if (searchRecipe?.ingredientIds && searchRecipe.ingredientIds.length > 0) {
      conditions.push(
        sql`${recipesSchema.ingredientIds}::text[] && ARRAY[${sql.join(
          searchRecipe.ingredientIds.map((id) => sql`${id}::text`),
          sql`, `
        )}]::text[]`
      );
    }

    // Filtro por cantidad de ingredientes
    if (
      searchRecipe?.ingredientCount &&
      searchRecipe?.ingredientCount !== undefined
    ) {
      conditions.push(
        sql`COALESCE(array_length(${recipesSchema.ingredientIds}, 1), 0) <= ${searchRecipe.ingredientCount}`
      );
    }

    const dynamicConditions = this.buildDynamicConditions(
      searchRecipe?.simpleFilters,
      searchRecipe?.advancedFilters as any
    );

    conditions.push(...dynamicConditions);

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    if (searchRecipe?.includeAuthor) {
      query.leftJoin(usersSchema, eq(recipesSchema.userId, usersSchema.id));
    }

    query.groupBy(recipesSchema.id);

    if (searchRecipe?.includeAuthor) {
      query.groupBy(usersSchema.id);
    }

    const orderBy = [];

    if (searchRecipe?.userId && !searchRecipe.ingredientIds?.length) {
      orderBy.push(
        sql`CASE WHEN ${recipesSchema.userId} = ${searchRecipe.userId} THEN 0 ELSE 1 END`
      );
    }

    if (searchRecipe?.prepTime) {
      orderBy.push(asc(recipesSchema.totalTime));
    }

    if (searchRecipe?.ingredientIds && searchRecipe.ingredientIds.length > 0) {
      orderBy.push(desc(sql`matching_ingredients_count`));
      orderBy.push(sql`total_ingredients_count ASC`);
    }

    if (orderBy.length > 0) {
      query.orderBy(...orderBy);
    }

    if (searchRecipe?.limit) {
      query.limit(Number(searchRecipe.limit));
    }

    let result = await query;

    result = result.map((item) => ({
      ...item,
      totalIngredientsSearched: searchRecipe?.ingredientIds?.length ?? 0,
      isFilteredByIngredients:
        searchRecipe?.ingredientIds && searchRecipe.ingredientIds.length > 0,
    }));

    return result as any;
  }

  async getById(id: string): Promise<Recipe> {
    const [resuts] = await db
      .select({
        id: recipesSchema.id,
        name: recipesSchema.name,
        image: recipesSchema.image,
        description: recipesSchema.description,
        prepTime: recipesSchema.prepTime,
        cookTime: recipesSchema.cookTime,
        totalTime: recipesSchema.totalTime,
        isSharedCommunity: recipesSchema.isSharedCommunity,
        includeInSuggestedRecipes: recipesSchema.includeInSuggestedRecipes,
        servings: recipesSchema.servings,
        dificulty: recipesSchema.dificulty,
        mealTypes: recipesSchema.mealTypes,
        instructions: recipesSchema.instructions,
        notes: recipesSchema.notes,
        calories: recipesSchema.calories,
        proteins: recipesSchema.proteins,
        fats: recipesSchema.fats,
        carbs: recipesSchema.carbs,
        userId: recipesSchema.userId,
        parentRecipeId: recipesSchema.parentRecipeId,
      })
      .from(recipesSchema)
      .where(and(eq(recipesSchema.id, id), eq(recipesSchema.isDeleted, false)));

    return resuts as any;
  }

  async getVariantsByRecipe(recipeId: string): Promise<Recipe[]> {
    const [sourceRecipe] = await db
      .select({
        id: recipesSchema.id,
        parentRecipeId: recipesSchema.parentRecipeId,
      })
      .from(recipesSchema)
      .where(and(eq(recipesSchema.id, recipeId), eq(recipesSchema.isDeleted, false)))
      .limit(1);

    if (!sourceRecipe) return [];

    const rootRecipeId = sourceRecipe.parentRecipeId ?? sourceRecipe.id;

    return db
      .select({
        ...getTableColumns(recipesSchema),
      })
      .from(recipesSchema)
      .where(
        and(
          eq(recipesSchema.parentRecipeId, rootRecipeId),
          eq(recipesSchema.isDeleted, false),
        )
      )
      .orderBy(desc(recipesSchema.createdAt)) as Promise<Recipe[]>;
  }
  async create(data: Recipe): Promise<Recipe> {
    const { ingredients, ...recipeItem } = data;

    await db.transaction(async (tx) => {
      const recipePromise = tx.insert(recipesSchema).values(recipeItem);
      const recipeItemsPromise = tx
        .insert(recipeIngredientsSchema)
        .values(data.ingredients!);
      await Promise.all([recipePromise, recipeItemsPromise]);
    });
    return data;
  }

  async update(data: Partial<Recipe>): Promise<Recipe> {
    return await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(recipesSchema)
        .set(data)
        .where(eq(recipesSchema.id, data.id!))
        .returning();
      if (data?.ingredients && data.ingredients.length > 0) {
        const promises = data.ingredients.map((ingredient) => {
          const { ingredientName, measurementType, measurementValue, notes } =
            ingredient;
          const updateData = {
            ingredientName,
            measurementType,
            measurementValue,
            notes,
          };

          Object.keys(updateData).forEach((key) => {
            if (updateData[key as keyof unknown] == null)
              delete updateData[key as keyof unknown];
          });
          return tx
            .update(recipeIngredientsSchema)
            .set(updateData)
            .where(eq(recipeIngredientsSchema.id, ingredient.id))
            .returning();
        });

        await Promise.all(promises);
      }
      return updated as any;
    });
  }

  async delete(id: string): Promise<Recipe> {
    const [result] = await db
      .update(recipesSchema)
      .set({ isDeleted: true })
      .where(and(eq(recipesSchema.id, id), eq(recipesSchema.isDeleted, false)))
      .returning();
    return result as any;
  }

  async getCookedRecipes(filter: RecipeCookedFilter): Promise<RecipeCook[]> {
    const { limit = 10, page = 1 } = filter ?? {};
    const offset = Math.max((page - 1) * limit, 0);

    return db
      .select({
        ...getTableColumns(recipeCooksSchema),
        user: {
          fullName: usersSchema.fullName,
          avatarUrl: usersSchema.avatarUrl,
        },
      })
      .from(recipeCooksSchema)
      .leftJoin(usersSchema, eq(usersSchema.id, recipeCooksSchema.userId))
      .where(
        and(
          filter.recipeId
            ? eq(recipeCooksSchema.recipeId, filter.recipeId)
            : undefined,
          isNotNull(recipeCooksSchema.image)
        )
      )
      .limit(filter.limit ?? 10)
      .offset(offset)
      .orderBy(desc(recipeCooksSchema.createdAt)) as Promise<RecipeCook[]>;
  }

  async registerRecipeCooked(data: SaveRecipeCook): Promise<void> {
    await db.transaction(async (tx) => {
      const recipeCookPromise = data?.recipeId
        ? tx
            .insert(recipeCooksSchema)
            .values({
              userId: data.userId,
              recipeId: data.recipeId,
              image: data?.image ?? null,
              notes: data?.notes,
              rating: data.rating,
            })
            .returning()
        : Promise.resolve(null);
      const userNutritionalValuesPromise = tx
        .insert(userNutritionalHistorySchema)
        .values({
          recipeId: data?.recipeId,
          userId: data.userId,
          calories: data.calories,
          proteins: data.proteins,
          carbohydrates: data.carbohydrates,
          fats: data.fats,
          dailyCaloriesTarget: 3164,
          dailyCarbsTarget: 3164,
          dailyProteinTarget: 164,
          dailyFatTarget: 88,
        } as any);
    
      await Promise.all([
        recipeCookPromise,
        userNutritionalValuesPromise,
      ]);
    });
  }

  async getTips(
    filter: RecipeTipsFIlter
  ): Promise<PaginatedResponse<ResponseRecipeTipDto>> {
    const { limit = 10, page = 1 } = filter ?? {};
    const offset = Math.max((page - 1) * limit, 0);
    const result = await db
      .select({
        id: recipeTipsSchema.id,
        user: {
          fullName: usersSchema.fullName,
          avatarUrl: usersSchema.avatarUrl,
        },
        tip: recipeTipsSchema.tip,
        image: recipeTipsSchema.image,
        createdAt: recipeTipsSchema.createdAt,
        isActive: recipeTipsSchema.isActive,
      })
      .from(recipeTipsSchema)
      .leftJoin(usersSchema, eq(recipeTipsSchema.userId, usersSchema.id))
      .limit(limit + 1)
      .offset(offset)
      .orderBy(desc(recipeTipsSchema.createdAt))
      .where(eq(recipeTipsSchema.recipeId, filter.recipeId));

    const hasMore = result.length > limit ? true : false;
    const items: any = result.length > limit ? result.slice(0, 10) : result;

    return {
      hasMore,
      items,
      page: page,
    };
  }

  async saveTip(data: RecipeTip): Promise<RecipeTip> {
    const [result] = await db.insert(recipeTipsSchema).values(data);
    return result;
  }

  async updateTip(data: UpdateTip): Promise<RecipeTip> {
    const [result] = await db
      .update(recipeTipsSchema)
      .set(data)
      .where(eq(recipeTipsSchema.id, data.id));
    return result;
  }
}
