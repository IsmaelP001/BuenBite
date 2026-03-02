import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { Public } from "../../../adapters/decorators/public-recorator";
import { IngredientDto } from "../../application/dto";
import { IngredientFacade } from "../../application/services/interfaces/ingredient";

@Controller("ingredients")
export class IngredientsController {
  constructor(
    @Inject("IngredientFacade")
    private readonly ingredientFacade: IngredientFacade,
  ) {}

  @Public()
  @Get()
  async getIngredients(
    @Query("query") query: string,
    @Query("isFilterActive") isFilterActive: boolean,
    @Query("isFilterActive") ingredientIds: string,
  ) {
    const ingredientIdsArr = ingredientIds?.split(",");
    return await this.ingredientFacade.searchBy({
      ingredientName: query,
      isFilterActive,
      ingredientIds: ingredientIdsArr,
    });
  }

  @Get("filter-active")
  async getFilterActiveIngredients() {
    return await this.ingredientFacade.getFilterActiveIngredient();
  }

  @Post()
  async createIngredient(@Body() body: IngredientDto, @Req() req: any) {
    const newIng = {
      ...body,
      userId: req?.userId,
    };

    console.log("newIng", newIng);
    return await this.ingredientFacade.createIngredient(newIng);
  }
}
