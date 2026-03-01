import { Inject, Injectable } from "@nestjs/common";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class FindUserSavedRecipesByPantryIngredientsUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("UserService")
    private readonly userService: UserService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
  ) {}

  async execute(userId: string): Promise<any[]> {
    const userRecipes = await this.userService.getUserSavedRecipes(userId);

    const recipesIngredients = await Promise.all(
      userRecipes.map(async (recipe) => {
        const ingredients = await this.recipeService.getIngredientsBy({
          recipeId: recipe.id,
        });
        return {
          recipeId: recipe.id,
          recipeServing: recipe.servings!,
          targetServings: 1,
          ingredients,
        };
      }),
    );

    const analyzedResults =
      await this.pantryService.analyzeMultipleRecipesIngredientsAvailabilityInPantry(
        {
          userId,
          recipesIngredients: recipesIngredients,
        },
      );

    const recipesMap = new Map(userRecipes.map((r) => [r.id, r]));

    return analyzedResults
      .map((analyzed) => {
        const recipe = recipesMap.get(analyzed.recipeId);
        if (!recipe) return null;
        return { ...recipe, ...analyzed.analysis };
      })
      .filter(Boolean);
  }
}
