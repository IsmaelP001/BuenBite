import { Inject, Injectable, Logger } from "@nestjs/common";
import { RecipeTip } from "../../../domain/recipe.model";
import { GamificationAction, GamificationEvent } from "../../../domain/gamification.model";
import { ActivityType } from "../../../domain/social.model";
import { UploadedImage, UploadResult } from "../../../domain/upload";
import { RecipeTipDto } from "../../dto";
import { RecipesService } from "../../services/interfaces/recipe";
import { UploadFacade } from "../../services/interfaces/upload";
import { GamificationService } from "../../services/interfaces/gamification";
import { SocialService } from "../../services/interfaces/social";

@Injectable()
export class SaveRecipeTipUseCase {
  private readonly logger = new Logger(SaveRecipeTipUseCase.name);

  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("UploadFacade")
    private readonly uploadFacade: UploadFacade,
    @Inject("GamificationService")
    private readonly gamificationService: GamificationService,
    @Inject("SocialService")
    private readonly socialService: SocialService,
  ) {}

  async execute(data: RecipeTipDto): Promise<RecipeTip> {
    let uploadedImage: UploadResult | null = null;

    if (data?.image) {
      uploadedImage = await this.uploadFacade.uploadImage(
        data.image as UploadedImage,
      );
    }
    try {
      const [tip, recipe] = await Promise.all([
        this.recipeService.saveRecipeTip({
          ...data,
          image: uploadedImage?.publicUrl,
        }),
        this.recipeService.getRecipeById(data.recipeId),
      ]);

      await this.emitGamificationEvent({
        userId: data.userId,
        action: GamificationAction.TIP_ADDED,
        referenceId: data.recipeId,
        referenceType: "recipe_tip",
        metadata: {},
        timestamp: new Date(),
      });

      await this.emitActivityPost({
        userId: data.userId,
        activityType: ActivityType.TIP_ADDED,
        metadata: {
          recipeName: recipe.name ?? "",
          tipContent: data.tip,
          tipImage: uploadedImage?.publicUrl ?? null,
        },
        recipeId: data.recipeId,
      });

      return tip;
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
