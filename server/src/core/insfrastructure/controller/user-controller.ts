import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { UserFacadeImpl } from "../../application/facades/user-facade-impl";

@Controller("user")
export class UserController {
  constructor(
    @Inject("UserFacade")
    private readonly userFacade: UserFacadeImpl
  ) {}

  @Get("/verify-user-exist")
  async verifyUserExist(@Req() req: any) {
    const userId = req.userId;
    const data = await this.userFacade.getUserById(userId);
    return data;
  }

  @Get("/saved-recipe-entries")
  async userSaveRecipesEntries(@Req() req: any) {
    const userId = req.userId;
    const data = await this.userFacade.getUserSavedRecipeEntries(userId);
    return data;
  }

  @Get("/nutritional-metrics")
  async getUserActiveNutritionalMetrics(@Req() req: any) {
    const userId = req.userId;
    const data = await this.userFacade.getUserActiveNutritionalMetrics(userId);
    return data;
  }

  @Get("/nutritional-metrics/:id")
  async getUserActiveNutritionalMetricsById(
    @Req() req: any,
    @Param("id") id: string
  ) {
    const data = await this.userFacade.getUserNutritionalMetricsById(id);
    return data;
  }

  @Get("/cooked-recipes")
  async getUserCookedRecipes(
    @Req() req: any,
    @Query("startDate") startDate: string
  ) {
    const userId = req.userId;
    const data = await this.userFacade.getUserCookedRecipes({
      userId,
      startDate,
    });
    return data;
  }

  @Get("/nutritional-history")
  async getUserNutricionalHistory(
    @Req() req: any,
    @Query("startDate") startDate: string,
    @Query("startDate") endDate: string
  ) {
    const userId = req.userId;

    return await this.userFacade.getUserNutricionalHistory({
      userId,
      startDate,
    });
  }

  @Get("/weekly-nutritional-resume")
  async getWeeklyNutricionalDataConsumed(@Req() req: any) {
    const userId = req.userId;
    const data = await this.userFacade.getWeeklyNutricionalDataConsumed(userId);
    return data;
  }

  @Get("/preferences")
  async getUserPreferences(@Req() req: any) {
    const userId = req.userId;
    const data = await this.userFacade.getUserPreferences(userId);
    return data;
  }

  @Post("/nutritional-metrics")
  async createUserNutritionMetrics(@Req() req: any, @Body() body: any) {
    const userId = req.userId;
    const data = await this.userFacade.createUserNutritionMetrics({
      userId,
      ...body,
    });
    return data;
  }

  @Post("/preferences")
  async createUserPreferences(@Req() req: any, @Body() body: any) {
    const userId = req.userId;
    const data = await this.userFacade.createUserPreferences({
      userId,
      ...body,
    });
    return data;
  }

  @Patch("/preferences")
  async updateUserPreferences(@Req() req: any, @Body() body: any) {
    const userId = req.userId;
    const data = await this.userFacade.updateUserPreference({
      userId,
      ...body,
    });
    return data;
  }

  @Patch("/recalculate-nutritional-metrics")
  async recalculateUserNutritionalValues(@Req() req: any, @Body() body: any) {
    const userId = req.userId;

    const data = await this.userFacade.recalculateUserNutritionalValues({
      userId,
      ...body,
    });
    return data;
  }

  @Post("/save-recipe")
  async saveRecipe(@Req() req: any, @Body() body: any) {
    const userId = req.userId;
    const recipeId = body?.recipeId;
    const data = await this.userFacade.saveRecipeFavorite({
      userId,
      recipeId,
    });
    return data;
  }

  @Delete("/remove-recipe/:recipeId")
  async removeRecipe(@Req() req: any, @Param("recipeId") recipeId: string) {
    const userId = req.userId;
    const data = await this.userFacade.removeRecipeFavorite({
      userId,
      recipeId,
    });
    return data;
  }
}
