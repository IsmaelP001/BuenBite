import { Inject, Injectable } from "@nestjs/common";
import { Cacheable } from "../../../adapters/decorators/cache-decorator";
import { IngredientUnitConverter } from "../../../utils/unitConverterV2";
import { Ingredient, IngredientsFilter } from "../../domain/ingredients.model";
import { NutricionalValues } from "../../domain/pantry.model";
import { IngredientDto, IngredientNutricionalValuesDto } from "../dto";
import { IngredientNutricionalValuesResponseDto } from "../dto/responseDto";
import {
  IngredientFacade,
  IngredientService,
} from "../services/interfaces/ingredient";

@Injectable()
export class IngredientFacadeImpl implements IngredientFacade {
  constructor(
    @Inject("IngredientService")
    private ingredientService: IngredientService,
  ) {}

  @Cacheable({
    prefix: "ALL_INGREDIENTS",
    ttl: 86400,
  })
  async getAllIngredient(): Promise<Ingredient[]> {
    const result = await this.ingredientService.getAllIngredient();
    return result;
  }

  async searchBy(filter: IngredientsFilter): Promise<Ingredient[]> {
    const allIngredients = await this.getAllIngredient();
    return this.ingredientService.searchByFilter(allIngredients, filter);
  }

  async createIngredient(data: IngredientDto): Promise<Ingredient> {
    const [result] = await this.ingredientService.createIngredient(data);
    return result;
  }

  async getFilterActiveIngredient(): Promise<Ingredient[]> {
    const result = await this.ingredientService.getAllIngredient();
    return result;
  }

  private scaleNutrition(valuePer100g: number, grams: number): number {
    return (valuePer100g / 100) * grams;
  }

  async getIngredientsNutricionalValues(
    data: IngredientNutricionalValuesDto[],
  ): Promise<IngredientNutricionalValuesResponseDto> {
    const ingredientIds = data.map((item) => item.ingredientId);
    const ingredientsList = await this.searchBy({
      ingredientIds: ingredientIds,
    });

    const totalValues = data.reduce<NutricionalValues>(
      (acc, item) => {
        const ingredient = ingredientsList.find(
          (i) => i.id === item.ingredientId,
        );

        if (!ingredient) {
          return acc;
        }

        const { value, success } = IngredientUnitConverter.convert(
          item.value,
          item.originalMeasurementType as any,
          "grams",
          ingredient.conversions,
        );

        if (!success || value === undefined) {
          return acc;
        }

        acc.calories += this.scaleNutrition(ingredient.calories_100g, value);
        acc.proteins += this.scaleNutrition(ingredient.protein_100g, value);
        acc.carbs += this.scaleNutrition(ingredient.carbohydrates_100g, value);
        acc.fats += this.scaleNutrition(ingredient.fat_100g, value);

        return acc;
      },
      {
        calories: 0,
        proteins: 0,
        carbs: 0,
        fats: 0,
      },
    );

    return { nutricionalValues: totalValues, ingredients: ingredientsList };
  }
}
