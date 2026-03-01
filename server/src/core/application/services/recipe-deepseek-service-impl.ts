import { Inject, Injectable } from "@nestjs/common";
import { DishAnalysis } from "../../domain/recipe.model";
import { IaRepository } from "../../domain/repositories";
import { IaService } from "./interfaces/ia";

@Injectable()
export class RecipeAIServiceDeepseekImpl implements IaService {
  constructor(
    @Inject("IaRepository")
    private iaRepository: IaRepository
  ) {}
  scanReceipt(image: any): Promise<any> {
    return this.iaRepository.scanReceipt(image);
  }


  async generateRecipe(prompt: string): Promise<any> {
    return await this.iaRepository.generateRecipe(prompt);
  }

  scanFood(image: any): Promise<DishAnalysis> {
    return this.iaRepository.scanFood(image);
  }
}
