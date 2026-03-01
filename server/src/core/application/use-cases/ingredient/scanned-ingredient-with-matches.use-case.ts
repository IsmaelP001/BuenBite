import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import {
    ScannedIngredientWithMatches,
    ScanReceipt,
} from "../../../domain/ia.model";
import { Ingredient } from "../../../domain/ingredients.model";
import { IngredientService } from "../../services/interfaces/ingredient";

@Injectable()
export class ProcessScannedIngredientsUseCase {
  constructor(
    @Inject("IngredientService")
    private ingredientRepository: IngredientService,
  ) {}

  async execute(
    scanResults: ScanReceipt[],
  ): Promise<ScannedIngredientWithMatches[]> {
    const ingredientNames = scanResults.map((item) => item.standardName);

    const allIngredients = await this.ingredientRepository.getAllIngredient({
      ingredientNames,
    });

    return this.mapScannedIngredientsWithMultipleMatches(
      scanResults,
      allIngredients,
    );
  }

  private mapScannedIngredientsWithMultipleMatches(
    scanResults: ScanReceipt[],
    allIngredients: Ingredient[],
  ): ScannedIngredientWithMatches[] {
    return scanResults.map((scannedItem) => {
      const cleanName = scannedItem.standardName.trim();

      const matches = this.findAllMatches(allIngredients, cleanName);

      return {
        id: uuidv4(),
        scannedName: scannedItem.standardName,
        originalText: scannedItem.raw || scannedItem.standardName,
        measurementType: scannedItem.measurementType,
        measurementValue: Number(scannedItem.measurementValue),
        matches: matches.sort((a, b) => b.matchScore - a.matchScore), // Ordenar por mejor puntuación
        hasMatches: matches.length > 0,
      };
    });
  }

  private findAllMatches(
    ingredients: Ingredient[],
    searchTerm: string,
  ): Array<{ ingredient: Ingredient; matchScore: number }> {
    const matches: Array<{ ingredient: Ingredient; matchScore: number }> = [];

    for (const ingredient of ingredients) {
      const names = [
        ingredient.name_en,
        ingredient.name_es,
        ingredient.name_fr,
      ].filter(Boolean) as string[];

      let bestScoreForIngredient = 0;

      for (const name of names) {
        const score = this.calculateMatchScore(searchTerm, name);
        if (score > bestScoreForIngredient) {
          bestScoreForIngredient = score;
        }
      }

      // Incluir solo si hay una coincidencia razonable (score >= 0.5)
      if (bestScoreForIngredient >= 0.5) {
        matches.push({
          ingredient,
          matchScore: bestScoreForIngredient,
        });
      }
    }

    return matches;
  }

  private calculateMatchScore(search: string, target: string): number {
    const searchLower = search.toLowerCase().trim();
    const targetLower = target.toLowerCase().trim();

    // Coincidencia exacta
    if (searchLower === targetLower) return 1.0;

    // El target comienza con el término de búsqueda
    if (targetLower.startsWith(searchLower)) return 0.9;

    // El término de búsqueda comienza con el target (menos probable pero posible)
    if (searchLower.startsWith(targetLower)) return 0.5;

    // El target contiene el término de búsqueda
    if (targetLower.includes(searchLower)) return 0.7;

    return 0;
  }
}
