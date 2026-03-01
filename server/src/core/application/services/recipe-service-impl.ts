import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { NotFoundError, ValidationError } from "../../../errors/customErrors";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { RecipeNutritionDomainService } from "../../domain/services/recipe-nutrition.domain-service";
import {
  FilterRecipeIngredient,
  GetRecentlyViewdRecipes,
  GetSuggestedMealIngredientsInput,
  Recipe,
  RecipeCook,
  RecipeCookedFilter,
  RecipeFilter,
  RecipeIngredient,
  RecipeTip,
  RecipeTipsFIlter,
  RecipeView,
  ResponseRecipeTipDto,
  SaveRecipeMetrics,
  UpdateTip,
} from "../../domain/recipe.model";
import { RecipesRepository } from "../../domain/repositories";
import {
  IaRecipeCookDto,
  RecipeCookDto,
  RecipeDto,
  RecipeTipDto,
  RecipeViewDto,
  SearchRecipeDto,
} from "../dto";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { RedisCacheService } from "./redis-cache.service";
import { RecipesService } from "./interfaces/recipe";

@Injectable()
export class RecipeServiceImpl implements RecipesService {
  constructor(
    @Inject("RecipesRepository")
    private readonly recipesRepository: RecipesRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  getCookedRecipes(filter: RecipeCookedFilter): Promise<RecipeCook[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.COOKED(filter),
      CacheKeys.RECIPE.COOKED_PREFIX,
      () => this.recipesRepository.getCookedRecipes(filter),
      CacheTTL.SHORT,
    );
  }

  getIngredientsBy(
    filter: FilterRecipeIngredient
  ): Promise<RecipeIngredient[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.INGREDIENTS(filter),
      CacheKeys.RECIPE.INGREDIENTS_PREFIX,
      () => this.recipesRepository.getIngredientsBy(filter),
      CacheTTL.LONG,
    );
  }

  async getSuggestedPlanRecipeIngredients({
    recipeIngredients,
    recipes,
    targetServings,
  }: GetSuggestedMealIngredientsInput): Promise<RecipeIngredient[]> {
    return RecipeNutritionDomainService.aggregateSuggestedPlanIngredients(
      recipes, recipeIngredients, targetServings,
    );
  }

  getRecentlyViewedRecipes(filter: GetRecentlyViewdRecipes): Promise<Recipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.RECENTLY_VIEWED(filter),
      CacheKeys.RECIPE.PREFIX,
      () => this.recipesRepository.getRecentlyViewedRecipes(filter),
      CacheTTL.SHORT,
    );
  }

  latestCookedCommunityRecipes(limit?: number): Promise<Recipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.LATEST_COOKED_COMMUNITY(limit),
      CacheKeys.RECIPE.COMMUNITY_PREFIX,
      () => this.recipesRepository.latestCookedCommunityRecipes(limit),
      CacheTTL.SHORT,
    );
  }

  async saveRecipeMetrics(data: SaveRecipeMetrics): Promise<void> {
    await this.recipesRepository.saveRecipeMetrics(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.COOKED_PREFIX);
  }

  async getLatestCommunityRecipes(): Promise<Recipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.LATEST_COMMUNITY(),
      CacheKeys.RECIPE.COMMUNITY_PREFIX,
      async () => {
        const { items } = await this.recipesRepository.getAll(
          { onlyCommunityRecipes: true, includeAuthor: true },
          { limit: 10 },
        );
        return items;
      },
      CacheTTL.SHORT,
    );
  }

  async saveRecipeViews(dto: RecipeViewDto[]): Promise<void> {
    const currentDate = new Date().toISOString().split("T")[0];
    const data: RecipeView[] = dto.map((item) => ({
      ...item,
      date: currentDate,
      createdAt: new Date(),
    }));
    await this.recipesRepository.saveRecipeViews(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.PREFIX);
  }

  async registerRecipeCooked(data: RecipeCookDto): Promise<void> {
    if (!data?.recipe) {
      throw new BadRequestException("Recipe not found");
    }

    const consumedServings = (data?.servings ?? data?.recipe?.servings!) ?? 1;

    const nutrients = RecipeNutritionDomainService.calculateNutrientsByPortions(
      {
        calories: data.recipe.calories,
        proteins: data.recipe.proteins,
        carbs: data.recipe.carbs,
        fats: data.recipe.fats,
      },
      consumedServings,
      data.recipe.servings!,
    );

    await this.recipesRepository.registerRecipeCooked({
      ...data,
      calories: nutrients.calories,
      carbohydrates: nutrients.carbohydrates,
      proteins: nutrients.proteins,
      fats: nutrients.fats,
      cookedAt: new Date().toISOString(),
    });
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.COOKED_PREFIX);
  }

  async registerIaCookedRecipe(dto: IaRecipeCookDto): Promise<void> {
    await this.recipesRepository.registerRecipeCooked({
      ...dto,
      cookedAt: new Date().toISOString(),
    });
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.COOKED_PREFIX);
  }

  async registerRecipeFromMealplanAsCooked(data: RecipeCookDto): Promise<void> {
    const recipe = await this.recipesRepository.getById(data.recipeId);
    await this.registerRecipeCooked({ ...data, recipe });
  }

  private async resolveRootRecipeId(parentRecipeId?: string): Promise<string | undefined> {
    if (!parentRecipeId) return undefined;
    const sourceRecipe = await this.recipesRepository.getById(parentRecipeId);
    if (!sourceRecipe) {
      throw NotFoundError.productNotFound(parentRecipeId);
    }
    return sourceRecipe.parentRecipeId ?? sourceRecipe.id;
  }

  private async buildRecipeDto(recipeDto: RecipeDto): Promise<Recipe> {
    const recipeId = uuidv4();
    const createdAt = new Date();
    if (!recipeDto?.ingredients?.length) {
      throw new BadRequestException("Please include at least one ingredient");
    }
    const parentRecipeId = await this.resolveRootRecipeId(recipeDto.parentRecipeId);

    const ingredientsMap: RecipeIngredient[] = recipeDto.ingredients.map(
      (item) => ({
        id: uuidv4(),
        recipeId,
        ingredientId: item.ingredientId,
        ingredientName: item.ingredientName,
        userId: recipeDto.userId,
        measurementType: item.measurementType,
        measurementValue: item.measurementValue!,
      })
    );

    return {
      ...recipeDto,
      parentRecipeId: parentRecipeId ?? null,
      ...recipeDto?.nutricionalValues!,
      includeInSuggestedRecipes: true,
      recipeType: "COMMUNITY",
      id: recipeId,
      createdAt,
      totalTime: (recipeDto.prepTime ?? 0) + (recipeDto.cookTime ?? 0),
      ingredients: ingredientsMap,
    } as Recipe;
  }
  async updateRecipeTip(data: UpdateTip): Promise<RecipeTip> {
    const result = await this.recipesRepository.updateTip(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.TIPS_PREFIX);
    return result;
  }

  async saveRecipeTip(data: RecipeTipDto): Promise<RecipeTip> {
    const recipeTip: RecipeTip = {
      ...data,
      image: data?.image as any,
      id: uuidv4(),
      createdAt: new Date(),
    };
    const result = await this.recipesRepository.saveTip(recipeTip);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.TIPS_PREFIX);
    return result;
  }

  getRecipeTips(
    filters: RecipeTipsFIlter
  ): Promise<PaginatedResponse<ResponseRecipeTipDto>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.TIPS(filters),
      CacheKeys.RECIPE.TIPS_PREFIX,
      () => this.recipesRepository.getTips(filters),
      CacheTTL.MEDIUM,
    );
  }

  getAllRecipes(
    filter: RecipeFilter,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Recipe>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.ALL(filter, pagination),
      CacheKeys.RECIPE.PREFIX,
      () => this.recipesRepository.getAll(filter, pagination),
      CacheTTL.SHORT,
    );
  }

  getUserRecipes(userId: string): Promise<PaginatedResponse<Recipe>> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.BY_USER(userId),
      CacheKeys.RECIPE.PREFIX,
      () => this.recipesRepository.getAll({ userId }, { page: 1 }),
      CacheTTL.SHORT,
    );
  }

  async getRecipeById(id: string): Promise<Recipe> {
    if (!id) {
      throw new ValidationError("Recipe id not valid", "FIELD_INVALID");
    }
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.BY_ID(id),
      CacheKeys.RECIPE.PREFIX,
      async () => {
        const recipe = await this.recipesRepository.getById(id);
        if (!recipe) {
          throw NotFoundError.productNotFound(id);
        }
        return recipe;
      },
      CacheTTL.LONG,
    );
  }

  getRecipeVariants(recipeId: string): Promise<Recipe[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.VARIANTS(recipeId),
      CacheKeys.RECIPE.PREFIX,
      () => this.recipesRepository.getVariantsByRecipe(recipeId),
      CacheTTL.SHORT,
    );
  }

  searchRecipesBy(searchRecipe?: SearchRecipeDto): Promise<Recipe[]> {
    const { ...rest } = searchRecipe ?? {};
    const advancedFilters = [];
    if (searchRecipe?.cookTime) {
      advancedFilters.push({
        field: "totalTime",
        operator: "lte",
        value: searchRecipe.cookTime,
      });
    }
    const searchFilter = {
      ...rest,
      advancedFilters: advancedFilters as any,
      limit: searchRecipe?.limit,
    };
    return this.redisCacheService.getOrSet(
      CacheKeys.RECIPE.SEARCH(searchFilter),
      CacheKeys.RECIPE.SEARCH_PREFIX,
      () => this.recipesRepository.searchBy(searchFilter),
      CacheTTL.SHORT,
    );
  }

  async createRecipe(data: RecipeDto): Promise<Recipe> {
    const recipe = await this.buildRecipeDto(data);
    const result = await this.recipesRepository.create(recipe);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.INGREDIENTS_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.SEARCH_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.COMMUNITY_PREFIX);
    return result;
  }

  async updateRecipe(data: Partial<Recipe>): Promise<Recipe> {
    const result = await this.recipesRepository.update(data);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.SEARCH_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.COMMUNITY_PREFIX);
    return result;
  }

  async deleteRecipe(id: string): Promise<Recipe> {
    const result = await this.recipesRepository.delete(id);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.INGREDIENTS_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.SEARCH_PREFIX);
    await this.redisCacheService.invalidatePrefix(CacheKeys.RECIPE.COMMUNITY_PREFIX);
    return result;
  }
  /**
   * Calcula el porcentaje de completitud de los ingredientes
   * @param ingredients Lista de ingredientes analizados
   * @returns Porcentaje de disponibilidad (0-100)
   */

  // async findRecipesByPantryIngredients(
  //   dto: RecipesByPantryItemsDto
  // ): Promise<any[]> {
  //   const recipes = await this.recipesRepository.FindRecipesByPantryIngredients(
  //     dto.userId
  //   );
  //   const recipesWithAnalysis = recipes
  //     .map(({ ingredients, ...recipe }) => {
  //       const analysis = ingredients.reduce(
  //         (acc: any, ingredient: any) => {
  //           const pantryItem = dto.pantryItems.find(
  //             (p: any) => p?.ingredientId === ingredient?.ingredientId
  //           );
  //           const baseIngredient = {
  //             id: ingredient.id,
  //             ingredientName: ingredient.ingredientName,
  //             recipeMeasurementType: ingredient.measurementType,
  //             pantryId: pantryItem?.id,
  //             quantity: ingredient.quantity,
  //           };

  //           if (pantryItem) {
  //             const fromUnit = pantryItem?.measurementType as any;
  //             const toUnit = ingredient.measurementType;
  //             const pantryCurrentQuantity = pantryItem?.measurementValue;
  //             const {
  //               success: isSucessConvertion,
  //               value,
  //               error,
  //             } = IngredientUnitConverter.convert(
  //               pantryCurrentQuantity,
  //               fromUnit,
  //               toUnit,
  //               pantryItem?.conversions
  //             );
  //             // console.log(
  //             //   `Converting ${pantryItem.name?.es} ${pantryCurrentQuantity} ${fromUnit} to ${toUnit}:`,
  //             //   { isSucessConvertion, value, error }
  //             // );
  //             const convertedValue = isSucessConvertion ? Math.floor(value!)  : 0;
  //             const missingAmount = isSucessConvertion
  //               ? ingredient.quantity - convertedValue!
  //               : 0;
  //             acc.ingredients.push({
  //               ...baseIngredient,
  //               availableConvertedQuantity: convertedValue,
  //               originalPantryQuantity: pantryCurrentQuantity,
  //               errorConvertion: error,
  //               isSuccessConvertion: isSucessConvertion,
  //               pantryMeasurementType: pantryItem.measurementType,
  //               pantryMeasurementValue: pantryItem.measurementValue,
  //               missingAmount,
  //             });

  //             if (
  //               convertedValue >= ingredient.quantity ||
  //               !isSucessConvertion
  //             ) {
  //               acc.sufficientIngredients.push(ingredient);
  //               acc.totalInPantryIngredients++;
  //             } else {
  //               acc.insufficientIngredients.push({
  //                 ...ingredient,
  //                 availableConvertedQuantity: convertedValue,
  //                 originalPantryQuantity: pantryCurrentQuantity,
  //                 missingAmount,
  //                 measurementType: toUnit,
  //               });
  //             }
  //           } else {
  //             acc.ingredients.push({
  //               ...ingredient,
  //               availableConvertedQuantity: 0,
  //               missingAmount: ingredient.quantity,
  //             });

  //             acc.insufficientIngredients.push({
  //               ...ingredient,
  //               availableConvertedQuantity: 0,
  //               missingAmount: ingredient.quantity,
  //             });
  //           }

  //           return acc;
  //         },
  //         {
  //           totalInPantryIngredients: 0,
  //           sufficientIngredients: [] as any[],
  //           insufficientIngredients: [] as any[],
  //           ingredients: [] as any[],
  //         }
  //       );

  //       return {
  //         ...recipe,
  //         ingredients: analysis.ingredients,
  //         totalIngredients: ingredients.length,
  //         missingIngredients: analysis.insufficientIngredients.length,
  //         totalInPantryIngredients: analysis.totalInPantryIngredients,
  //         sufficientIngredients: analysis.sufficientIngredients,
  //         insufficientIngredients: analysis.insufficientIngredients,
  //       };
  //     })
  //     .filter((recipe) => recipe.includeInSuggestedRecipes);

  //   return recipesWithAnalysis.sort(
  //     (a, b) => a.missingIngredients - b.missingIngredients
  //   );
  // }
}
