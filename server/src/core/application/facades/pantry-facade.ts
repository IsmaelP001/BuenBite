import { Inject, Injectable, Logger } from "@nestjs/common";
import { getSuggestedMealIngredients } from "../../domain/mealplan";
import { GamificationAction, GamificationEvent } from "../../domain/gamification.model";
import {
  IngredientsAnalysisResult,
  PantryIngredientMeasurement,
  PantryItem,
  PantryItemResponse,
  PantryTransactionsFilter,
  RegisterPantryItemsCooked,
} from "../../domain/pantry.model";
import {
  GetMealplanRecipeItemsDto,
  GetSuggestedMealplanMissingPantryItems,
  IaScanIngredientsDto,
  PantryDto,
  RegisterPendingPurchaseDto,
  UpdatePantryDto,
  UserUnregisterPantryItem,
} from "../dto";
import { PantryFacade, PantryService } from "../services/interfaces/pantry";
import { GamificationService } from "../services/interfaces/gamification";
import { AddUnregisteredIngredientUseCase } from "../use-cases/pantry/add-unregistered-ingredient.use-case";
import { GetMealPlanMissingPantryItemsUseCase } from "../use-cases/pantry/get-meal-plan-missing-pantry-items.use-case";
import { GetSuggestedMealPlanMissingPantryItemsUseCase } from "../use-cases/pantry/get-suggested-meal-plan-missing-pantry-items.use-case";
import { RegisterScannedPantryItemsUseCase } from "../use-cases/pantry/register-scanned-pantry-items.use-case";
import { UpdatePantryItemsScannedByIaUseCase } from "../use-cases/pantry/update-pantry-items-scanned-by-ia.use-case";
@Injectable()
export class PantryFacadeImpl implements PantryFacade {
  private readonly logger = new Logger(PantryFacadeImpl.name);

  constructor(
    @Inject("PantryService")
    private pantryService: PantryService,
    @Inject("GamificationService")
    private gamificationService: GamificationService,
    private addUnregisteredIngredientUseCase: AddUnregisteredIngredientUseCase,
    private updatePantryItemsScannedByIaUseCase: UpdatePantryItemsScannedByIaUseCase,
    private registerScannedPantryItemsUseCase: RegisterScannedPantryItemsUseCase,
    private getMealPlanMissingPantryItemsUseCase: GetMealPlanMissingPantryItemsUseCase,
    private getSuggestedMealPlanMissingPantryItemsUseCase: GetSuggestedMealPlanMissingPantryItemsUseCase,
  ) {}

  async addUnregisteredIngredient(
    dto: UserUnregisterPantryItem,
  ): Promise<PantryItem> {
    return this.addUnregisteredIngredientUseCase.execute(dto);
  }

  async updatePantryItemsScannedByIa(
    dto: IaScanIngredientsDto,
  ): Promise<PantryItem[]> {
    return this.updatePantryItemsScannedByIaUseCase.execute(dto);
  }

  registerRecipeAsCooked(
    data: RegisterPantryItemsCooked[],
  ): Promise<PantryItem> {
    return this.pantryService.registerRecipeAsCooked(data);
  }

  registerPendingPurchase(
    data: RegisterPendingPurchaseDto,
  ): Promise<PantryItem> {
    return this.pantryService.registerPendingPurchase(data);
  }

  async registerScannedPantryItems(
    dto: IaScanIngredientsDto,
  ): Promise<PantryItem[]> {
    return this.registerScannedPantryItemsUseCase.execute(dto);
  }

  getPantryTransactions(
    filter?: PantryTransactionsFilter,
  ): Promise<PantryIngredientMeasurement[]> {
    return this.pantryService.getPantryTransactions(filter);
  }

  updatePantryItem(data: UpdatePantryDto): Promise<PantryItem> {
    const item: Partial<PantryItem> = {
      updatedAt: new Date(),
      ...data,
    } as any;
    const result = this.pantryService.updatePantryItem(item as any);

    if (data.userId) {
      this.emitGamificationEvent({
        userId: data.userId,
        action: GamificationAction.PANTRY_ITEM_UPDATED,
        referenceId: data.ingredientId,
        referenceType: "pantry",
        metadata: {},
        timestamp: new Date(),
      });
    }

    return result;
  }

  deletePantryItem(itemId: string, userId: string): Promise<PantryItem> {
    return this.pantryService.deletePantryItem(itemId, userId);
  }

  async getPantryById(id: string): Promise<PantryItem> {
    return await this.pantryService.getPantryById(id);
  }

  async getMealPlanMissingPantryItems(
    dto: GetMealplanRecipeItemsDto,
  ): Promise<any[]> {
    return this.getMealPlanMissingPantryItemsUseCase.execute(dto);
  }

  async getSuggestedMealPlanMissingPantryItems(
    dto: GetSuggestedMealplanMissingPantryItems,
  ): Promise<IngredientsAnalysisResult<getSuggestedMealIngredients>> {
    return this.getSuggestedMealPlanMissingPantryItemsUseCase.execute(dto);
  }

  async getUserPantry(userId: string): Promise<PantryItemResponse[]> {
    return await this.pantryService.getUserPantry(userId);
  }

  async findOrCreatePantryItemsFromRecipes(data: PantryDto[]): Promise<PantryItem[]> {
    return await this.pantryService.findOrCreatePantryItemsFromRecipes(data);
  }

  async createPantryItem(dto: PantryDto): Promise<PantryItem[]> {
    const result = await this.pantryService.createPantryItems(dto);

    await this.emitGamificationEvent({
      userId: dto.userId,
      action: GamificationAction.PANTRY_ITEM_ADDED,
      referenceId: dto.ingredientId,
      referenceType: "pantry",
      metadata: {},
      timestamp: new Date(),
    });

    return result;
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
