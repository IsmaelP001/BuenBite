import { Inject, Injectable, Logger } from "@nestjs/common";
import { PantryItem } from "../../../domain/pantry.model";
import { GamificationAction, GamificationEvent } from "../../../domain/gamification.model";
import { IaScanIngredientsDto, IngredientDto, PantryDto } from "../../dto";
import { IngredientService } from "../../services/interfaces/ingredient";
import { PantryService } from "../../services/interfaces/pantry";
import { GamificationService } from "../../services/interfaces/gamification";

@Injectable()
export class RegisterScannedPantryItemsUseCase {
  private readonly logger = new Logger(RegisterScannedPantryItemsUseCase.name);

  constructor(
    @Inject("IngredientService")
    private ingredientService: IngredientService,
    @Inject("PantryService")
    private pantryService: PantryService,
    @Inject("GamificationService")
    private gamificationService: GamificationService,
  ) {}

  async execute(dto: IaScanIngredientsDto): Promise<PantryItem[]> {
    const unregisteredIngredients: IngredientDto[] = dto.items
      .filter((item) => !item.ingredientId)
      .map((item) => ({
        name_en: item.name,
        name_es: item.name,
        name_fr: item.name,
        category: item.category,
      }));

    const pantryItems = await this.pantryService.getUserPantry(dto.userId);

    const newIngredientMap = new Map<string, string>();
    if (unregisteredIngredients.length > 0) {
      const newIngredients = await this.ingredientService.createIngredient(
        unregisteredIngredients,
      );
      newIngredients.forEach((ingredient, index) => {
        const originalName = unregisteredIngredients[index].name_en;
        newIngredientMap.set(originalName, ingredient.id);
      });
    }

    const pantryItemsToCreate: PantryDto[] = dto.items.map((item) => {
      return {
        ...item,
        ingredientId: item.ingredientId || newIngredientMap.get(item.name)!,
        userId: dto.userId,
      };
    });

    const result = await this.pantryService.createPantryItemsFromSource(
      pantryItems,
      pantryItemsToCreate,
      "scanIa",
    );

    for (const item of pantryItemsToCreate) {
      await this.emitGamificationEvent({
        userId: dto.userId,
        action: GamificationAction.PANTRY_ITEM_ADDED,
        referenceId: item.ingredientId,
        referenceType: "pantry",
        metadata: {},
        timestamp: new Date(),
      });
    }

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
