import { ScannedIngredient, ScanReceipt } from "../../../domain/ia.model";
import {
  Ingredient,
  IngredientsFilter,
} from "../../../domain/ingredients.model";
import { IngredientDto, IngredientNutricionalValuesDto } from "../../dto";
import { IngredientNutricionalValuesResponseDto } from "../../dto/responseDto";

export interface IngredientService {
  getAllIngredient(filter?: IngredientsFilter): Promise<Ingredient[]>;
  getFilterActiveIngredient(): Promise<Ingredient[]>;
  createIngredient(
    data: IngredientDto | IngredientDto[]
  ): Promise<Ingredient[]>;
  searchByFilter(
    ingredients: Ingredient[],
    filter: IngredientsFilter
  ): Ingredient[];
  mapScannedIngredients(
    scanIaIngredients: ScanReceipt[],
    ingredients: Ingredient[]
  ): ScannedIngredient[];
  getMatchedScannedIngredients(
    scanReceipt: ScanReceipt[]
  ): Promise<ScannedIngredient[]>;
}

export interface IngredientFacade {
  getAllIngredient(): Promise<Ingredient[]>;
  getIngredientsNutricionalValues(
    data: IngredientNutricionalValuesDto[]
  ): Promise<IngredientNutricionalValuesResponseDto>;
  getFilterActiveIngredient(): Promise<Ingredient[]>;
  createIngredient(
    data: IngredientDto 
  ): Promise<Ingredient> 
  searchBy(filter: IngredientsFilter): Promise<Ingredient[]>;
}
