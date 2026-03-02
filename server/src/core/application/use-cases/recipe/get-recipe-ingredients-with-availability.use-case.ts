import { Inject, Injectable } from "@nestjs/common";
import {
    IngredientsAnalysisResult,
    PantryItem,
} from "../../../domain/pantry.model";
import { RecipeIngredient } from "../../../domain/recipe.model";
import { GetRecipeIngredientsWithPantryDto } from "../../dto";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class GetRecipeIngredientsWithAvailabilityUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
    @Inject("UserService")
    private readonly userService: UserService,
  ) {}

  async execute(
    dto: GetRecipeIngredientsWithPantryDto,
  ): Promise<IngredientsAnalysisResult<RecipeIngredient>> {
    let pantryItems: PantryItem[] = [];
    let userPreferences = null;

    if (dto.userId) {
      pantryItems = await this.pantryService.getUserPantry(dto.userId);
      userPreferences = await this.userService.getUserPreferences(dto.userId);
    }

    const [recipe, recipeIngredients] = await Promise.all([
      this.recipeService.getRecipeById(dto.recipeId),
      this.recipeService.getIngredientsBy({ recipeId: dto.recipeId }),
    ]);

    return this.pantryService.analyzeIngredientsByPantryItems({
      pantryItems,
      recipeIngredients,
      recipeServing: recipe.servings!,
      targetServings: userPreferences?.servings ?? recipe.servings,
    });
  }
}
