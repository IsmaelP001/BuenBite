import { Inject, Injectable } from "@nestjs/common";
import { PantryItem } from "../../../domain/pantry.model";
import { IaScanIngredientsDto } from "../../dto";
import { PantryService } from "../../services/interfaces/pantry";

@Injectable()
export class UpdatePantryItemsScannedByIaUseCase {
  constructor(
    @Inject("PantryService")
    private pantryService: PantryService,
  ) {}

  async execute(dto: IaScanIngredientsDto): Promise<PantryItem[]> {
    const pantryItems = await this.pantryService.getUserPantry(dto.userId);
    return this.pantryService.syncPantryItems(
      pantryItems,
      dto.items.map((item) => ({ ...item, userId: dto.userId })),
      "scanIa",
    );
  }
}
