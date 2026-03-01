import { Inject, Injectable, Logger } from "@nestjs/common";
import { PantryItem } from "../../../domain/pantry.model";
import { GamificationAction, GamificationEvent } from "../../../domain/gamification.model";
import { PantryDto, UserUnregisterPantryItem } from "../../dto";
import { IngredientService } from "../../services/interfaces/ingredient";
import { PantryService } from "../../services/interfaces/pantry";
import { GamificationService } from "../../services/interfaces/gamification";

@Injectable()
export class AddUnregisteredIngredientUseCase {
  private readonly logger = new Logger(AddUnregisteredIngredientUseCase.name);

  constructor(
    @Inject("IngredientService")
    private ingredientService: IngredientService,
    @Inject("PantryService")
    private pantryService: PantryService,
    @Inject("GamificationService")
    private gamificationService: GamificationService,
  ) {}

  async execute(dto: UserUnregisterPantryItem): Promise<PantryItem> {
    const [ingredient] = await this.ingredientService.createIngredient({
      name_en: dto.name,
      name_es: dto.name,
      name_fr: dto.name,
      category: dto.category,
    });

    const pantryItem: PantryDto = {
      userId: dto.userId,
      ingredientId: ingredient.id,
      measurementType: dto.measurementType,
      measurementValue: dto.measurementValue,
    };

    const [result] = await this.pantryService.createPantryItems(pantryItem);

    await this.emitGamificationEvent({
      userId: dto.userId,
      action: GamificationAction.PANTRY_ITEM_ADDED,
      referenceId: ingredient.id,
      referenceType: "pantry",
      metadata: { ingredientName: dto.name },
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
