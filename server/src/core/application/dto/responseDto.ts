import { Ingredient } from "../../domain/ingredients.model";
import { NutricionalValues } from "../../domain/pantry.model";

export interface IngredientNutricionalValuesResponseDto{
    nutricionalValues:NutricionalValues
    ingredients:Ingredient[]
}