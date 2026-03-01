import { Inject, Injectable } from "@nestjs/common";
import { PaginationParams } from "../../../shared/dto/input";
import { PaginatedResponse } from "../../../shared/dto/response";
import { IngredientsAnalysisResult } from "../../domain/pantry.model";
import {
  GetRecentlyViewdRecipes,
  Recipe,
  RecipeCook,
  RecipeCookedFilter,
  RecipeFilter,
  RecipeIngredient,
  RecipesWithAnalysis,
  RecipeTip,
  RecipeTipsFIlter,
  ResponseRecipeTipDto,
  UpdateTip,
} from "../../domain/recipe.model";
import { CreateRecipeDto } from "../../insfrastructure/controller/dto/RecipeDto";
import {
  FindRecipesByPantryIngredientsDto,
  GetRecipeIngredientsWithPantryDto,
  IaRecipeCookDto,
  RecipeCookWithPantryItemsDto,
  RecipeTipDto,
  SearchRecipeDto,
  UploadRecipeImageDto,
} from "../dto";
import { RecipeFacade, RecipesService } from "../services/interfaces/recipe";
import { CreateRecipeUseCase } from "../use-cases/recipe/create-recipe.use-case";
import { FindRecipesByPantryIngredientsUseCase } from "../use-cases/recipe/find-recipes-by-pantry-ingredients.use-case";
import { FindUserRecipesByPantryIngredientsUseCase } from "../use-cases/recipe/find-user-recipes-by-pantry-ingredients.use-case";
import { FindUserSavedRecipesByPantryIngredientsUseCase } from "../use-cases/recipe/find-user-saved-recipes-by-pantry-ingredients.use-case";
import { GetMealplanRecipeIngredientsUseCase } from "../use-cases/recipe/get-mealplan-recipe-ingredients.use-case";
import { GetRecipeByIdWithPantryUseCase } from "../use-cases/recipe/get-recipe-by-id-with-pantry.use-case";
import { GetRecipeIngredientsWithAvailabilityUseCase } from "../use-cases/recipe/get-recipe-ingredients-with-availability.use-case";
import { RegisterRecipeCookedUseCase } from "../use-cases/recipe/register-recipe-cooked.use-case";
import { SaveRecipeTipUseCase } from "../use-cases/recipe/save-recipe-tip.use-case";
import { TrackRecipeViewUseCase } from "../use-cases/recipe/track-recipe-view.use-case";
import { UploadRecipeImageUseCase } from "../use-cases/recipe/upload-recipe-image.use-case";
import { CreatePostUseCase } from "../use-cases/social/create-post.use-case";

@Injectable()
export class RecipeFacadeImpl implements RecipeFacade {
  constructor(
    @Inject("RecipesService")
    private readonly recipeService: RecipesService,
    private readonly createRecipeUC: CreateRecipeUseCase,
    private readonly findRecipesByPantryUC: FindRecipesByPantryIngredientsUseCase,
    private readonly findUserRecipesByPantryUC: FindUserRecipesByPantryIngredientsUseCase,
    private readonly findUserSavedRecipesByPantryUC: FindUserSavedRecipesByPantryIngredientsUseCase,
    private readonly uploadRecipeImageUC: UploadRecipeImageUseCase,
    private readonly saveRecipeTipUC: SaveRecipeTipUseCase,
    private readonly registerRecipeCookedUC: RegisterRecipeCookedUseCase,
    private readonly trackRecipeViewUC: TrackRecipeViewUseCase,
    private readonly getRecipeByIdWithPantryUC: GetRecipeByIdWithPantryUseCase,
    private readonly getRecipeIngredientsWithAvailabilityUC: GetRecipeIngredientsWithAvailabilityUseCase,
    private readonly getMealplanRecipeIngredientsUC: GetMealplanRecipeIngredientsUseCase,
  ) {}

  createRecipe(data: CreateRecipeDto): Promise<Recipe> {
    return this.createRecipeUC.execute(data);
  }

  findRecipesByPantryIngredients(
    dto: FindRecipesByPantryIngredientsDto,
  ): Promise<PaginatedResponse<any[]>> {
    return this.findRecipesByPantryUC.execute(dto);
  }

  findUserRecipesByPantryIngredients(userId: string): Promise<any[]> {
    return this.findUserRecipesByPantryUC.execute(userId);
  }

  findUserSavedRecipesByPantryIngredients(userId: string): Promise<any[]> {
    return this.findUserSavedRecipesByPantryUC.execute(userId);
  }

  uploadRecipeImage(data: UploadRecipeImageDto): Promise<void> {
    return this.uploadRecipeImageUC.execute(data);
  }

  saveRecipeTip(data: RecipeTipDto): Promise<RecipeTip> {
    return this.saveRecipeTipUC.execute(data);
  }

  registerRecipeCooked(data: RecipeCookWithPantryItemsDto): Promise<void> {
    return this.registerRecipeCookedUC.execute(data);
  }

  trackView(
    recipeId: string,
    userId: string,
    sessionId: string,
  ): Promise<void> {
    return this.trackRecipeViewUC.execute({
      recipeId,
      userId,
      sessionId,
    });
  }

  getRecipeByIdWithPantry(
    userId: string,
    recipeId: string,
  ): Promise<RecipesWithAnalysis> {
    return this.getRecipeByIdWithPantryUC.execute(userId, recipeId);
  }

  getRecipeIngredientsWithAvailability(
    dto: GetRecipeIngredientsWithPantryDto,
  ): Promise<IngredientsAnalysisResult<RecipeIngredient>> {
    return this.getRecipeIngredientsWithAvailabilityUC.execute(dto);
  }

  getMealplanRecipeIngredients(
    suggestedId: string,
    userId: string,
  ): Promise<RecipeIngredient[]> {
    return this.getMealplanRecipeIngredientsUC.execute(suggestedId, userId);
  }

  getCookedRecipes(filter: RecipeCookedFilter): Promise<RecipeCook[]> {
    return this.recipeService.getCookedRecipes(filter);
  }

  registerIaCookedRecipe(dto: IaRecipeCookDto): Promise<void> {
    return this.recipeService.registerIaCookedRecipe(dto);
  }

  getIngredientsByRecipeId(recipeId: string): Promise<RecipeIngredient[]> {
    return this.recipeService.getIngredientsBy({ recipeId });
  }

  getRecentlyViewedRecipes(filter: GetRecentlyViewdRecipes): Promise<Recipe[]> {
    return this.recipeService.getRecentlyViewedRecipes(filter);
  }

  latestCookedCommunityRecipes(limit?: number): Promise<Recipe[]> {
    return this.recipeService.latestCookedCommunityRecipes(limit);
  }

  getLatestCommunityRecipes(): Promise<Recipe[]> {
    return this.recipeService.getLatestCommunityRecipes();
  }

  updateRecipeTip(data: UpdateTip): Promise<RecipeTip> {
    return this.recipeService.updateRecipeTip(data);
  }

  getRecipeTips(
    filters: RecipeTipsFIlter,
  ): Promise<PaginatedResponse<ResponseRecipeTipDto>> {
    return this.recipeService.getRecipeTips(filters);
  }

  searchRecipesBy(searchRecipe?: SearchRecipeDto): Promise<Recipe[]> {
    return this.recipeService.searchRecipesBy(searchRecipe);
  }

  getRecipeById(id: string): Promise<Recipe> {
    return this.recipeService.getRecipeById(id);
  }

  getRecipeVariants(recipeId: string): Promise<Recipe[]> {
    return this.recipeService.getRecipeVariants(recipeId);
  }

  getAllRecipes(
    filter: RecipeFilter,
    pagination: PaginationParams,
  ): Promise<PaginatedResponse<Recipe>> {
    return this.recipeService.getAllRecipes(filter, pagination);
  }

  getUserRecipes(userId: string): Promise<PaginatedResponse<Recipe>> {
    return this.recipeService.getUserRecipes(userId);
  }

  updateRecipe(data: Partial<Recipe>): Promise<Recipe> {
    return this.recipeService.updateRecipe(data);
  }

  deleteRecipe(id: string): Promise<Recipe> {
    return this.recipeService.deleteRecipe(id);
  }
}
