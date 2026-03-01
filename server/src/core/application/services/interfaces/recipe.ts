import { PaginationParams } from "../../../../shared/dto/input";
import { PaginatedResponse } from "../../../../shared/dto/response";
import { IngredientsAnalysisResult } from "../../../domain/pantry.model";
import {
  FilterRecipeIngredient,
  GetRecentlyViewdRecipes,
  GetSuggestedMealIngredientsInput,
  Recipe,
  RecipeCook,
  RecipeCookedFilter,
  RecipeFilter,
  RecipeIngredient,
  RecipesWithAnalysis,
  RecipeTip,
  RecipeTipsFIlter,
  ResponseRecipeTipDto,
  SaveRecipeMetrics,
  UpdateTip,
} from "../../../domain/recipe.model";
import { CreateRecipeDto } from "../../../insfrastructure/controller/dto/RecipeDto";
import {
  FindRecipesByPantryIngredientsDto,
  GetRecipeIngredientsWithPantryDto,
  IaRecipeCookDto,
  RecipeCookDto,
  RecipeCookWithPantryItemsDto,
  RecipeDto,
  RecipeTipDto,
  RecipeViewDto,
  SearchRecipeDto,
  UpdateTipDto,
  UploadRecipeImageDto,
} from "../../dto";

export interface RecipesService {
  getAllRecipes(
    filter: RecipeFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Recipe>>;
  createRecipe(data: RecipeDto): Promise<Recipe>;
  updateRecipe(data: Partial<Recipe>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<Recipe>;
  getUserRecipes(userId: string): Promise<PaginatedResponse<Recipe>>;
  getRecipeById(id: string): Promise<Recipe>;
  getRecipeVariants(recipeId: string): Promise<Recipe[]>;
  searchRecipesBy(searchRecipe?: SearchRecipeDto): Promise<Recipe[]>;
  updateRecipeTip(data: UpdateTip): Promise<RecipeTip>;
  saveRecipeTip(data: RecipeTipDto): Promise<RecipeTip>;
  getRecipeTips(
    filter: RecipeTipsFIlter,
  ): Promise<PaginatedResponse<ResponseRecipeTipDto>>;
  registerRecipeCooked(data: RecipeCookDto): Promise<void>;
  saveRecipeViews(data: RecipeViewDto[]): Promise<void>;
  saveRecipeMetrics(data: SaveRecipeMetrics): Promise<void>;
  getLatestCommunityRecipes(): Promise<Recipe[]>;
  getRecentlyViewedRecipes(filter: GetRecentlyViewdRecipes): Promise<Recipe[]>;
  latestCookedCommunityRecipes(limit?: number): Promise<Recipe[]>;
  registerRecipeFromMealplanAsCooked(data: RecipeCookDto): Promise<void>;
  getIngredientsBy(filter: FilterRecipeIngredient): Promise<RecipeIngredient[]>;
  registerIaCookedRecipe(dto: IaRecipeCookDto): Promise<void>;
  getCookedRecipes(filter: RecipeCookedFilter): Promise<RecipeCook[]>;
  getSuggestedPlanRecipeIngredients({
    recipeIngredients,
    recipes,
    targetServings,
  }: GetSuggestedMealIngredientsInput): Promise<RecipeIngredient[]>;
}

export interface RecipeFacade {
  searchRecipesBy(searchRecipe?: SearchRecipeDto): Promise<Recipe[]>;
  getRecipeById(id: string): Promise<Recipe>;
  getRecipeVariants(recipeId: string): Promise<Recipe[]>;
  getAllRecipes(
    filter: RecipeFilter,
    pagination?: PaginationParams,
  ): Promise<PaginatedResponse<Recipe>>;
  getUserRecipes(userId: string): Promise<PaginatedResponse<Recipe>>;
  createRecipe(data: CreateRecipeDto): Promise<Recipe>;
  updateRecipe(data: Partial<Recipe>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<Recipe>;
  findRecipesByPantryIngredients(
    dto: FindRecipesByPantryIngredientsDto,
  ): Promise<PaginatedResponse<any[]>>;
  findUserRecipesByPantryIngredients(userId: string): Promise<any[]>;
  uploadRecipeImage(data: UploadRecipeImageDto): Promise<void>;
  updateRecipeTip(data: UpdateTipDto): Promise<RecipeTip>;
  saveRecipeTip(data: RecipeTipDto): Promise<RecipeTip>;
  getRecipeTips(
    filter: RecipeTipsFIlter,
  ): Promise<PaginatedResponse<ResponseRecipeTipDto>>;
  registerRecipeCooked(data: RecipeCookWithPantryItemsDto): Promise<void>;
  getLatestCommunityRecipes(): Promise<Recipe[]>;
  getRecentlyViewedRecipes(filter: GetRecentlyViewdRecipes): Promise<Recipe[]>;
  latestCookedCommunityRecipes(limit?: number): Promise<Recipe[]>;
  trackView(recipeId: string, userId: string, sessionId: string): Promise<void>;
  getIngredientsByRecipeId(recipeId: string): Promise<RecipeIngredient[]>;
  findUserSavedRecipesByPantryIngredients(userId: string): Promise<any[]>;
  getRecipeByIdWithPantry(
    userId: string,
    recipeId: string,
  ): Promise<RecipesWithAnalysis>;
  getRecipeIngredientsWithAvailability(
    dto: GetRecipeIngredientsWithPantryDto,
  ): Promise<IngredientsAnalysisResult<RecipeIngredient>>;
  registerIaCookedRecipe(dto: IaRecipeCookDto): Promise<void>;
  getCookedRecipes(filter: RecipeCookedFilter): Promise<RecipeCook[]>;
  getMealplanRecipeIngredients(
    suggestedId: string,
    userId: string,
  ): Promise<RecipeIngredient[]>;
}
