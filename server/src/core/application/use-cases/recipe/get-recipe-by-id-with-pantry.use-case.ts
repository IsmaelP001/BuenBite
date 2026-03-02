import { Inject, Injectable } from "@nestjs/common";
import { RecipesWithAnalysis } from "../../../domain/recipe.model";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";

@Injectable()
export class GetRecipeByIdWithPantryUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
  ) {}

  async execute(
    userId: string,
    recipeId: string,
  ): Promise<RecipesWithAnalysis> {
    const pantryItems = await this.pantryService.getUserPantry(userId);
    const recipe = await this.recipeService.getRecipeById(recipeId);
    const ingredients = this.pantryService.analyzeIngredientsByPantryItems({
      pantryItems,
      recipeIngredients: recipe.ingredients!,
    });

    return {
      ...recipe,
      ...ingredients,
    };
  }
}
