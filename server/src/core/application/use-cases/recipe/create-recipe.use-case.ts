import { Inject, Injectable, Logger } from "@nestjs/common";
import { Recipe } from "../../../domain/recipe.model";
import { GamificationAction, GamificationEvent } from "../../../domain/gamification.model";
import { CreateRecipeDto } from "../../../insfrastructure/controller/dto/RecipeDto";
import { RecipeDto } from "../../dto";
import { IngredientFacade } from "../../services/interfaces/ingredient";
import { RecipesService } from "../../services/interfaces/recipe";
import { UploadFacade } from "../../services/interfaces/upload";
import { GamificationService } from "../../services/interfaces/gamification";

@Injectable()
export class CreateRecipeUseCase {
  private readonly logger = new Logger(CreateRecipeUseCase.name);

  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("UploadFacade")
    private readonly uploadFacade: UploadFacade,
    @Inject("IngredientFacade")
    private readonly ingredientsFacade: IngredientFacade,
    @Inject("GamificationService")
    private readonly gamificationService: GamificationService,
  ) {}

  async execute(data: CreateRecipeDto): Promise<Recipe> {
    let uploadedImage;

    if (data?.image) {
      try {
        const image = await this.uploadFacade.uploadImage(data.image as any);
        uploadedImage = image;
      } catch (error) {
        throw error;
      }
    }

    const { nutricionalValues, ingredients } =
      await this.ingredientsFacade.getIngredientsNutricionalValues(
        data?.ingredients.map((item) => ({
          originalMeasurementType: item.measurementType,
          value: item.measurementValue,
          ingredientId: item.ingredientId,
        })),
      );

    const recipeIngredients = data.ingredients.map((item) => {
      const match = ingredients.find(
        (ingredient) => ingredient.id === item.ingredientId,
      );
      return {
        ingredientName: match?.name_es,
        measurementType: item.measurementType,
        measurementValue: item.measurementValue,
        ingredientId: item.ingredientId,
      };
    });

    const recipe: RecipeDto = {
      ...data,
      nutricionalValues,
      image: uploadedImage?.publicUrl,
      ingredients: recipeIngredients as any,
    };

    try {
      const created = await this.recipeService.createRecipe(recipe);

      await this.emitGamificationEvent({
        userId: data.userId,
        action: GamificationAction.RECIPE_CREATED,
        referenceId: created.id,
        referenceType: "recipe",
        metadata: { recipeName: created.name },
        timestamp: new Date(),
      });

      return created;
    } catch (error) {
      if (uploadedImage) {
        await this.uploadFacade.deleteImage([uploadedImage.path]);
      }
      throw error;
    }
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }
}
