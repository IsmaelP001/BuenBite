import { ValidationError } from "../../errors/customErrors";
import {
  Conversions,
  ConversionResult,
  IngredientUnitConverter,
} from "../../utils/unitConverterV2";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

// ─── Raw Data Interfaces ─────────────────────────────────────────────

export interface PantryItem {
  id: string;
  userId: string;
  ingredientId: string;
  isDeleted?: boolean;
  expirationDate?: string | null;
  isRecurrent?: boolean;
  recurrentAmount?: number;
  brand?: string | null;
  measurementType: string;
  pendingPurchaseQuantity?: number;
  measurementValue: number;
  lowValueAlert?: number;
  conversions?: Conversions;
  updatedAt?: Date | string;
}

export interface MissingMealplanIngredient extends PantryItem {
  isSuccessConvertion: boolean;
  totalRequiredQuantity: number;
  originalPantryQuantity?: number;
  pantryMeasurementType?: string;
  isInPantry: boolean;
  recipes: string[];
}

export interface AnalizeMultipleRecipeAvailabilityInPantry {
  recipeId: string;
  analysis: IngredientsAnalysisResult<any>;
}

export interface MissingPantryItemResult extends PantryItem {
  isErrorConvertingConvertion?: boolean;
  include: boolean;
  isLowStock: boolean;
  isOutStock: boolean;
  isExpiring: boolean;
  remainingDaysExpire: number | null;
  hasPurchaseQuantity: boolean;
  isRecurrent: boolean;
  recipes: string[];
}

// ─── Ingredient metadata (from repo JOIN) ────────────────────────────

export interface IngredientMeta {
  name?: { es: string; en: string; fr: string };
  category?: string;
  image?: string;
}

// ─── What the repository getAll() actually returns (PantryItem + join) ─

export interface PantryItemWithIngredient extends PantryItem {
  name: { es: string; en: string; fr: string };
  category: string;
  image?: string;
  nutricionalValues?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

// ─── API response shape (enriched with domain logic) ─────────────────

export interface PantryItemResponse {
  id: string;
  userId: string;
  ingredientId: string;
  expirationDate: string | null;
  isRecurrent: boolean;
  recurrentAmount: number;
  brand: string | null;
  measurementType: string;
  pendingPurchaseQuantity: number;
  measurementValue: number;
  lowValueAlert?: number;
  updatedAt: string;
  name: {
    es: string;
    en: string;
    fr: string;
  };
  category: string;
  include: boolean;
  isLowStock: boolean;
  isOutStock: boolean;
  isExpiring: boolean;
  requiredQuantity?: number;
  remainingDaysExpire: number | null;
  hasPurchaseQuantity: boolean;
  conversions?: Conversions;
}

export interface PantryAlertConditions {
  include: boolean;
  isLowStock: boolean;
  isOutStock: boolean;
  isExpiring: boolean;
  remainingDaysExpire: number | null;
  hasPurchaseQuantity: boolean;
  isRecurrent?: boolean;
  requiredQuantity?: number;
}

// ─── Entity Construction Options ─────────────────────────────────────

export interface PantryOptions {
  ingredientMeta?: IngredientMeta;
  lowStockLimit?: number;
  requiredQuantity?: number;
}

/**
 * Domain Entity – Pantry (unified)
 *
 * Single rich entity that encapsulates ALL pantry-item business logic:
 *   • Stock analysis (low stock, out of stock)
 *   • Expiration checks (expiring, expired, remaining days)
 *   • Unit conversion (convert to, resolve incoming, deduct, get available in)
 *   • Purchase / alert conditions
 *   • Serialization to API response
 *
 * The repository returns raw data (`PantryItem` or `PantryItemWithIngredient`),
 * which is wrapped here. Services should create entities and delegate logic to them.
 */
export class Pantry {
  private static readonly EXPIRING_THRESHOLD_DAYS = 7;
  private static readonly DEFAULT_LOW_STOCK_LIMIT = 5;

  private readonly _data: PantryItem;
  private readonly _meta: IngredientMeta | undefined;
  private readonly _lowStockLimit: number;
  private readonly _requiredQuantity: number;
  private event:PantryIngredientMeasurement| undefined

  constructor(data: PantryItem, options: PantryOptions = {}) {
    this._data = data;
    this._meta = options.ingredientMeta;
    this._lowStockLimit =
      options.lowStockLimit ?? Pantry.DEFAULT_LOW_STOCK_LIMIT;
    this._requiredQuantity = options.requiredQuantity ?? 0;
  }

  // ─── Accessors ───────────────────────────────────────────────────────

  get id(): string { return this._data.id; }
  get userId(): string { return this._data.userId; }
  get ingredientId(): string { return this._data.ingredientId; }
  get measurementValue(): number { return this._data.measurementValue ?? 0; }
  get measurementType(): string { return this._data.measurementType; }
  get conversions(): Conversions | undefined { return this._data.conversions; }
  get expirationDate(): string | null | undefined { return this._data.expirationDate; }
  get pendingPurchaseQuantity(): number { return this._data.pendingPurchaseQuantity ?? 0; }
  get brand(): string | null | undefined { return this._data.brand; }
  get updatedAt(): Date | string | undefined { return this._data.updatedAt; }
  get lowValueAlert(): number | undefined { return this._data.lowValueAlert; }
  get isRecurrent(): boolean | undefined { return this._data.isRecurrent; }
  get isRecurrentItem(): boolean { return !!this._data.isRecurrent; }
  get recurrentAmount(): number { return this._data.recurrentAmount ?? 0; }
  get name(): IngredientMeta["name"] { return this._meta?.name; }
  get category(): string | undefined { return this._meta?.category; }

  /** Raw underlying PantryItem data. */
  get data(): PantryItem { return this._data; }

  // ─── Stock Analysis ──────────────────────────────────────────────────

  /**
   * Determines low-stock status.
   * Uses the item's own `lowValueAlert` (direct unit comparison) when available,
   * otherwise converts to grams and compares against the configured limit.
   */
  isLowStock(): boolean {
    // Item-level threshold (same measurement unit)
    if (this._data.lowValueAlert != null && this._data.lowValueAlert > 0) {
      return this.measurementValue <= this._data.lowValueAlert;
    }
    // Grams-based threshold (configurable)
    if (this._lowStockLimit <= 0 || !this.measurementType || !this.measurementValue) {
      return false;
    }
    const { value, success } = IngredientUnitConverter.convert(
      this.measurementValue, this.measurementType, "grams", this.conversions,
    );
    return success && value != null ? value < this._lowStockLimit : false;
  }

  isOutOfStock(): boolean {
    return this.measurementValue <= 0;
  }

  // ─── Expiration ──────────────────────────────────────────────────────

  isExpiring(): boolean {
    return this._getExpirationInfo().isExpiring;
  }

  isExpired(): boolean {
    const remaining = this.getRemainingDaysExpire();
    return remaining !== null && remaining <= 0;
  }

  getRemainingDaysExpire(): number | null {
    return this._getExpirationInfo().remainingDaysExpire;
  }

  // ─── Purchase / Required ─────────────────────────────────────────────

  hasPendingPurchase(): boolean {
    return this.pendingPurchaseQuantity > 0;
  }

  getActualRequiredQuantity(): number {
    return Math.max(this._requiredQuantity - this.measurementValue, 0);
  }

  isRequired(): boolean {
    return this.getActualRequiredQuantity() > 0;
  }

  // ─── Alert Conditions ────────────────────────────────────────────────

  shouldIncludeInAlerts(): boolean {
    return (
      this.isRecurrentItem ||
      this.hasPendingPurchase() ||
      this.isLowStock() ||
      this.isOutOfStock() ||
      this.isExpiring() ||
      this.isRequired()
    );
  }

  getAlertConditions(): PantryAlertConditions {
    return {
      include: this.shouldIncludeInAlerts(),
      isLowStock: this.isLowStock(),
      isOutStock: this.isOutOfStock(),
      isExpiring: this.isExpiring(),
      remainingDaysExpire: this.getRemainingDaysExpire(),
      hasPurchaseQuantity: this.hasPendingPurchase(),
      isRecurrent: this.isRecurrentItem,
      requiredQuantity:
        this.getActualRequiredQuantity() + this.pendingPurchaseQuantity,
    };
  }

  // ─── Unit Conversion ─────────────────────────────────────────────────

  /**
   * Converts this item's current value to the specified target unit.
   */
  convertValueTo(targetUnit: string): ConversionResult {
    return IngredientUnitConverter.convert(
      this.measurementValue, this.measurementType, targetUnit, this.conversions,
    );
  }

  /**
   * Returns the item's available quantity expressed in `targetUnit`.
   * Falls back to the original value when conversion fails.
   */
  getAvailableIn(targetUnit: string): { value: number; success: boolean } {
    if (targetUnit === this.measurementType) {
      return { value: this.measurementValue, success: true };
    }
    const result = this.convertValueTo(targetUnit);
    return {
      value: result.success && result.value != null ? result.value : this.measurementValue,
      success: result.success,
    };
  }

  /**
   * Resolves an incoming value (possibly in a different unit) to this item's unit.
   * Useful when creating / updating a pantry item from a source with a different unit.
   */
  resolveIncomingUnit(
    incomingValue: number,
    incomingUnit: string,
  ): { value: number; unit: string; success: boolean } {
    if (incomingUnit === this.measurementType) {
      return { value: incomingValue, unit: this.measurementType, success: true };
    }
    const result = IngredientUnitConverter.convert(
      incomingValue, incomingUnit, this.measurementType, this.conversions,
    );
    return {
      value: result.success && result.value != null ? result.value : incomingValue,
      unit: this.measurementType,
      success: result.success,
    };
  }

  /**
   * Calculates remaining quantity after deducting usage.
   * Converts units automatically when they differ.
   */
  deductQuantity(
    usedValue: number,
    usedUnit: string,
  ): { remaining: number; deducted: number; success: boolean } {
    const resolved = this.resolveIncomingUnit(usedValue, usedUnit);
    const remaining = Number(
      Math.max(this.measurementValue - resolved.value, 0).toFixed(2),
    );
    return {
      remaining,
      deducted: Math.round(resolved.value),
      success: resolved.success,
    };
  }

  /**
   * Converts an external value from one unit to another using this item's conversions.
   * Useful when the pantry item holds the ingredient-level conversion metadata.
   */
  convertBetween(
    value: number,
    fromUnit: string,
    toUnit: string,
  ): ConversionResult {
    return IngredientUnitConverter.convert(
      value, fromUnit, toUnit, this.conversions,
    );
  }

  // ─── Event Generation ─────────────────────────────────────────────

  /**
   * Generates a measurement event for this pantry item.
   * Encapsulates the event creation logic that was previously in the Pantry aggregate.
   */
  generateEvent(
    transactionType: PantryMeasurementTransactionType,
    overrideValue?: number,
    overrideType?:PantryIngredientMeasurement,
    recipeName?: string,
  ): PantryIngredientMeasurement {
    this.event= {
      id: crypto.randomUUID(),
      ingredientId: this.ingredientId,
      transactionType,
      measurementValue: overrideValue ?? this.measurementValue,
      measurementType: overrideType ?? this.measurementType as any,
      recipeName,
      createdAt: new Date(),
      userId: this.userId,
    };
    return this.event;
  }

  getEvent(){
    return this.event
  }
  /**
   * Applies a cook/usage deduction to this item:
   *  - converts units if needed
   *  - reduces quantity (floor 0)
   *  - returns the updated entity (immutable) + the measurement event
   */
  applyDeduction(
    cook: ConfirmCook,
    transactionType: PantryMeasurementTransactionType,
  ): Pantry {
    if (!this.measurementType) {
      throw ValidationError.quantityNotRegistered(
        "measurementValue",
        this.measurementValue,
      );
    }

    const { remaining, deducted } = this.deductQuantity(
      cook.measurementValue,
      cook.measurementType,
    );

    const updatedEntity = this.withUpdatedValue(remaining);
    updatedEntity.generateEvent(
      transactionType,
      deducted,
      this.measurementType as any,
      cook.recipeName,
    );

    return updatedEntity;
  }

  /**
   * Returns a new entity with an updated measurementValue (immutable pattern).
   */
  withUpdatedValue(newValue: number): Pantry {
    return new Pantry(
      { ...this._data, measurementValue: newValue },
      {
        ingredientMeta: this._meta,
        lowStockLimit: this._lowStockLimit,
        requiredQuantity: this._requiredQuantity,
      },
    );
  }

  // ─── Static Factories ────────────────────────────────────────────────

  /** Creates an entity from a raw PantryItem. */
  static from(
    item: PantryItem,
    options?: PantryOptions,
  ): Pantry {
    return new Pantry(item, options);
  }

  /** Creates an entity from a PantryItemWithIngredient (repo getAll result). */
  static fromResponse(
    item: PantryItemWithIngredient,
    options?: Partial<PantryOptions>,
  ): Pantry {
    return new Pantry(item, {
      ...options,
      ingredientMeta: {
        name: item.name,
        category: item.category,
        image: item.image,
      },
    });
  }

  /** Creates entities from an array of raw PantryItems. */
  static fromMany(
    items: PantryItem[],
    options?: PantryOptions,
  ): Pantry[] {
    return items.map((item) => Pantry.from(item, options));
  }

  /** Creates entities from an array of PantryItemWithIngredients. */
  static fromResponseMany(
    items: PantryItemWithIngredient[],
    options?: Partial<PantryOptions>,
  ): Pantry[] {
    return items.map((item) => Pantry.fromResponse(item, options));
  }

  /** Factory: entity with alert context (general pantry display). */
  static withAlerts(
    item: PantryItem,
    lowStockLimit = 100,
  ): Pantry {
    return new Pantry(item, { lowStockLimit });
  }

  /** Factory: entity for mealplan missing-items analysis. */
  static withRequired(
    item: PantryItem,
    requiredQuantity: number,
    lowStockLimit = 0,
  ): Pantry {
    return new Pantry(item, { lowStockLimit, requiredQuantity });
  }

  // ─── Serialization ───────────────────────────────────────────────────

  /** Produces the full API response shape: data + ingredient meta + alert conditions. */
  toResponse(): PantryItemResponse {
    const alerts = this.getAlertConditions();
    return {
      id: this._data.id,
      userId: this._data.userId,
      ingredientId: this._data.ingredientId,
      expirationDate: this._data.expirationDate ?? null,
      isRecurrent: this.isRecurrentItem,
      recurrentAmount: this.recurrentAmount,
      brand: this._data.brand ?? null,
      measurementType: this.measurementType,
      pendingPurchaseQuantity: this.pendingPurchaseQuantity,
      measurementValue: this.measurementValue,
      lowValueAlert: this._data.lowValueAlert,
      updatedAt: this._data.updatedAt instanceof Date
        ? this._data.updatedAt.toISOString()
        : (this._data.updatedAt ?? ""),
      name: this._meta?.name ?? { es: "", en: "", fr: "" },
      category: this._meta?.category ?? "",
      conversions: this.conversions,
      ...alerts,
    };
  }

  /** Returns a shallow copy of the raw PantryItem data. */
  toPlain(): PantryItem {
    return { ...this._data };
  }

  // ─── Static Helpers ──────────────────────────────────────────────────

  /** Compute expiration info from a date string (stateless helper). */
  static computeExpirationInfo(expirationDate?: string | null): {
    isExpiring: boolean;
    remainingDaysExpire: number | null;
  } {
    if (!expirationDate) {
      return { remainingDaysExpire: null, isExpiring: false };
    }
    const today = startOfDay(new Date());
    const expiration = startOfDay(parseISO(expirationDate));
    const daysDiff = differenceInDays(expiration, today);
    return {
      remainingDaysExpire: daysDiff,
      isExpiring:
        daysDiff <= Pantry.EXPIRING_THRESHOLD_DAYS && daysDiff > 0,
    };
  }

  // ─── Private ─────────────────────────────────────────────────────────

  private _getExpirationInfo(): {
    isExpiring: boolean;
    remainingDaysExpire: number | null;
  } {
    return Pantry.computeExpirationInfo(this._data.expirationDate);
  }
}

export interface NutricionalValues {
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
}

export interface GetPantryBy {
  id?: string;
  ids?: string[];
}

export interface UpdatePantryItem extends Partial<PantryItem> {
  ingredientId: string;
  userId: string;
}

export interface UpdatePantryOnPurchase {
  measurementValue: number;
  measurementType: string;
  ingredientId: string;
  userId: string;
}

export interface RegisterPantryItemsCooked {
  ingredientId: string;
  userId: string;
  recipeName: string;
  measurementValue: number;
  measurementType: string;
}

export interface RegisterPendingPurchase {
  pantryId: string;
  pendingPurchaseQuantity: number;
  measurementValue: number;
}

export type PantryMeasurementTransactionType =
  | "created"
  | "scanIa"
  | "purchased"
  | "update"
  | "pendingForPurchase"
  | "pendingPurchaseCompleted"
  | "purchaseOrderCreated"
  | "purchaseOrderCancelled"
  | "used";

export enum pantryMeasurementTransactionType {
  CREATED = "created",
  PURCHASED = "purchased",
  UPDATE = "update",
  PENDING_FOR_PURCHASE = "pendingForPurchase",
  PENDING_PURCHASE_COMPLETED = "pendingPurchaseCompleted",
  PURCHASE_ORDER_CREATED = "purchaseOrderCreated",
  PURCHASE_ORDER_CANCELLED = "purchaseOrderCancelled",
  USED = "used",
}

export interface PantryIngredientMeasurement {
  id?: string;
  userId: string;
  ingredientId: string;
  transactionType: PantryMeasurementTransactionType;
  recipeName?: string;
  measurementType: string;
  measurementValue: number;
  createdAt: Date;
}

export interface PantryFilter {
  userId?: string;
  includePantryMeasurements?: boolean;
  ids?: string[];
  ingredientIds?: string[];
  ingredientNames?: string[];
  includeNutricionalValues?: boolean;
}

export interface PantryTransactionsFilter {
  ingredientId: string;
  lastNDays?: number;
  limit?: number;
  page?: number;
}

export interface ConfirmCook {
  ingredientId: string;
  measurementValue: number;
  measurementType: string;
  userId: string;
  recipeName?: string;
}

// Interfaz genérica del DTO
export interface AnalyzeIngredientsDto<
  T extends BaseIngredientForAnalysis = BaseIngredientForAnalysis,
> {
  pantryItems: any[];
  recipeIngredients: T[];
}

// Interfaz para el resultado base que se añade a todos los ingredientes

// Tipo genérico que preserva el tipo original + análisis
export type AnalyzedIngredient<T> = T & BaseAnalysisData;
export interface BaseAnalysisData {
  pantryId: string | null;
  availabilityStatus:
    | "COMPLETE"
    | "PARTIAL"
    | "MISSING"
    | "NO_STOCK"
    | "UNSUCCESSFUL_CONVERSION"
    | "PANTRY_NOT_PROVIDED";
  isAvailableInPantry: boolean;
  originalPantryQuantity: number;
  availableInPantry: number;
  availableConvertedQuantity: number;
  missingAmount: number;
  pantryMeasurementType: string | null;
  isSuccessConvertion: boolean | null;
  errorConvertion: string | null;
}

export interface BaseIngredientForAnalysis {
  ingredientId: string;
  measurementValue: number;
  measurementType: string;
  conversions?: Conversions;
}
export interface IngredientsAnalysisResult<
  T extends BaseIngredientForAnalysis,
> {
  totalIngredients: number;
  totalInPantryIngredients: number;
  totalPartialIngredients: number;
  totalMissingIngredients: number;
  targetServingsCompletionPercentage?: number;
  totalNoStockIngredients: number;
  targetServings?: number;
  totalUnsuccessfulConversionIngredients: number;
  completionPercentage: number;
  ingredients: AnalyzedIngredient<T>[];
  unsuccessfulConversionIngredients: AnalyzedIngredient<T>[];
  completeIngredients: AnalyzedIngredient<T>[];
  partialIngredients: AnalyzedIngredient<T>[];
  noStockIngredients: AnalyzedIngredient<T>[];
  missingIngredients: AnalyzedIngredient<T>[];
  sufficientIngredients: AnalyzedIngredient<T>[];
  insufficientIngredients: AnalyzedIngredient<T>[];
}
