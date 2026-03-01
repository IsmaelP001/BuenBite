/**
 * Domain Service: PantryAnalyzer
 *
 * Pure domain logic for analyzing ingredient availability in pantry.
 * Extracted from PantryServiceImpl to keep domain logic framework-free.
 */
import { IngredientUnitConverter } from '../../../utils/unitConverterV2';
import {
  AnalyzedIngredient,
  BaseIngredientForAnalysis,
  IngredientsAnalysisResult,
} from '../pantry.model';

export interface AnalyzeIngredientsInput<T extends BaseIngredientForAnalysis> {
  pantryItems: any[];
  recipeIngredients: T[];
  recipeServing?: number;
  targetServings?: number;
}

export class PantryAnalyzerDomainService {
  /**
   * Analyzes the availability of recipe ingredients against pantry items.
   * Determines per-ingredient status: COMPLETE, PARTIAL, MISSING, NO_STOCK, UNSUCCESSFUL_CONVERSION.
   */
  static analyzeIngredients<T extends BaseIngredientForAnalysis>(
    dto: AnalyzeIngredientsInput<T>,
  ): IngredientsAnalysisResult<T> {
    const completeIngredients: AnalyzedIngredient<T>[] = [];
    const partialIngredients: AnalyzedIngredient<T>[] = [];
    const missingIngredients: AnalyzedIngredient<T>[] = [];
    const noStockIngredients: AnalyzedIngredient<T>[] = [];
    const unsuccessfulConversionIngredients: AnalyzedIngredient<T>[] = [];
    const allIngredients: AnalyzedIngredient<T>[] = [];
    const isPantryEmpty = !dto?.pantryItems || !dto.pantryItems.length;

    dto.recipeIngredients.forEach((ingredient: T) => {
      const pantryItem = dto.pantryItems.find(
        (p: any) => p?.ingredientId === ingredient.ingredientId,
      );

      const { measurementValue, measurementType, conversions: ingredientConversions } = ingredient;

      if (!pantryItem) {
        const data: AnalyzedIngredient<T> = {
          ...ingredient,
          pantryId: null,
          availabilityStatus: isPantryEmpty ? 'PANTRY_NOT_PROVIDED' as const : 'MISSING' as const,
          isAvailableInPantry: false,
          originalPantryQuantity: 0,
          availableInPantry: 0,
          availableConvertedQuantity: 0,
          missingAmount: measurementValue,
          isSuccessConvertion: null,
          pantryMeasurementType: null,
          errorConvertion: null,
        };
        allIngredients.push(data);
        missingIngredients.push(data);
        return;
      }

      const pantryQuantity = pantryItem.measurementValue ?? 0;

      if (pantryQuantity === 0) {
        const data: AnalyzedIngredient<T> = {
          ...ingredient,
          pantryId: pantryItem?.id || null,
          availabilityStatus: 'NO_STOCK' as const,
          isAvailableInPantry: true,
          originalPantryQuantity: 0,
          availableInPantry: 0,
          availableConvertedQuantity: 0,
          missingAmount: measurementValue,
          pantryMeasurementType: pantryItem.measurementType,
          isSuccessConvertion: null,
          errorConvertion: null,
        };
        allIngredients.push(data);
        noStockIngredients.push(data);
        return;
      }

      const conversions = ingredientConversions || pantryItem.conversions;
      const conversionResult = IngredientUnitConverter.convert(
        pantryQuantity, pantryItem.measurementType, measurementType, conversions,
      );

      const convertedQuantity = conversionResult.success ? conversionResult.value! : 0;
      const availableQuantity = conversionResult.success ? convertedQuantity : pantryQuantity;

      let missingAmount = 0;
      let availabilityStatus: 'COMPLETE' | 'PARTIAL' | 'MISSING' | 'NO_STOCK' | 'UNSUCCESSFUL_CONVERSION';

      if (conversionResult.success) {
        missingAmount = Math.max(0, measurementValue - convertedQuantity);
        if (convertedQuantity >= measurementValue) {
          availabilityStatus = 'COMPLETE';
        } else if (convertedQuantity > 0) {
          availabilityStatus = 'PARTIAL';
        } else {
          availabilityStatus = 'NO_STOCK';
        }
      } else {
        missingAmount = measurementValue;
        availabilityStatus = 'UNSUCCESSFUL_CONVERSION';
      }

      const ingredientData: AnalyzedIngredient<T> = {
        ...ingredient,
        pantryId: pantryItem?.id || null,
        availabilityStatus,
        isAvailableInPantry: true,
        originalPantryQuantity: pantryQuantity,
        availableInPantry: Math.floor(availableQuantity),
        availableConvertedQuantity: Math.floor(convertedQuantity),
        missingAmount: Math.floor(missingAmount),
        pantryMeasurementType: pantryItem.measurementType,
        isSuccessConvertion: conversionResult.success,
        errorConvertion: conversionResult.error || null,
      };

      allIngredients.push(ingredientData);

      switch (availabilityStatus) {
        case 'COMPLETE': completeIngredients.push(ingredientData); break;
        case 'PARTIAL': partialIngredients.push(ingredientData); break;
        case 'NO_STOCK': noStockIngredients.push(ingredientData); break;
        case 'UNSUCCESSFUL_CONVERSION': unsuccessfulConversionIngredients.push(ingredientData); break;
        default: missingIngredients.push(ingredientData); break;
      }
    });

    const completionPercentage = this.calculateCompletionPercentage(allIngredients);
    const targetServingsCompletionPercentage = this.calculateCompletionPercentage(allIngredients, {
      originalServings: dto?.recipeServing,
      targetServings: dto.targetServings,
    });

    return {
      totalIngredients: dto.recipeIngredients.length,
      targetServingsCompletionPercentage,
      targetServings: dto.targetServings,
      totalInPantryIngredients: completeIngredients.length,
      totalPartialIngredients: partialIngredients.length,
      totalMissingIngredients: missingIngredients.length,
      totalNoStockIngredients: noStockIngredients.length,
      totalUnsuccessfulConversionIngredients: unsuccessfulConversionIngredients.length,
      completionPercentage,
      ingredients: allIngredients,
      completeIngredients,
      partialIngredients,
      missingIngredients,
      noStockIngredients,
      unsuccessfulConversionIngredients,
      sufficientIngredients: completeIngredients,
      insufficientIngredients: [
        ...partialIngredients,
        ...missingIngredients,
        ...noStockIngredients,
        ...unsuccessfulConversionIngredients,
      ],
    };
  }

  /**
   * Calculates the overall completion percentage based on ingredient availability.
   */
  static calculateCompletionPercentage(
    ingredients: AnalyzedIngredient<any>[],
    options?: { originalServings?: number; targetServings?: number },
  ): number {
    if (!ingredients || ingredients.length === 0) return 0;

    const scaleFactor =
      options?.originalServings && options?.targetServings
        ? options.targetServings / options.originalServings
        : 1;

    let totalScore = 0;
    let countedIngredients = 0;

    ingredients.forEach((ingredient) => {
      if (!ingredient.isSuccessConvertion && ingredient.isAvailableInPantry) return;

      const required = (ingredient.measurementValue ?? 0) * scaleFactor;
      const available = ingredient.availableConvertedQuantity ?? 0;

      if (required <= 0) {
        totalScore += 100;
        countedIngredients++;
        return;
      }

      totalScore += Math.min((available / required) * 100, 100);
      countedIngredients++;
    });

    if (countedIngredients === 0) return 0;
    return Math.round((totalScore / countedIngredients) * 100) / 100;
  }
}
