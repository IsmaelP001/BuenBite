/**
 * Domain Service: RecipeNutrition
 *
 * Pure domain logic for recipe-related nutrition and ingredient scaling calculations.
 * No framework dependencies.
 */
import { IngredientUnitConverter } from '../../../utils/unitConverterV2';
import { ALLOW_PURCHASE_UNITS } from '../purchases.model';
import { Recipe, RecipeIngredient } from '../recipe.model';

export interface NutrientsByPortions {
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
}

export class RecipeNutritionDomainService {

  static calculateNutrientsByPortions(
    nutrients: { calories: number; proteins: number; carbs: number; fats: number },
    consumedServings: number,
    totalServings: number,
  ): NutrientsByPortions {
    if (totalServings <= 0) {
      return { calories: 0, proteins: 0, fats: 0, carbohydrates: 0 };
    }

    const perServing = {
      calories: nutrients.calories / totalServings,
      protein: nutrients.proteins / totalServings,
      fat: nutrients.fats / totalServings,
      carbohydrates: nutrients.carbs / totalServings,
    };

    return {
      calories: Math.round(perServing.calories * consumedServings),
      proteins: Math.round(perServing.protein * consumedServings * 10) / 10,
      fats: Math.round(perServing.fat * consumedServings * 10) / 10,
      carbohydrates: Math.round(perServing.carbohydrates * consumedServings * 10) / 10,
    };
  }

  /**
   * Scales recipe ingredients by a serving factor.
   */
  static scaleIngredients(
    originalServings: number,
    targetServings: number,
    ingredients: RecipeIngredient[],
  ): RecipeIngredient[] {
    const factor = targetServings / originalServings;
    return ingredients.map((ingredient) => ({
      ...ingredient,
      measurementValue: ingredient.measurementValue * factor,
    }));
  }

  /**
   * Aggregates and normalizes ingredients from multiple recipes for a suggested meal plan.
   * Converts to common units and merges duplicates by ingredientId.
   */
  static aggregateSuggestedPlanIngredients(
    recipes: Recipe[],
    recipeIngredients: RecipeIngredient[],
    targetServings: number,
  ): RecipeIngredient[] {
    const recipeMap = new Map<string, Recipe>();
    recipes.forEach((recipe) => recipeMap.set(recipe.id!, recipe));

    // Group ingredients by recipe
    const grouped = recipeIngredients.reduce<Record<string, RecipeIngredient[]>>((acc, item) => {
      const key = item.recipeId;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    // Scale each recipe group's ingredients
    const scaledIngredients = Object.values(grouped).flatMap((recipeIngs) => {
      const recipe = recipeMap.get(recipeIngs[0].recipeId);
      return this.scaleIngredients(recipe?.servings ?? 1, targetServings, recipeIngs);
    });

    const allowUnitsMap: Record<string, boolean> = Object.fromEntries(
      ALLOW_PURCHASE_UNITS.map((unit) => [unit, true]),
    );

    // Merge by ingredientId
    const results = scaledIngredients.reduce<Record<string, RecipeIngredient & { isSuccessConversion?: boolean }>>((acc, item) => {
      const key = item.ingredientId;
      const currentItem = acc[key];

      if (!currentItem) {
        const shouldConvertUnit = !allowUnitsMap[item.measurementType];
        const measurementType = shouldConvertUnit ? 'gram' : item.measurementType;
        const { value, success } = IngredientUnitConverter.convert(
          Number(item.measurementValue), item.measurementType, measurementType, item.conversions,
        );

        acc[key] = {
          ...item,
          measurementValue: success ? Math.round(value!) : item.measurementValue,
          measurementType: success ? measurementType : item.measurementType,
          isSuccessConversion: success,
        };
      } else {
        const { value, success } = IngredientUnitConverter.convert(
          Number(item.measurementValue), item.measurementType, currentItem.measurementType, item.conversions,
        );
        const newValue = Math.round((success ? value : item.measurementValue!) ?? 0);

        acc[key] = {
          ...currentItem,
          measurementValue: (currentItem.measurementValue ?? 0) + (newValue ?? 0),
          isSuccessConversion: success,
        };
      }

      return acc;
    }, {});

    return Object.values(results);
  }

  /**
   * Scales nutrition values for ingredients (per 100g → actual grams).
   */
  static scaleNutrition(valuePer100g: number, grams: number): number {
    return (valuePer100g / 100) * grams;
  }
}
