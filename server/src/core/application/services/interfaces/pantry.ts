import { getSuggestedMealIngredients } from "../../../domain/mealplan";
import {
  AnalizeMultipleRecipeAvailabilityInPantry,
  BaseIngredientForAnalysis,
  IngredientsAnalysisResult,
  MissingPantryItemResult,
  PantryIngredientMeasurement,
  PantryItem,
  PantryItemResponse,
  PantryMeasurementTransactionType,
  PantryTransactionsFilter,
  RegisterPantryItemsCooked,
  UpdatePantryOnPurchase,
} from "../../../domain/pantry.model";
import {
  AnalizeMultipleRecipesByPantryDto,
  AnalyzeIngredientsDto,
  GetMealplanRecipeItemsDto,
  GetSuggestedMealplanMissingPantryItems,
  IaScanIngredientsDto,
  MealPlanMissingIngredientsDto,
  PantryDto,
  RegisterPendingPurchaseDto,
  UpdatePantryDto,
  UserUnregisterPantryItem,
} from "../../dto";

export interface PantryService {
  getUserPantry(userId: string): Promise<PantryItemResponse[]>;
  getPantryById(id: string): Promise<PantryItem>;
  deletePantryItem(itemId: string, userId: string): Promise<PantryItem>;
  createPantryItems(data: PantryDto | PantryDto[]): Promise<PantryItem[]>;
  updatePantryItem(data: Partial<PantryItem> & { ingredientId: string; userId: string }): Promise<PantryItem>;
  registerRecipeAsCooked(
    data: RegisterPantryItemsCooked[]
  ): Promise<PantryItem>;
  updatePantryItemsOnPurchase(data: UpdatePantryOnPurchase[]): Promise<void>;
  registerPendingPurchase(
    data: RegisterPendingPurchaseDto
  ): Promise<PantryItem>;
  createPantryMeasurementRecord(
    data: PantryIngredientMeasurement | PantryIngredientMeasurement[]
  ): Promise<PantryIngredientMeasurement[]>;
  getPantryTransactions(
    filter?: PantryTransactionsFilter
  ): Promise<PantryIngredientMeasurement[]>;
  updatePantryItemsOnPurchase(data: UpdatePantryOnPurchase[]): Promise<void>;
  findOrCreatePantryItemsFromRecipes(data: PantryDto[]): Promise<PantryItem[]>;
  getMealPlanMisingPantryItems(
    data: MealPlanMissingIngredientsDto
  ): Promise<MissingPantryItemResult[]>;
  registerPurchasedItems(data: PantryDto[]): Promise<PantryItem[]>;
  createPantryItemsFromSource(
    currentPantryItems: PantryItem[],
    dto: PantryDto[],
    source: PantryMeasurementTransactionType
  ): Promise<PantryItem[]>;
  syncPantryItems(
    currentPantryItems: PantryItem[],
    dto: PantryDto[],
    source: PantryMeasurementTransactionType
  ): Promise<PantryItem[]>;
  analyzeMultipleRecipesIngredientsAvailabilityInPantry(
    dto: AnalizeMultipleRecipesByPantryDto
  ): Promise<AnalizeMultipleRecipeAvailabilityInPantry[]>;
  analyzeIngredientsByPantryItems<T extends BaseIngredientForAnalysis>(
    dto: AnalyzeIngredientsDto<T>
  ): IngredientsAnalysisResult<T>;
}

export interface PantryFacade {
  getPantryTransactions(
    filter?: PantryTransactionsFilter
  ): Promise<PantryIngredientMeasurement[]>;
  addUnregisteredIngredient(dto: UserUnregisterPantryItem): Promise<PantryItem>;
  getSuggestedMealPlanMissingPantryItems(
    dto: GetSuggestedMealplanMissingPantryItems
  ): Promise<IngredientsAnalysisResult<getSuggestedMealIngredients>>;
  updatePantryItem(data: UpdatePantryDto): Promise<PantryItem>;
  deletePantryItem(itemId: string, userId: string): Promise<PantryItem>;
  registerRecipeAsCooked(
    data: RegisterPantryItemsCooked[]
  ): Promise<PantryItem>;
  updatePantryItem(data: UpdatePantryDto): Promise<PantryItem>;
  getPantryById(id: string): Promise<PantryItem>;
  getMealPlanMissingPantryItems(dto: GetMealplanRecipeItemsDto): Promise<any[]>;
  getUserPantry(userId: string): Promise<PantryItemResponse[]>;
  createPantryItem(data: PantryDto | PantryDto[]): Promise<PantryItem[]>;
  findOrCreatePantryItemsFromRecipes(data: PantryDto[]): Promise<PantryItem[]>;
  registerPendingPurchase(
    data: RegisterPendingPurchaseDto
  ): Promise<PantryItem>;
  registerScannedPantryItems(dto: IaScanIngredientsDto): Promise<PantryItem[]>;
}
