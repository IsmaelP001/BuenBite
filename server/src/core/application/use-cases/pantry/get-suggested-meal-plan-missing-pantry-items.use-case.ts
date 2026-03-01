import { Inject, Injectable } from "@nestjs/common";
import { getSuggestedMealIngredients } from "../../../domain/mealplan";
import { IngredientsAnalysisResult } from "../../../domain/pantry.model";
import { GetSuggestedMealplanMissingPantryItems } from "../../dto";
import { MealplanService } from "../../services/interfaces/mealplan";
import { PantryService } from "../../services/interfaces/pantry";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class GetSuggestedMealPlanMissingPantryItemsUseCase {
  constructor(
    @Inject("PantryService")
    private pantryService: PantryService,
    @Inject("MealplanFacade")
    private mealplanService: MealplanService,
    @Inject("UserService")
    private userService: UserService,
  ) {}

  async execute(
    dto: GetSuggestedMealplanMissingPantryItems,
  ): Promise<IngredientsAnalysisResult<getSuggestedMealIngredients>> {
    const [pantryItems, ingredients] = await Promise.all([
      this.pantryService.getUserPantry(dto.userId),
      this.mealplanService.getSuggestedMealIngredients(dto.suggestedMealplanId),
    ]);

    let userPreferences = null;

    if (dto.userId) {
      userPreferences = await this.userService.getUserPreferences(dto.userId);
    }

    return this.pantryService.analyzeIngredientsByPantryItems({
      pantryItems,
      recipeIngredients: ingredients,
      targetServings: userPreferences?.servings ?? 1,
    });
  }
}
