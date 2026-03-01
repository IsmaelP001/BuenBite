import { Inject, Injectable } from "@nestjs/common";
import { isArray } from "class-validator";
import { v4 as uuidv4 } from "uuid";
import { CacheKeys, CacheTTL } from "../../../shared/cache-keys-const";
import { IngredientUnitConverter } from "../../../utils/unitConverterV2";
import {
  AnalizeMultipleRecipeAvailabilityInPantry,
  BaseIngredientForAnalysis,
  ConfirmCook,
  IngredientsAnalysisResult,
  MissingMealplanIngredient,
  MissingPantryItemResult,
  Pantry,
  PantryIngredientMeasurement,
  PantryItem,
  PantryItemResponse,
  PantryMeasurementTransactionType,
  PantryTransactionsFilter,
  RegisterPantryItemsCooked,
  UpdatePantryOnPurchase,
} from "../../domain/pantry.model";
import { PURCHASE_UNITS } from "../../domain/purchases.model";
import { PantryRepository } from "../../domain/repositories";
import { PantryAnalyzerDomainService } from "../../domain/services/pantry-analyzer.domain-service";
import { PantryCollectionDomainService } from "../../domain/services/pantry-collection.domain-service";
import {
  AnalizeMultipleRecipesByPantryDto,
  AnalyzeIngredientsDto,
  MealPlanMissingIngredientsDto,
  PantryDto,
  RegisterPendingPurchaseDto,
} from "../dto";
import { RedisCacheService } from "./redis-cache.service";
import { PantryService } from "./interfaces/pantry";

@Injectable()
export class PantryServiceImpl implements PantryService {
  constructor(
    @Inject("PantryRepository")
    private readonly pantryRepository: PantryRepository,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  findOrCreatePantryItemsFromRecipes(data: PantryDto[]): Promise<PantryItem[]> {
    throw new Error("Method not implemented.");
  }

  analyzeIngredientsByPantryItems<T extends BaseIngredientForAnalysis>(
    dto: AnalyzeIngredientsDto<T>,
  ): IngredientsAnalysisResult<T> {
    return PantryAnalyzerDomainService.analyzeIngredients(dto);
  }

  async analyzeMultipleRecipesIngredientsAvailabilityInPantry({
    recipesIngredients,
    userId,
  }: AnalizeMultipleRecipesByPantryDto): Promise<
    AnalizeMultipleRecipeAvailabilityInPantry[]
  > {
    const pantryItems = await this.getUserPantry(userId);

    const results = recipesIngredients.map(
      ({ recipeId, ingredients, recipeServing, targetServings }) => {
        const analysis = this.analyzeIngredientsByPantryItems({
          pantryItems,
          recipeIngredients: ingredients,
          recipeServing,
          targetServings,
        });

        return {
          recipeId,
          analysis,
        };
      },
    );

    const sorted = results.sort((a, b) => {
      if (a.analysis?.targetServingsCompletionPercentage) {
        return (
          b.analysis.targetServingsCompletionPercentage! -
          a.analysis.targetServingsCompletionPercentage
        );
      }
      return b.analysis.completionPercentage - a.analysis.completionPercentage;
    });

    return sorted;
  }

  async createPantryItemsFromSource(
    currentPantryItems: PantryItem[],
    dto: PantryDto[],
    source: PantryMeasurementTransactionType,
  ): Promise<PantryItem[]> {
    const entityMap = PantryCollectionDomainService.toMap(
      currentPantryItems.map((item) =>
        item instanceof Pantry ? item : Pantry.from(item),
      ),
    );

    const entities: Pantry[] = dto.map((item) => {
      const existing = entityMap.get(item.ingredientId);
      let measurementValue = item.measurementValue;
      let measurementType = existing
        ? existing.measurementType
        : item.measurementType;

      if (existing && item.measurementType !== existing.measurementType) {
        const resolved = existing.resolveIncomingUnit(
          item.measurementValue,
          item.measurementType,
        );
        if (resolved.success && resolved.value) {
          measurementValue = resolved.value;
          existing.generateEvent(source, resolved.value);
        } else {
          existing.generateEvent(
            source,
            item.measurementValue,
            item?.measurementType as any,
          );
        }
      }

      return Pantry.from({
        id: uuidv4(),
        ingredientId: item.ingredientId,
        measurementType,
        measurementValue,
        userId: item.userId,
        recurrentAmount: 0,
        isRecurrent: false,
      });
    });

    const result = await this.pantryRepository.create(entities);
    await this.invalidatePantryCache();
    return result.map((e) => e.toPlain());
  }

  async syncPantryItems(
    currentPantryItems: PantryItem[],
    dto: PantryDto[],
    source: PantryMeasurementTransactionType,
  ): Promise<PantryItem[]> {
    const dtoItemsMap = new Map<string, PantryDto>();
    dto.forEach((item) => dtoItemsMap.set(item.ingredientId, item));

    const entitiesToUpdate = currentPantryItems
      .filter((item) => dtoItemsMap.has(item.ingredientId))
      .map((item) => (item instanceof Pantry ? item : Pantry.from(item)));

    const deductions: ConfirmCook[] = dto.map((item) => ({
      ingredientId: item.ingredientId,
      measurementValue: item.measurementValue,
      measurementType: item.measurementType,
      userId: item.userId,
    }));

    const updated = PantryCollectionDomainService.applyDeductions(
      entitiesToUpdate,
      deductions,
      source,
    );

    const result = await this.pantryRepository.update(updated);
    await this.invalidatePantryCache();
    return result.map((e) => e.toPlain());
  }

  async getMealPlanMisingPantryItems(
    data: MealPlanMissingIngredientsDto,
  ): Promise<MissingPantryItemResult[]> {
    // Build entity map from pantry items for efficient lookup + conversion
    const pantryEntityMap = new Map<string, Pantry>();
    data.pantryItems?.forEach((p) => {
      pantryEntityMap.set(p.ingredientId, Pantry.from(p));
    });

    const itemsToEvaluate = data.ingredients.reduce<
      Record<string, MissingMealplanIngredient>
    >((acc, item) => {
      const pantryEntity = pantryEntityMap.get(item.ingredientId);
      const key = item.ingredientId;
      const currentItem = acc[key];
      const isInPantry = Boolean(pantryEntity);

      if (!currentItem) {
        let measurementValue: number = pantryEntity?.measurementValue ?? 0;
        let measurementType = pantryEntity?.measurementType ?? "";
        const toUnitConvert =
          pantryEntity?.measurementType &&
          PURCHASE_UNITS.includes(pantryEntity.measurementType)
            ? pantryEntity.measurementType
            : item.conversions.default_unit;

        const { value, success } = IngredientUnitConverter.convert(
          item.measurementValue,
          item.measurementType,
          toUnitConvert,
          item.conversions,
        );

        if (pantryEntity && pantryEntity.measurementType !== toUnitConvert) {
          const resolved = pantryEntity.convertBetween(
            pantryEntity.measurementValue,
            pantryEntity.measurementType,
            toUnitConvert,
          );
          measurementValue = resolved.success ? resolved.value! : 0;
          measurementType = toUnitConvert;
        }

        const totalRequiredQuantity = Math.round(
          (success ? value : item.measurementValue!) ?? 0,
        );

        const { recipe, ...res } = item;

        acc[key] = {
          ...res,
          recipes: recipe ? [recipe] : [],
          measurementValue,
          measurementType,
          isSuccessConvertion: success,
          totalRequiredQuantity,
          isInPantry,
          originalPantryQuantity: pantryEntity?.measurementValue ?? 0,
          pantryMeasurementType: pantryEntity?.measurementType,
          userId: pantryEntity?.userId ?? "",
        } as MissingMealplanIngredient;
      } else {
        const { value, success } = IngredientUnitConverter.convert(
          item.measurementValue,
          item.measurementType,
          currentItem.measurementType,
          item.conversions,
        );

        const newRequiredQuantity = Math.round(
          (success ? value : item.measurementValue!) ?? 0,
        );

        acc[key] = {
          ...currentItem,
          isSuccessConvertion: success,
          recipes: item.recipe
            ? Array.from(new Set([...currentItem.recipes, item.recipe]))
            : currentItem.recipes,
          totalRequiredQuantity:
            currentItem.totalRequiredQuantity + newRequiredQuantity,
        };
      }

      return acc;
    }, {});

    const results = Object.values(itemsToEvaluate)
      .map((item) => {
        const entity = Pantry.withRequired(
          {
            id: "",
            userId: item.userId,
            ingredientId: item.ingredientId,
            measurementValue: item.measurementValue,
            measurementType: item.measurementType,
            conversions: item.conversions,
            isRecurrent: false,
            lowValueAlert: 0,
            pendingPurchaseQuantity: 0,
          },
          item.totalRequiredQuantity,
          0,
        );
        return {
          ...item,
          ...entity.getAlertConditions(),
        };
      })
      .filter((item) => item.include);

    return results as any;
  }
  async registerPendingPurchase(
    data: RegisterPendingPurchaseDto,
  ): Promise<PantryItem> {
    const entity = Pantry.from({
      id: "",
      ingredientId: data.ingredientId,
      pendingPurchaseQuantity: data.pendingPurchaseQuantity,
      userId: data.userId,
      measurementType: "",
      measurementValue: 0,
    });

    const [result] = await this.pantryRepository.update(entity);
    await this.invalidatePantryCache();
    return result.toPlain();
  }

  async registerRecipeAsCooked(
    data: RegisterPantryItemsCooked[],
  ): Promise<PantryItem> {
    const pantryItemIds = data.map((item) => item.ingredientId).filter(Boolean);

    const currentEntities = await this.pantryRepository.getAll({
      ingredientIds: pantryItemIds,
    });

    const deductions: ConfirmCook[] = data.map((item) => ({
      ingredientId: item.ingredientId,
      measurementValue: item.measurementValue,
      measurementType: item.measurementType,
      userId: item.userId,
      recipeName: item.recipeName,
    }));

    const updated = PantryCollectionDomainService.applyDeductions(
      currentEntities,
      deductions,
      "used",
    );

    const [result] = await this.pantryRepository.update(updated);
    await this.invalidatePantryCache();
    return result.toPlain();
  }

  getPantryTransactions(
    filter?: PantryTransactionsFilter,
  ): Promise<PantryIngredientMeasurement[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PANTRY.TRANSACTIONS(filter),
      CacheKeys.PANTRY.TRANSACTIONS_PREFIX,
      () => this.pantryRepository.getPantryTransactions(filter),
      CacheTTL.SHORT,
    );
  }

  async updatePantryItemsOnPurchase(
    data: UpdatePantryOnPurchase[],
  ): Promise<void> {
    const entities = data.map((item) => {
      const entity = Pantry.from({
        id: "",
        ingredientId: item.ingredientId,
        measurementValue: item.measurementValue,
        measurementType: item.measurementType,
        userId: item.userId,
        expirationDate: null,
      });
      entity.generateEvent("used", item.measurementValue, item.measurementType as any);
      return entity;
    });

    await this.pantryRepository.update(entities);
    await this.invalidatePantryCache();
  }

  async updatePantryItem(
    data: Partial<PantryItem> & { ingredientId: string; userId: string },
  ): Promise<PantryItem> {
    const pantry = await this.getPantryById(data.ingredientId);
    const { userId, ingredientId, ...rest } = data;
    const entity = Pantry.from({
      ...pantry,
      ...rest,
    });
    const eventAmount =
      (data.measurementValue ?? pantry.measurementValue) -
      pantry.measurementValue;
    entity.generateEvent("update", eventAmount);
    const [result] = await this.pantryRepository.update(entity);
    await this.invalidatePantryCache();
    return result.toPlain();
  }

  async deletePantryItem(itemId: string, userId: string): Promise<PantryItem> {
    const result = await this.pantryRepository.delete(itemId, userId);
    await this.invalidatePantryCache();
    return result.toPlain();
  }

  async createPantryMeasurementRecord(
    data: PantryIngredientMeasurement[],
  ): Promise<PantryIngredientMeasurement[]> {
    const result = await this.pantryRepository.createPantryEvent(data);
    await this.redisCacheService.invalidatePrefix(
      CacheKeys.PANTRY.TRANSACTIONS_PREFIX,
    );
    return result;
  }

  async getPantryById(id: string): Promise<PantryItem> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PANTRY.BY_ID(id),
      CacheKeys.PANTRY.ITEM_PREFIX,
      async () => {
        const entity = await this.pantryRepository.getById(id);
        return entity.toPlain();
      },
      CacheTTL.MEDIUM,
    );
  }

  // async getLowAndOutStockPantryItems(userId: string): Promise<any[]> {
  //   const results = await this.pantryRepository.getAll({ userId });

  //   return results.reduce((purchaseItems: any[], item: PantryItem) => {
  //     purchaseItems.push({
  //       ...item,
  //       ...this._hasPurchaseAlertCondition(item),
  //     });
  //     return purchaseItems;
  //   }, []);
  // }u

  async getPurchaceOrderItems(userId: string): Promise<any[]> {
    return this.redisCacheService.getOrSet(
      CacheKeys.PANTRY.PURCHASE_ORDER(userId),
      CacheKeys.PANTRY.PURCHASE_ORDER_PREFIX,
      async () => {
        const results =
          await this.pantryRepository.getPurchaceOrderItems(userId);

        return results.reduce((purchaseItems: any[], item: any) => {
          const {
            id,
            ingredientName,
            category,
            measurementValue = 0,
            measurementType,
            purchaseQuantity = 0,
            lowValueAlert,
            isRecurrent,
            recurrentAmount = 0,
            recipeIngredients = [],
            expirationDate,
            conversions,
          } = item;

          // Create entity to delegate stock / expiration / conversion checks
          const entity = Pantry.from({
            id,
            userId,
            ingredientId: id,
            measurementValue,
            measurementType,
            lowValueAlert,
            expirationDate,
            isRecurrent,
            recurrentAmount,
            pendingPurchaseQuantity: purchaseQuantity,
            conversions,
          });

          const lowIngredients = recipeIngredients.reduce(
            (acc: any[], ri: any) => {
              if (!ri.id) return acc;

              const { value, success } = entity.convertBetween(
                measurementValue,
                measurementType,
                ri.measurementType,
              );

              const availableInRecipeUnits =
                success && value != null ? value : measurementValue;
              const missingValue = Math.max(
                ri.requiredValue - availableInRecipeUnits,
                0,
              );

              if (missingValue > 0) {
                acc.push({
                  ...ri,
                  availableInRecipeUnits,
                  missingValue,
                  isSuccesConvertion: success,
                  errorConvertion: success ? null : "Conversión no disponible",
                });
              }

              return acc;
            },
            [],
          );

          const hasLowIngredients = lowIngredients.length > 0;

          if (
            !hasLowIngredients &&
            !entity.isRecurrentItem &&
            !entity.hasPendingPurchase() &&
            !entity.isLowStock() &&
            !entity.isOutOfStock() &&
            !entity.isExpiring()
          ) {
            return purchaseItems;
          }

          let recommendedAmountToBuy = 0;
          let amountToBuyMeasurementType = measurementType;

          if (hasLowIngredients) {
            const maxMissing = lowIngredients.reduce((max: any, curr: any) =>
              curr.missingValue > max.missingValue ? curr : max,
            );

            if (
              !entity.hasPendingPurchase() ||
              maxMissing.missingValue > purchaseQuantity
            ) {
              recommendedAmountToBuy = maxMissing.missingValue;
              amountToBuyMeasurementType = maxMissing.measurementType;
            }
          }

          purchaseItems.push({
            id,
            ingredientName,
            isRecurrent: entity.isRecurrentItem,
            category,
            recurrentAmount: entity.recurrentAmount,
            measurementValue: entity.measurementValue,
            measurementType: entity.measurementType,
            pendingPurchaseQuantity: entity.pendingPurchaseQuantity,
            lowValueAlert: entity.lowValueAlert,
            isLowStock: entity.isLowStock(),
            isOutStock: entity.isOutOfStock(),
            recommendedAmountToBuy,
            amountToBuyMeasurementType,
            recipeDetails: lowIngredients,
            isExpiring: entity.isExpiring(),
            remainingDaysExpire: entity.getRemainingDaysExpire(),
          });

          return purchaseItems;
        }, []);
      },
      CacheTTL.MEDIUM,
    );
  }

  private buildPantryItems(input: PantryDto | PantryDto[]): PantryItem[] {
    const dataArray = Array.isArray(input) ? input : [input];
    return dataArray.map((item: PantryDto) => ({
      id: uuidv4(),
      userId: item.userId,
      isRecurrent: item.isRecurrent,
      recurrentAmount: item.measurementValue ?? 0,
      measurementValue: item.measurementValue ?? 0,
      expirationDate: item.expirationDate,
      measurementType: item.measurementType,
      ingredientId: item?.ingredientId,
    }));
  }

  async getUserPantry(userId: string): Promise<PantryItemResponse[]> {
    if (!userId) return [];
    return this.redisCacheService.getOrSet(
      CacheKeys.PANTRY.BY_USER(userId),
      CacheKeys.PANTRY.PREFIX,
      async () => {
        const entities = await this.pantryRepository.getAll({ userId });
        return entities.map((entity) => entity.toResponse());
      },
      CacheTTL.MEDIUM,
    );
  }

  async createPantryItems(
    data: PantryDto | PantryDto[],
  ): Promise<PantryItem[]> {
    const items = isArray(data) ? data : [data];
    const entities: Pantry[] = items.map((item) =>
      Pantry.from({
        ...item,
        id: uuidv4(),
        recurrentAmount: item?.isRecurrent ? item.measurementValue : 0,
      } as PantryItem),
    );

    const result = await this.pantryRepository.create(entities);
    await this.redisCacheService.invalidatePrefix(CacheKeys.PANTRY.PREFIX);
    return result.map((e) => e.toPlain());
  }

  async registerPurchasedItems(data: PantryDto[]): Promise<PantryItem[]> {
    const entities: Pantry[] = data.map((item) =>
      Pantry.from({
        ...item,
        id: uuidv4(),
        recurrentAmount: item?.isRecurrent ? item.measurementValue : 0,
      } as PantryItem),
    );

    const result = await this.pantryRepository.create(entities);
    await this.invalidatePantryCache();
    return result.map((e) => e.toPlain());
  }

  private normalizeString(str: string): string {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  private areNamesEquivalent(nameInDB: string, nameNew: string): boolean {
    return this.normalizeString(nameInDB) === this.normalizeString(nameNew);
  }

  // ─── Cache Helpers ─────────────────────────────────────────────────

  private async invalidatePantryCache(): Promise<void> {
    await Promise.all([
      this.redisCacheService.invalidatePrefix(CacheKeys.PANTRY.PREFIX),
      this.redisCacheService.invalidatePrefix(CacheKeys.PANTRY.ITEM_PREFIX),
      this.redisCacheService.invalidatePrefix(
        CacheKeys.PANTRY.TRANSACTIONS_PREFIX,
      ),
      this.redisCacheService.invalidatePrefix(
        CacheKeys.PANTRY.PURCHASE_ORDER_PREFIX,
      ),
    ]);
  }
}
