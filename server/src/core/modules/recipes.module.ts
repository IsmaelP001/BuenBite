import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { RecipeFacadeImpl } from "../application/facades/recipe-facade";
import { RecipeSchedulerServiceImpl } from "../application/services/recipe-scheduler-service-impl";
import { RecipeServiceImpl } from "../application/services/recipe-service-impl";
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
import { RecipeController } from "../insfrastructure/controller/recipe-controller";
import { RecipesRepositoryImpl } from "../insfrastructure/repositories/recipes-repository-impl";
import { IngredientsModule } from "./ingredient.module";
import { MealplanModule } from "./mealplan.module";
import { PantryModule } from "./pantry.module";
import { UploadModule } from "./upload.module";
import { UserModule } from "./user.module";
import { GamificationModule } from "./gamification.module";
import { SocialModule } from "./social.module";

@Module({
  imports: [
    CacheModule.register(),
    PantryModule,
    UploadModule,
    IngredientsModule,
    UserModule,
    MealplanModule,
    GamificationModule,
    SocialModule,
  ],
  controllers: [RecipeController],
  providers: [
    {
      provide: "RecipeFacade",
      useClass: RecipeFacadeImpl,
    },

    {
      provide: "RecipesService",
      useClass: RecipeServiceImpl,
    },
    {
      provide: "RecipesRepository",
      useClass: RecipesRepositoryImpl,
    },

    CreateRecipeUseCase,
    FindRecipesByPantryIngredientsUseCase,
    FindUserRecipesByPantryIngredientsUseCase,
    FindUserSavedRecipesByPantryIngredientsUseCase,
    GetMealplanRecipeIngredientsUseCase,
    GetRecipeByIdWithPantryUseCase,
    GetRecipeIngredientsWithAvailabilityUseCase,
    RegisterRecipeCookedUseCase,
    SaveRecipeTipUseCase,
    TrackRecipeViewUseCase,
    UploadRecipeImageUseCase,

    RecipeSchedulerServiceImpl,
  ],
  exports: ["RecipeFacade", "RecipesService"],
})
export class RecipeModule {}
