import { Inject, Injectable } from "@nestjs/common";
import { RecipeIngredient } from "../../../domain/recipe.model";
import { MealplanService } from "../../services/interfaces/mealplan";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class GetMealplanRecipeIngredientsUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("MealplanService")
    private readonly mealplanService: MealplanService,
    @Inject("UserService")
    private readonly userService: UserService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
  ) {}

  async execute(
    suggestedId: string,
    userId: string,
  ): Promise<RecipeIngredient[]> {
    const suggestedMealplanRecipes =
      await this.mealplanService.getSuggestedMealPlanRecipeEntry(suggestedId);
    let userPreferences = null;

    if (userId) {
      userPreferences = await this.userService.getUserPreferences(userId);
    }

    const recipes = suggestedMealplanRecipes.map((recipe) =>
      this.recipeService.getRecipeById(recipe.recipeId),
    );
    const ingredients = suggestedMealplanRecipes.map((recipe) =>
      this.recipeService.getIngredientsBy({ recipeId: recipe.recipeId }),
    );
    const [recipesResolved, ingredientsResolved] = await Promise.all([
      Promise.all(recipes),
      Promise.all(ingredients),
    ]);

    const targetServings = userPreferences?.servings ?? 1;

    const result = await this.recipeService.getSuggestedPlanRecipeIngredients({
      recipes: recipesResolved,
      recipeIngredients: ingredientsResolved.flat(),
      targetServings,
    });

    const [resultFinal] =
      await this.pantryService.analyzeMultipleRecipesIngredientsAvailabilityInPantry(
        {
          userId: userId,
          recipesIngredients: [
            {
              recipeId: suggestedId,
              ingredients: result,
              recipeServing: targetServings,
              targetServings: targetServings,
            },
          ],
        },
      );

    console.log("resultFinal", resultFinal);

    return resultFinal.analysis;
  }
}
