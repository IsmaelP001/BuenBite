import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { plainToInstance } from "class-transformer";
import { Public } from "../../../adapters/decorators/public-recorator";
import { RecipeAuthorInterceptor } from "../../../adapters/interceptors/recipe-author-interceptor";
import {
  IaRecipeCookDto,
  RecipeCookWithPantryItemsDto,
  RecipeTipDto,
  UpdateTipDto,
} from "../../application/dto";
import { RecipeFacade } from "../../application/services/interfaces/recipe";
import { CreateRecipeDto } from "./dto/RecipeDto";

@Controller("recipes")
export class RecipeController {
  constructor(
    @Inject("RecipeFacade")
    private readonly recipesFacade: RecipeFacade,
  ) {}

  @Get("tips/:recipeId")
  async getRecipeTips(
    @Param("recipeId") recipeId: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    const tips = await this.recipesFacade.getRecipeTips({
      recipeId,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
    });
    return tips;
  }

  @Public()
  @Get("suggested/:suggestedMealplanId")
  async getSuggestedRecipe(
    @Param("suggestedMealplanId") suggestedMealplanId: string,
    @Req() req: any,
  ) {
    return await this.recipesFacade.getMealplanRecipeIngredients(
      suggestedMealplanId,
      req.userId,
    );
  }

  @Post("ia-cooked")
  async registerIaCookedRecipe(@Req() req: any, @Body() body: IaRecipeCookDto) {
    const userId = req.userId;
    const recipes = await this.recipesFacade.registerIaCookedRecipe({
      ...body,
      userId,
    });
    return recipes;
  }

  @Post("viewed")
  async saveViewedRecipe(@Req() req: any, @Body() body: any) {
    const userId = req?.userId;
    const sessionId = body?.sessionId;
    const recipeId = body?.recipeId;
    return this.recipesFacade.trackView(recipeId, userId, sessionId);
  }

  @Get("recently-viewed")
  @UseInterceptors(RecipeAuthorInterceptor)
  async getRecentlyViewed(@Query() query: any, @Req() req: any) {
    const userId = req?.userId;
    const sessionId = query?.sessionId;

    const filter = {
      userId,
      limit: query?.limit ? parseInt(query.limit) : undefined,
      sessionId,
    };
    return this.recipesFacade.getRecentlyViewedRecipes(filter);
  }

  @Public()
  @Get("ingredients/:recipeId")
  async getRecipeIngredientsWithAvailability(
    @Req() req: any,
    @Param("recipeId") recipeId: string,
    @Query("userId") userId: string,
  ) {
    return this.recipesFacade.getRecipeIngredientsWithAvailability({
      userId: userId ?? req.userId,
      recipeId,
    });
  }

  @Public()
  @Get("cooked")
  @UseInterceptors(RecipeAuthorInterceptor)
  async recipesCooked(
    @Query("limit") limit?: string,
    @Query("page") page?: string,
    @Query("recipeId") recipeId?: string,
  ) {
    return this.recipesFacade.getCookedRecipes({
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : undefined,
      recipeId: recipeId,
    });
  }

  @Public()
  @Get("community/cooked")
  @UseInterceptors(RecipeAuthorInterceptor)
  async latestCookedCommunityRecipes(@Query("limit") limit?: string) {
    return this.recipesFacade.latestCookedCommunityRecipes(
      limit ? parseInt(limit) : undefined,
    );
  }
  @Public()
  @Get("community/latest")
  @UseInterceptors(RecipeAuthorInterceptor)
  async getLatestCommunityRecipes() {
    return this.recipesFacade.getLatestCommunityRecipes();
  }

  @Post("tips")
  @UseInterceptors(FileInterceptor("image"))
  async saveRecipeTip(
    @Req() req: any,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: any,
  ) {
    const saveRecipeDto: RecipeTipDto = {
      userId: req.userId,
      recipeId: body.recipeId,
      tip: String(body.tip ?? "").trim(),
      image,
    };
    return this.recipesFacade.saveRecipeTip(saveRecipeDto);
  }

  @Put("tips")
  async updateRecipeTip(@Body() body: any) {
    const updateRecipeTipDto: UpdateTipDto = {
      ...body,
      id: body.id,
    };
    return this.recipesFacade.updateRecipeTip(updateRecipeTipDto);
  }

  @Public()
  @Get()
  @UseInterceptors(RecipeAuthorInterceptor)
  async getRecipes(
    @Query("page") page: number = 0,
    @Query("limit") limit: number = 10,
    @Query("userId") userId?: string,
    @Query("onlyCommunityRecipes") onlyCommunityRecipes?: boolean,
  ) {
    const recipes = await this.recipesFacade.getAllRecipes(
      {
        onlyCommunityRecipes,
        userId,
      },
      {
        limit,
        page,
      },
    );
    return recipes;
  }

  @Public()
  @Get("search")
  @UseInterceptors(RecipeAuthorInterceptor)
  async searchRecipesBy(@Query() query: any, @Req() req: any) {
    const getArrayFromParam = (
      param: string | undefined,
    ): string[] | undefined => {
      if (!param) return undefined;
      return param.split(",").filter(Boolean);
    };

    const ingredientCount = query?.ingredientCount
      ? parseInt(query.ingredientCount)
      : undefined;
    const cookTime = query?.cookTime ? parseInt(query.cookTime) : undefined;
    const userId = req.userId;

    const recipes = await this.recipesFacade.searchRecipesBy({
      ...query,
      query: query?.query,
      ingredientIds: getArrayFromParam(query?.ingredientIds),
      mealTypes: getArrayFromParam(query?.mealTypes),
      cuisines: getArrayFromParam(query?.cuisines),
      times: getArrayFromParam(query?.times),
      difficulties: getArrayFromParam(query?.difficulties),
      userId,
      ingredientCount,
      cookTime,
      limit: query?.limit,
    });

    return recipes;
  }

  @Public()
  @Get(":recipeId/variants")
  @UseInterceptors(RecipeAuthorInterceptor)
  async getRecipeVariants(@Param("recipeId") recipeId: string) {
    return this.recipesFacade.getRecipeVariants(recipeId);
  }

  @Get("from-pantry")
  @UseInterceptors(RecipeAuthorInterceptor)
  async findRecipesByPantryIngredients(
    @Req() req: any,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
    @Query("searchQuery") searchQuery?: string,
  ) {
    const userId = req.userId;
    const recipes = await this.recipesFacade.findRecipesByPantryIngredients({
      userId,
      limit: Number(limit),
      page: Number(page),
      searchQuery: searchQuery,
    });
    return recipes;
  }

  @Get("user")
  @UseInterceptors(RecipeAuthorInterceptor)
  async getUserRecipes(@Param("userId") userId: string) {
    const recipes = await this.recipesFacade.getUserRecipes(userId);
    return recipes;
  }

  @Public()
  @Get(":recipeId")
  @UseInterceptors(RecipeAuthorInterceptor)
  async getRecipeById(@Param("recipeId") recipeId: string) {
    const recipe = await this.recipesFacade.getRecipeById(recipeId);
    return recipe;
  }

  @Get(":recipeId/cook")
  async getRecipeByIdWithPantry(
    @Param("recipeId") recipeId: string,
    @Req() req: any,
  ) {
    const userId = req.userId;
    const recipes = await this.recipesFacade.getRecipeByIdWithPantry(
      userId,
      recipeId,
    );

    return recipes;
  }

  @Get("user/saved")
  @UseInterceptors(RecipeAuthorInterceptor)
  async findUserSavedRecipesByPantryIngredients(@Req() req: any) {
    const userId = req.userId;
    const recipes =
      await this.recipesFacade.findUserSavedRecipesByPantryIngredients(userId);
    return recipes;
  }

  @Get("user/from-pantry")
  @UseInterceptors(RecipeAuthorInterceptor)
  async findUserRecipesByPantryIngredients(
    @Req() req: any,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
  ) {
    const userId = req.userId;
    const recipes =
      await this.recipesFacade.findUserRecipesByPantryIngredients(userId);
    return recipes;
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  async createRecipe(
    @Req() req: any,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: any,
  ) {
    const recipeDto = plainToInstance(
      CreateRecipeDto,
      { ...body, image, userId: req.userId },
      {
        enableImplicitConversion: true,
      },
    );

    const newRecipe = await this.recipesFacade.createRecipe(recipeDto);
    return newRecipe;
  }

  @Post("upload-image")
  @UseInterceptors(FileInterceptor("image"))
  async updateRecipeImage(
    @Req() req: any,
    @UploadedFile() image: Express.Multer.File,
    @Body() body: any,
  ) {
    const data = { recipeId: body.recipeId, image };
    const newRecipe = await this.recipesFacade.uploadRecipeImage(data);
    return newRecipe;
  }

  @Put()
  async updateRecipe(@Body() data: any) {
    const updated = await this.recipesFacade.updateRecipe(data);
    return updated;
  }

  @Post("register-cook")
  @UseInterceptors(FileInterceptor("image"))
  async regiterRecipeAsCooked(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: any,
    @Body() body: RecipeCookWithPantryItemsDto,
  ) {
    console.log('body regiterRecipeAsCooked', body);
    const userId = req.userId;
    const ingredients = JSON.parse(body.ingredients as any);
    await this.recipesFacade.registerRecipeCooked({
      ...body,
      ingredients,
      servings: Number(body.servings),
      rating: body?.rating ? Number(body.rating) : null,
      notes: body?.notes,
      userId,
      image: image as any,
    });
  }

  @Delete(":id")
  async deleteRecipe(@Param("id") id: string) {
    const deleted = await this.recipesFacade.deleteRecipe(id);
    return deleted;
  }

  @Put(":id/soft-delete")
  async softDeleteRecipe(@Param("id") id: string) {
    return this.recipesFacade.deleteRecipe(id);
  }
}
