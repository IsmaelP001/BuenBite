import {
  ScannedIngredientWithMatches,
  ScanReceipt
} from "../../../domain/ia.model";
import {
  DishAnalysis,
  DishAnalysisWithIngredients,
} from "../../../domain/recipe.model";
import { GenerateRecipeIaDto } from "../../dto";

export interface IaService {
  generateRecipe(prompt: string): Promise<any>;
  scanFood(image: any): Promise<DishAnalysis>;
  scanReceipt(imageUri: any): Promise<ScanReceipt[]>;
}

export interface IaFacade {
  generateRecipe(prompt: GenerateRecipeIaDto): Promise<any>;
  scanFood(image: any): Promise<DishAnalysisWithIngredients>;
  scanReceipt(image: any): Promise<ScannedIngredientWithMatches[]>;
}
