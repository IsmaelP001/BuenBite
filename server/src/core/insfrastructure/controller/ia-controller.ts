import {
  Body,
  Controller,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IaFacade } from "../../application/services/interfaces/ia";
import { GenerateRecipeIaDto } from "./dto/RecipeDto";

@Controller("ia")
export class IaController {
  constructor(
    @Inject("IaFacade")
    private readonly IaFacade: IaFacade
  ) {}

  @Post("generate-recipe")
  async generateRecipe(@Body() body: GenerateRecipeIaDto, @Req() req: any) {
    const userId = req.userId;
    const recipes = await this.IaFacade.generateRecipe({ ...body, userId });
    return recipes;
  }

  @Post("scan-food")
  @UseInterceptors(FileInterceptor("image"))
  async scanRecipe(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: any
  ) {
    const base64 = image.buffer.toString("base64");
    const base64DataUri = `data:${image.mimetype};base64,${base64}`;
    const recipes = await this.IaFacade.scanFood(base64DataUri);
    return recipes;
  }

  @Post("scan-receipt")
  @UseInterceptors(FileInterceptor("image"))
  async scanReceipt(
    @UploadedFile() image: Express.Multer.File,
    @Req() req: any
  ) {
    const base64 = image.buffer.toString("base64");
    const base64DataUri = `data:${image.mimetype};base64,${base64}`;
    const recipes = await this.IaFacade.scanReceipt(base64DataUri);
    return recipes;
  }


}
