import { Module } from "@nestjs/common";
import { CreateRecipeUseCase } from "../application/use-cases/recipe/create-recipe.use-case";
import { FindRecipesByPantryIngredientsUseCase } from "../application/use-cases/recipe/find-recipes-by-pantry-ingredients.use-case";
import { FindUserRecipesByPantryIngredientsUseCase } from "../application/use-cases/recipe/find-user-recipes-by-pantry-ingredients.use-case";
import { FindUserSavedRecipesByPantryIngredientsUseCase } from "../application/use-cases/recipe/find-user-saved-recipes-by-pantry-ingredients.use-case";
import { GetMealplanRecipeIngredientsUseCase } from "../application/use-cases/recipe/get-mealplan-recipe-ingredients.use-case";
import { GetRecipeByIdWithPantryUseCase } from "../application/use-cases/recipe/get-recipe-by-id-with-pantry.use-case";
import { GetRecipeIngredientsWithAvailabilityUseCase } from "../application/use-cases/recipe/get-recipe-ingredients-with-availability.use-case";
import { RegisterRecipeCookedUseCase } from "../application/use-cases/recipe/register-recipe-cooked.use-case";
import { SaveRecipeTipUseCase } from "../application/use-cases/recipe/save-recipe-tip.use-case";
import { TrackRecipeViewUseCase } from "../application/use-cases/recipe/track-recipe-view.use-case";
import { UploadRecipeImageUseCase } from "../application/use-cases/recipe/upload-recipe-image.use-case";
import { IngredientsModule } from "./ingredient.module";
import { MealplanModule } from "./mealplan.module";
import { PantryModule } from "./pantry.module";
import { RecipeModule } from "./recipes.module";
import { UploadModule } from "./upload.module";
import { UserModule } from "./user.module";

const useCases = [
  GetMealplanRecipeIngredientsUseCase,
  TrackRecipeViewUseCase,
  RegisterRecipeCookedUseCase,
  SaveRecipeTipUseCase,
  GetRecipeIngredientsWithAvailabilityUseCase,
  GetRecipeByIdWithPantryUseCase,
  CreateRecipeUseCase,
  FindUserRecipesByPantryIngredientsUseCase,
  FindRecipesByPantryIngredientsUseCase,
  FindUserSavedRecipesByPantryIngredientsUseCase,
  UploadRecipeImageUseCase,
];

@Module({
  imports: [
    PantryModule,
    UploadModule,
    IngredientsModule,
    UserModule,
    MealplanModule,
    RecipeModule,
  ],
  providers: [...useCases],
  exports: [...useCases],
})
export class RecipeUseCasesModule {}
