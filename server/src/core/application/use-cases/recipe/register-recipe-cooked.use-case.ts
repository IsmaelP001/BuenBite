import { Inject, Injectable, Logger } from "@nestjs/common";
import { RegisterPantryItemsCooked } from "../../../domain/pantry.model";
import { GamificationAction, GamificationEvent } from "../../../domain/gamification.model";
import { ActivityType } from "../../../domain/social.model";
import { RecipeCookWithPantryItemsDto } from "../../dto";
import { PantryService } from "../../services/interfaces/pantry";
import { RecipesService } from "../../services/interfaces/recipe";
import { UploadFacade } from "../../services/interfaces/upload";
import { GamificationService } from "../../services/interfaces/gamification";
import { SocialService } from "../../services/interfaces/social";

@Injectable()
export class RegisterRecipeCookedUseCase {
  private readonly logger = new Logger(RegisterRecipeCookedUseCase.name);

  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("PantryService")
    private readonly pantryService: PantryService,
    @Inject("UploadFacade")
    private readonly uploadFacade: UploadFacade,
    @Inject("GamificationService")
    private readonly gamificationService: GamificationService,
    @Inject("SocialService")
    private readonly socialService: SocialService,
  ) {}

  async execute(data: RecipeCookWithPantryItemsDto): Promise<void> {
    let uploadedImage;
    if (data?.image) {
      uploadedImage = await this.uploadFacade.uploadImage(data.image);
    }

    const recipe = await this.recipeService.getRecipeById(data.recipeId);
    const ingredients = await this.recipeService.getIngredientsBy({recipeId: data.recipeId});
    const dataToRegister: RegisterPantryItemsCooked[] = ingredients.map(
      (item) => ({
        ...item,
        recipeName: recipe.name,
        userId: data.userId,
      }),
    );
    const registerRecipeCookedPromise = this.recipeService.registerRecipeCooked(
      { ...data, image: uploadedImage?.publicUrl, recipe },
    );
    const registerPantryItemsPromise =
      this.pantryService.registerRecipeAsCooked(dataToRegister);
    await Promise.all([
      registerRecipeCookedPromise,
      registerPantryItemsPromise,
    ]);

    await this.emitGamificationEvent({
      userId: data.userId,
      action: GamificationAction.RECIPE_COOKED,
      referenceId: data.recipeId,
      referenceType: "recipe",
      metadata: { recipeName: recipe.name },
      timestamp: new Date(),
    });

    // Create automatic activity post in social feed
    await this.emitActivityPost({
      userId: data.userId,
      activityType: ActivityType.RECIPE_COOKED,
      metadata: {
        recipeName: recipe.name,
        recipeImage: recipe.image ?? null,
        cookImage: uploadedImage?.publicUrl ?? null,
        rating: data.rating,
        notes: data.notes ?? null,
      },
      recipeId: data.recipeId,
    });
  }

  private async emitGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      await this.gamificationService.emitGamificationEvent(event);
    } catch (error: any) {
      this.logger.warn(`Failed to emit gamification event: ${error?.message}`);
    }
  }

  private async emitActivityPost(params: {
    userId: string;
    activityType: ActivityType;
    metadata: Record<string, any>;
    recipeId?: string;
  }): Promise<void> {
    try {
      await this.socialService.createActivityPost(
        params.userId,
        params.activityType,
        params.metadata,
        params.recipeId,
        { skipGamification: true },
      );
    } catch (error: any) {
      this.logger.warn(`Failed to emit activity post: ${error?.message}`);
    }
  }
}
