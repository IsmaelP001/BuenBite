import { Inject, Injectable } from "@nestjs/common";
import { UploadRecipeImageDto } from "../../dto";
import { RecipesService } from "../../services/interfaces/recipe";
import { UploadFacade } from "../../services/interfaces/upload";

@Injectable()
export class UploadRecipeImageUseCase {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    @Inject("UploadFacade")
    private readonly uploadFacade: UploadFacade,
  ) {}

  async execute(data: UploadRecipeImageDto): Promise<void> {
    const uploadedImage = await this.uploadFacade.uploadImage(data.image);
    try {
      await this.recipeService.updateRecipe({
        id: data.recipeId,
        image: uploadedImage.publicUrl,
      });
    } catch (error) {
      if (uploadedImage) {
        await this.uploadFacade.deleteImage([uploadedImage.path]);
        throw error;
      }
    }
  }
}
