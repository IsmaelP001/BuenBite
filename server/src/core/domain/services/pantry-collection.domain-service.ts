import {
  ConfirmCook,
  PantryIngredientMeasurement,
  Pantry,
  PantryMeasurementTransactionType,
} from "../pantry.model";

/**
 * Domain Service — PantryCollectionDomainService
 *
 * Coordinates operations across multiple Pantry instances.
 * Replaces the old `Pantry` aggregate class by delegating per-item logic
 * to each entity and orchestrating collection-level workflows here.
 *
 * Pure / stateless — all methods are static.
 */
export class PantryCollectionDomainService {
  private static readonly EVENT_TYPES_WITH_EVENTS: PantryMeasurementTransactionType[] =
    ["created", "update", "pendingForPurchase", "purchased", "scanIa"];

  // ─── Event Generation ──────────────────────────────────────────────

  /**
   * Generates measurement events for a collection of entities.
   * Only items with a valid measurementType and measurementValue > 0 produce events.
   */
  static generateEvents(
    entities: Pantry[],
    transactionType: PantryMeasurementTransactionType,
  ): PantryIngredientMeasurement[] {
    if (!this.EVENT_TYPES_WITH_EVENTS.includes(transactionType)) return [];

    const events: PantryIngredientMeasurement[] = [];

    for (const entity of entities) {
      if (!entity.measurementType || !entity.measurementValue) continue;

      events.push(entity.generateEvent(transactionType));

      // When purchased, if there's a pending purchase quantity that has been
      // fulfilled, generate an additional pending-purchase-completed event.
      if (
        transactionType === "purchased" &&
        entity.pendingPurchaseQuantity > 0 &&
        entity.measurementValue >= entity.pendingPurchaseQuantity
      ) {
        events.push(entity.generateEvent("purchased", entity.pendingPurchaseQuantity));
      }
    }

    return events;
  }

  // ─── Cook / Deduction ──────────────────────────────────────────────

  /**
   * Applies cook/usage deductions to matching entities.
   *
   * Returns the full set of entities (updated where matched) plus
   * all generated measurement events.
   */
  static applyDeductions(
    entities: Pantry[],
    deductions: ConfirmCook[],
    transactionType: PantryMeasurementTransactionType,
  ): Pantry[] {
    const entityMap = new Map<string, Pantry>();
    entities.forEach((e) => entityMap.set(e.ingredientId, e));

    for (const cook of deductions) {
      const entity = entityMap.get(cook.ingredientId);
      if (!entity) continue;

      const updated = entity.applyDeduction(cook, transactionType);
      entityMap.set(cook.ingredientId, updated);
    }

    return Array.from(entityMap.values());
  }

  // ─── Helpers ───────────────────────────────────────────────────────

  /**
   * Builds a Map of entities keyed by ingredientId for fast lookups.
   */
  static toMap(
    entities: Pantry[],
  ): Map<string, Pantry> {
    const map = new Map<string, Pantry>();
    entities.forEach((e) => map.set(e.ingredientId, e));
    return map;
  }
}
