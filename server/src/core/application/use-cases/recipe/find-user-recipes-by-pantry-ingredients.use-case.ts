import { Inject, Injectable } from "@nestjs/common";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class FindUserRecipesByPantryIngredientsUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
    @Inject("UserService")
    private readonly userService: UserService,
  ) {}

  async execute(userId: string): Promise<any[]> {
    const [{ items: userRecipes }, userPreferences] = await Promise.all([
      this.recipeService.getAllRecipes({ userId }),
      this.userService.getUserPreferences(userId),
    ]);

    if (!userRecipes.length) {
      return [];
    }

    const recipesIngredients = await Promise.all(
      userRecipes.map(async (recipe) => ({
        recipeId: recipe.id,
        recipeServing: recipe.servings ?? 1,
        targetServings: userPreferences?.servings ?? 1,
        ingredients: await this.recipeService.getIngredientsBy({
          recipeId: recipe.id,
        }),
      })),
    );

    const analyzedResults =
      await this.pantryService.analyzeMultipleRecipesIngredientsAvailabilityInPantry(
        {
          userId,
          recipesIngredients,
        },
      );

    const recipesMap = new Map(userRecipes.map((r) => [r.id, r]));

    return analyzedResults
      .map((analyzed) => {
        const recipe = recipesMap.get(analyzed.recipeId);
        return recipe ? { ...recipe, ...analyzed.analysis } : null;
      })
      .filter(
        (recipe): recipe is NonNullable<typeof recipe> => recipe !== null,
      );
  }
}
