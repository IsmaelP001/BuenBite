import { Inject, Injectable } from "@nestjs/common";
import { PaginatedResponse } from "../../../../shared/dto/response";
import { FindRecipesByPantryIngredientsDto } from "../../dto";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";
import { UserService } from "../../services/interfaces/user";

@Injectable()
export class FindRecipesByPantryIngredientsUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
    @Inject("UserService")
    private readonly userService: UserService,
  ) {}

  async execute(
    dto: FindRecipesByPantryIngredientsDto,
  ): Promise<PaginatedResponse<any[]>> {
    const [pantryItems, userPreferences] = await Promise.all([
      this.pantryService.getUserPantry(dto.userId),
      this.userService.getUserPreferences(dto.userId),
    ]);

    const ingredientIds = pantryItems
      .map((item) => item.ingredientId)
      .filter(Boolean);

    const { items: recipes, ...rest } = await this.recipeService.getAllRecipes(
      {
        ingredientIds,
        recipeType: "BRAND",
        searchQuery: dto?.searchQuery,
      },
      {
        limit: dto.limit,
        page: dto.page,
      },
    );

    const recipesIngredientsPromises = await Promise.all(
      recipes.map(async (recipe) => ({
        recipeId: recipe.id,
        recipeServing: recipe!.servings!,
        targetServings: userPreferences?.servings ?? 1,
        ingredients: await this.recipeService.getIngredientsBy({
          recipeId: recipe.id,
        }),
      })),
    );

    const analyzedResults =
      await this.pantryService.analyzeMultipleRecipesIngredientsAvailabilityInPantry(
        {
          userId: dto.userId,
          recipesIngredients: recipesIngredientsPromises,
        },
      );

    const recipesMap = new Map(recipes.map((r) => [r.id, r]));

    const result = analyzedResults
      .map((analyzed) => {
        const recipe = recipesMap.get(analyzed.recipeId);
        if (!recipe) return null;
        return { ...recipe, ...analyzed.analysis };
      })
      .filter(Boolean);

    console.log("result map", result);

    return {
      items: result,
      ...rest,
    };
  }
}
