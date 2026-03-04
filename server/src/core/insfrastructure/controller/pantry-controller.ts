import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
} from "@nestjs/common";
import {
  ConfirmCookRecipeDto,
  IaScanIngredientItemDto,
  PantryDto,
  RegisterPendingPurchaseDto,
  UserUnregisterPantryItem,
} from "../../application/dto";
import { PantryFacade } from "../../application/services/interfaces/pantry";
import { CreatePantryDto } from "./dto/PantryDto";

@Controller("pantry")
export class PantryController {
  constructor(
    @Inject("PantryFacade")
    private readonly pantryFacade: PantryFacade
  ) {}

  @Get(":pantryId")
  async getPantryById(@Param("pantryId") pantryId: string) {
    return await this.pantryFacade.getPantryById(pantryId);
  }

  @Get(":ingredientId/transactions")
  async getPantryTransactions(
    @Param("ingredientId") ingredientId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedPage = Number(page);
    const parsedLimit = Number(limit);

    return await this.pantryFacade.getPantryTransactions({
      ingredientId,
      limit: Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 15,
      page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    });
  }

  @Get("user/:userId")
  async getUserPantryItems(@Req() req: any) {
    const result = await this.pantryFacade.getUserPantry(req.userId);
    return result;
  }

  @Get("user")
  async getCurrentUserPantryItems(@Req() req: any) {
    const result = await this.pantryFacade.getUserPantry(req.userId);
    return result;
  }

  @Post()
  async createPantryItem(@Req() req: any, @Body() data: CreatePantryDto[]) {
    const pantryItem = data.map(item=>({...item,userId:req.userId}))

    return await this.pantryFacade.createPantryItem(pantryItem);
  }

  @Post("unregistered-pantry")
  async addUnregisteredPantryItem(
    @Req() req: any,
    @Body() data: UserUnregisterPantryItem
  ) {
    const pantryItem = {
      ...data,
      userId: req.userId,
    };

    return await this.pantryFacade.addUnregisteredIngredient(pantryItem);
  }

  @Post("scan-ia-pantry")
  async registerScannedPantryItems(@Req() req: any, @Body() data: any) {
    const items = data.map((item: any) => ({
      ...item,
      userId: req.userId,
    }));

    return await this.pantryFacade.registerScannedPantryItems({
      userId: req.userId,
      items,
    });
  }

  @Put()
  async updatePantryItem(@Body() data: PantryDto) {
    console.log("updatePantryItemss", data);
    return await this.pantryFacade.updatePantryItem(data as any);
  }

  @Put(":itemId/soft-delete")
  async deletePantryItem(@Param("itemId") itemId: string, @Req() req: any) {
    return this.pantryFacade.deletePantryItem(itemId, req.userId);
  }


  @Put("/register-pending-purchase")
  async registerPendingPurchase(
    @Req() req: any,
    @Body() data: RegisterPendingPurchaseDto
  ) {
    console.log("registerPendingPurchase", data);
    return await this.pantryFacade.registerPendingPurchase({
      ...data,
      userId: req.userId,
    });
  }

  @Get("user/:suggestedMealplanId/suggested-meal-plan-missing-ingredients")
  async getSuggestedMealPlanMissingIngredients(
    @Req() req: any,
    @Param("suggestedMealplanId") suggestedMealplanId: string,
  ) {
    return await this.pantryFacade.getSuggestedMealPlanMissingPantryItems({
      userId: req.userId,
      suggestedMealplanId: suggestedMealplanId,
    });
  }

  @Get("user/:userId/meal-plan-missing-ingredients")
  async getMealPlanMissingIngredients(
    @Req() req: any,
    @Query() query: any
  ) {
    return await this.pantryFacade.getMealPlanMissingPantryItems({
      userId: req.userId,
      startDate: query?.startDate,
      endDate: query?.endDate,
    });
  }

  @Get("user/meal-plan-missing-ingredients")
  async getCurrentUserMealPlanMissingIngredients(
    @Req() req: any,
    @Query() query: any
  ) {
    return await this.pantryFacade.getMealPlanMissingPantryItems({
      userId: req.userId,
      startDate: query?.startDate,
      endDate: query?.endDate,
    });
  }

  @Post("user/:userId/register-used-ingredients")
  async registerUsedIngredients(
    @Req() req: any,
    @Body() data: ConfirmCookRecipeDto[]
  ) {
    const items = data.map((item) => ({ ...item, userId: req.userId }));
    return await this.pantryFacade.registerRecipeAsCooked(items);
  }

  @Post("user/register-used-ingredients")
  async registerCurrentUserUsedIngredients(
    @Req() req: any,
    @Body() data: ConfirmCookRecipeDto[]
  ) {
    const items = data.map((item) => ({ ...item, userId: req.userId }));
    return await this.pantryFacade.registerRecipeAsCooked(items);
  }
}
