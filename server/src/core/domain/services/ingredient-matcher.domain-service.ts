/**
 * Domain Service: IngredientMatcher
 *
 * Pure domain logic for matching scanned ingredient names against a known ingredient list.
 * No framework dependencies.
 */
import { Ingredient } from '../ingredients.model';

export interface MatchResult {
  ingredient: Ingredient;
  score: number;
}

export class IngredientMatcherDomainService {
  /**
   * Calculates a fuzzy match score between two strings.
   * Returns 0–1 where 1 is an exact match.
   */
  static calculateMatchScore(search: string, target: string): number {
    const searchLower = search.toLowerCase().trim();
    const targetLower = target.toLowerCase().trim();

    if (searchLower === targetLower) return 1.0;
    if (targetLower.startsWith(searchLower)) return 0.9;
    if (searchLower.startsWith(targetLower)) return 0.5;
    if (targetLower.includes(searchLower)) return 0.7;

    return 0;
  }

  /**
   * Finds the single best matching ingredient for a given search term.
   */
  static findBestMatch(ingredients: Ingredient[], searchTerm: string): MatchResult | null {
    let bestMatch: Ingredient | null = null;
    let bestScore = 0;

    for (const ingredient of ingredients) {
      const names = [ingredient.name_en, ingredient.name_es, ingredient.name_fr].filter(Boolean) as string[];
      for (const name of names) {
        const score = this.calculateMatchScore(searchTerm, name);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = ingredient;
        }
      }
    }

    return bestScore >= 0.5 && bestMatch ? { ingredient: bestMatch, score: bestScore } : null;
  }

  /**
   * Finds all ingredients that match the search term above the threshold.
   */
  static findAllMatches(
    ingredients: Ingredient[],
    searchTerm: string,
    threshold = 0.5,
  ): Array<{ ingredient: Ingredient; matchScore: number }> {
    const matches: Array<{ ingredient: Ingredient; matchScore: number }> = [];

    for (const ingredient of ingredients) {
      const names = [ingredient.name_en, ingredient.name_es, ingredient.name_fr].filter(Boolean) as string[];
      let bestScoreForIngredient = 0;

      for (const name of names) {
        const score = this.calculateMatchScore(searchTerm, name);
        if (score > bestScoreForIngredient) {
          bestScoreForIngredient = score;
        }
      }

      if (bestScoreForIngredient >= threshold) {
        matches.push({ ingredient, matchScore: bestScoreForIngredient });
      }
    }

    return matches;
  }

  /**
   * Filters a list of ingredients by various criteria.
   */
  static filterIngredients(ingredients: Ingredient[], filter: {
    ingredientIds?: string[];
    ingredientName?: string;
    limit?: number;
  }): Ingredient[] {
    let results = [...ingredients];

    if (filter.ingredientIds?.length) {
      const idSet = new Set(filter.ingredientIds);
      results = results.filter((i) => idSet.has(i.id));
    }

    if (filter.ingredientName?.trim()) {
      const scored = results.map((ingredient) => {
        const names = [ingredient.name_en, ingredient.name_es, ingredient.name_fr].filter(Boolean) as string[];
        let bestScore = 0;
        for (const name of names) {
          const score = this.calculateMatchScore(filter.ingredientName!, name);
          if (score > bestScore) bestScore = score;
        }
        return { ingredient, score: bestScore };
      });

      results = scored
        .filter((item) => item.score >= 0.5)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.ingredient);
    }

    if (filter.limit && filter.limit > 0) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }
}
