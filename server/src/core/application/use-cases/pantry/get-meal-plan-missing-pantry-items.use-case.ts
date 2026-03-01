import { Inject, Injectable } from "@nestjs/common";
import { GetMealplanRecipeItemsDto } from "../../dto";
import { MealplanService } from "../../services/interfaces/mealplan";
import { PantryService } from "../../services/interfaces/pantry";

@Injectable()
export class GetMealPlanMissingPantryItemsUseCase {
  constructor(
    @Inject("PantryService")
    private pantryService: PantryService,
    @Inject("MealplanFacade")
    private mealplanService: MealplanService,
  ) {}

  async execute(dto: GetMealplanRecipeItemsDto): Promise<any[]> {
    const pantryItems = await this.pantryService.getUserPantry(dto.userId);
    const ingredients = await this.mealplanService.getMealPlanRecipeItems(dto);

    const data = await this.pantryService.getMealPlanMisingPantryItems({
      pantryItems,
      ingredients,
      userId: dto.userId,
    });

    return data;
  }
}
