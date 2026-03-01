


const NUTRITION_PROFILES = {
  meats: {
    calories: 250, protein: 26, carbs: 0, fat: 16, fiber: 0, sugar: 0,
    sodium: 75, potassium: 350, calcium: 15, iron: 2.5, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 6, trans_fat: 0, cholesterol: 80, magnesium: 25, phosphorus: 200,
    zinc: 4.5, folate: 5, niacin: 6, riboflavin: 0.2, thiamine: 0.1, vitamin_b6: 0.4,
    vitamin_b12: 2.5, vitamin_d: 0, vitamin_e: 0.5, vitamin_k: 0
  },
  seafood: {
    calories: 130, protein: 25, carbs: 0, fat: 3, fiber: 0, sugar: 0,
    sodium: 120, potassium: 400, calcium: 30, iron: 1.2, vitamin_c: 0, vitamin_a: 15,
    saturated_fat: 0.8, trans_fat: 0, cholesterol: 55, magnesium: 35, phosphorus: 250,
    zinc: 1.5, folate: 8, niacin: 5, riboflavin: 0.1, thiamine: 0.1, vitamin_b6: 0.4,
    vitamin_b12: 4, vitamin_d: 10, vitamin_e: 1, vitamin_k: 0
  },
  dairy: {
    calories: 60, protein: 3.2, carbs: 4.7, fat: 3.2, fiber: 0, sugar: 4.7,
    sodium: 44, potassium: 150, calcium: 113, iron: 0.1, vitamin_c: 0, vitamin_a: 46,
    saturated_fat: 2, trans_fat: 0, cholesterol: 10, magnesium: 10, phosphorus: 84,
    zinc: 0.4, folate: 5, niacin: 0.1, riboflavin: 0.2, thiamine: 0.04, vitamin_b6: 0.04,
    vitamin_b12: 0.5, vitamin_d: 1, vitamin_e: 0.1, vitamin_k: 0
  },
  grains: {
    calories: 365, protein: 13, carbs: 77, fat: 2.5, fiber: 12, sugar: 1,
    sodium: 2, potassium: 363, calcium: 29, iron: 3.2, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 0.4, trans_fat: 0, cholesterol: 0, magnesium: 126, phosphorus: 288,
    zinc: 2.7, folate: 38, niacin: 5.1, riboflavin: 0.1, thiamine: 0.4, vitamin_b6: 0.3,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0.7, vitamin_k: 2
  },
  legumes: {
    calories: 347, protein: 22, carbs: 63, fat: 1.2, fiber: 15, sugar: 2,
    sodium: 2, potassium: 1196, calcium: 46, iron: 6.7, vitamin_c: 1, vitamin_a: 0,
    saturated_fat: 0.2, trans_fat: 0, cholesterol: 0, magnesium: 140, phosphorus: 281,
    zinc: 3.0, folate: 394, niacin: 2.1, riboflavin: 0.2, thiamine: 0.5, vitamin_b6: 0.5,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0.7, vitamin_k: 5
  },
  flours_and_sugars: {
    calories: 364, protein: 10, carbs: 76, fat: 1, fiber: 2.7, sugar: 0.3,
    sodium: 2, potassium: 107, calcium: 15, iron: 1.2, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 0.2, trans_fat: 0, cholesterol: 0, magnesium: 22, phosphorus: 108,
    zinc: 0.7, folate: 26, niacin: 1.7, riboflavin: 0.04, thiamine: 0.1, vitamin_b6: 0.04,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0.1, vitamin_k: 0
  },
  spices: {
    calories: 250, protein: 12, carbs: 50, fat: 6, fiber: 25, sugar: 8,
    sodium: 25, potassium: 1500, calcium: 600, iron: 15, vitamin_c: 20, vitamin_a: 300,
    saturated_fat: 2, trans_fat: 0, cholesterol: 0, magnesium: 200, phosphorus: 150,
    zinc: 3, folate: 50, niacin: 4, riboflavin: 0.3, thiamine: 0.2, vitamin_b6: 0.5,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 5, vitamin_k: 100
  },
  herbs: {
    calories: 40, protein: 3, carbs: 8, fat: 0.5, fiber: 4, sugar: 1,
    sodium: 15, potassium: 400, calcium: 200, iron: 5, vitamin_c: 50, vitamin_a: 400,
    saturated_fat: 0.1, trans_fat: 0, cholesterol: 0, magnesium: 50, phosphorus: 40,
    zinc: 1, folate: 100, niacin: 1, riboflavin: 0.2, thiamine: 0.1, vitamin_b6: 0.2,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 2, vitamin_k: 400
  },
  condiments_and_sauces: {
    calories: 90, protein: 2, carbs: 15, fat: 3, fiber: 1, sugar: 12,
    sodium: 800, potassium: 200, calcium: 20, iron: 0.5, vitamin_c: 5, vitamin_a: 10,
    saturated_fat: 0.5, trans_fat: 0, cholesterol: 0, magnesium: 10, phosphorus: 20,
    zinc: 0.2, folate: 5, niacin: 0.5, riboflavin: 0.02, thiamine: 0.02, vitamin_b6: 0.05,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0.5, vitamin_k: 5
  },
  vegetables: {
    // Promedio ponderado de vegetables_leafy, vegetables_root, vegetables_cruciferous
    calories: 28, protein: 2.5, carbs: 5.5, fat: 0.3, fiber: 2.6, sugar: 2.5,
    sodium: 46, potassium: 391, calcium: 59, iron: 1.4, vitamin_c: 42, vitamin_a: 217,
    saturated_fat: 0.09, trans_fat: 0, cholesterol: 0, magnesium: 40, phosphorus: 48,
    zinc: 0.4, folate: 92, niacin: 0.6, riboflavin: 0.12, thiamine: 0.08, vitamin_b6: 0.17,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 1.2, vitamin_k: 200
  },
  fruits: {
    // Promedio ponderado de fruits_citrus, fruits_berries, fruits_stone, fruits_tropical
    calories: 51, protein: 1.0, carbs: 13, fat: 0.3, fiber: 2.0, sugar: 10,
    sodium: 0.5, potassium: 173, calcium: 19, iron: 0.3, vitamin_c: 39, vitamin_a: 21,
    saturated_fat: 0.04, trans_fat: 0, cholesterol: 0, magnesium: 14, phosphorus: 20,
    zinc: 0.1, folate: 28, niacin: 0.6, riboflavin: 0.04, thiamine: 0.05, vitamin_b6: 0.06,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0.6, vitamin_k: 7
  },
  nuts_and_seeds: {
    calories: 607, protein: 20, carbs: 16, fat: 54, fiber: 9, sugar: 4,
    sodium: 7, potassium: 705, calcium: 269, iron: 3.7, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 4.5, trans_fat: 0, cholesterol: 0, magnesium: 268, phosphorus: 481,
    zinc: 3.1, folate: 82, niacin: 3.6, riboflavin: 1.1, thiamine: 0.6, vitamin_b6: 0.1,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 25, vitamin_k: 0
  },
  bakery_and_pastry: {
    calories: 300, protein: 8, carbs: 55, fat: 6, fiber: 2, sugar: 20,
    sodium: 400, potassium: 100, calcium: 80, iron: 2, vitamin_c: 0, vitamin_a: 20,
    saturated_fat: 2, trans_fat: 0.1, cholesterol: 30, magnesium: 20, phosphorus: 100,
    zinc: 0.7, folate: 50, niacin: 3, riboflavin: 0.2, thiamine: 0.3, vitamin_b6: 0.05,
    vitamin_b12: 0.1, vitamin_d: 0, vitamin_e: 1, vitamin_k: 5
  },
  eggs_and_derivatives: {
    // Basado en la categoría anterior "eggs"
    calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1,
    sodium: 124, potassium: 138, calcium: 50, iron: 1.2, vitamin_c: 0, vitamin_a: 149,
    saturated_fat: 3.1, trans_fat: 0, cholesterol: 373, magnesium: 10, phosphorus: 172,
    zinc: 1.0, folate: 44, niacin: 0.1, riboflavin: 0.5, thiamine: 0.07, vitamin_b6: 0.1,
    vitamin_b12: 1.1, vitamin_d: 2, vitamin_e: 1, vitamin_k: 0
  },
  oils_and_fats: {
    calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sugar: 0,
    sodium: 0, potassium: 0, calcium: 0, iron: 0, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 13, trans_fat: 0, cholesterol: 0, magnesium: 0, phosphorus: 0,
    zinc: 0, folate: 0, niacin: 0, riboflavin: 0, thiamine: 0, vitamin_b6: 0,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 14, vitamin_k: 60
  },
  beverages_non_alcoholic: {
    calories: 42, protein: 0, carbs: 11, fat: 0.1, fiber: 0, sugar: 11,
    sodium: 4, potassium: 6, calcium: 2, iron: 0.1, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 0, trans_fat: 0, cholesterol: 0, magnesium: 1, phosphorus: 2,
    zinc: 0, folate: 0, niacin: 0, riboflavin: 0, thiamine: 0, vitamin_b6: 0,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0, vitamin_k: 0
  },
  beverages_alcoholic: {
    calories: 150, protein: 0.5, carbs: 4, fat: 0, fiber: 0, sugar: 1,
    sodium: 10, potassium: 50, calcium: 10, iron: 0.1, vitamin_c: 0, vitamin_a: 0,
    saturated_fat: 0, trans_fat: 0, cholesterol: 0, magnesium: 10, phosphorus: 20,
    zinc: 0.1, folate: 5, niacin: 0.5, riboflavin: 0.02, thiamine: 0.01, vitamin_b6: 0.05,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0, vitamin_k: 0
  },
  supplements_and_vitamins: {
    calories: 100, protein: 20, carbs: 10, fat: 1, fiber: 5, sugar: 2,
    sodium: 50, potassium: 200, calcium: 500, iron: 10, vitamin_c: 100, vitamin_a: 500,
    saturated_fat: 0.2, trans_fat: 0, cholesterol: 0, magnesium: 200, phosphorus: 300,
    zinc: 5, folate: 200, niacin: 10, riboflavin: 1, thiamine: 1, vitamin_b6: 1,
    vitamin_b12: 10, vitamin_d: 10, vitamin_e: 10, vitamin_k: 50
  },
  desserts_and_sweets: {
    calories: 350, protein: 4, carbs: 70, fat: 8, fiber: 2, sugar: 60,
    sodium: 150, potassium: 80, calcium: 50, iron: 1, vitamin_c: 0, vitamin_a: 10,
    saturated_fat: 4, trans_fat: 0.1, cholesterol: 20, magnesium: 20, phosphorus: 60,
    zinc: 0.5, folate: 10, niacin: 1, riboflavin: 0.1, thiamine: 0.1, vitamin_b6: 0.02,
    vitamin_b12: 0.1, vitamin_d: 0, vitamin_e: 0.5, vitamin_k: 2
  },
  frozen_foods: {
    calories: 120, protein: 8, carbs: 15, fat: 3, fiber: 3, sugar: 8,
    sodium: 300, potassium: 200, calcium: 40, iron: 1.5, vitamin_c: 15, vitamin_a: 100,
    saturated_fat: 1, trans_fat: 0, cholesterol: 10, magnesium: 25, phosphorus: 80,
    zinc: 0.8, folate: 30, niacin: 2, riboflavin: 0.1, thiamine: 0.1, vitamin_b6: 0.1,
    vitamin_b12: 0.2, vitamin_d: 0, vitamin_e: 1, vitamin_k: 10
  },
  canned_goods: {
    calories: 80, protein: 5, carbs: 12, fat: 1.5, fiber: 4, sugar: 6,
    sodium: 400, potassium: 250, calcium: 30, iron: 2, vitamin_c: 8, vitamin_a: 50,
    saturated_fat: 0.3, trans_fat: 0, cholesterol: 0, magnesium: 30, phosphorus: 50,
    zinc: 0.6, folate: 25, niacin: 1.5, riboflavin: 0.08, thiamine: 0.08, vitamin_b6: 0.08,
    vitamin_b12: 0, vitamin_d: 0, vitamin_e: 0.5, vitamin_k: 8
  },
  ready_to_eat: {
    calories: 180, protein: 12, carbs: 20, fat: 6, fiber: 3, sugar: 8,
    sodium: 600, potassium: 300, calcium: 60, iron: 2, vitamin_c: 10, vitamin_a: 80,
    saturated_fat: 2, trans_fat: 0, cholesterol: 25, magnesium: 35, phosphorus: 120,
    zinc: 1.2, folate: 40, niacin: 4, riboflavin: 0.2, thiamine: 0.2, vitamin_b6: 0.2,
    vitamin_b12: 0.5, vitamin_d: 0, vitamin_e: 1.2, vitamin_k: 15
  },
  unregistered: {
    // Valores promedio genéricos para productos no registrados
    calories: 100, protein: 5, carbs: 15, fat: 2, fiber: 2, sugar: 5,
    sodium: 100, potassium: 200, calcium: 50, iron: 1, vitamin_c: 5, vitamin_a: 50,
    saturated_fat: 0.5, trans_fat: 0, cholesterol: 5, magnesium: 25, phosphorus: 75,
    zinc: 0.5, folate: 20, niacin: 2, riboflavin: 0.1, thiamine: 0.1, vitamin_b6: 0.1,
    vitamin_b12: 0.2, vitamin_d: 0, vitamin_e: 0.5, vitamin_k: 5
  }
};

export const foodCategories = {
  meats: 'Carnes',
  seafood: 'Pescados y Mariscos',
  dairy: 'Lácteos',
  grains: 'Granos, Arroces y Pastas',
  legumes: 'Legumbres',
  flours_and_sugars: 'Harinas y Azúcares',
  spices: 'Especias',
  herbs: 'Hierbas',
  condiments_and_sauces: 'Condimentos y Salsas',
  vegetables: 'Verduras',
  fruits: 'Frutas',
  nuts_and_seeds: 'Frutos Secos y Semillas',
  bakery_and_pastry: 'Productos de Panadería y Repostería',
  eggs_and_derivatives: 'Huevos y Derivados',
  oils_and_fats: 'Aceites y Grasas',
  beverages_non_alcoholic: 'Bebidas No Alcohólicas',
  beverages_alcoholic: 'Bebidas Alcohólicas',
  supplements_and_vitamins: 'Suplementos y Vitaminas',
  desserts_and_sweets: 'Postres y Dulces',
  frozen_foods: 'Alimentos Congelados',
  canned_goods: 'Enlatados',
  ready_to_eat: 'Comidas Preparadas',
  unregistered: 'Sin registrar'
} as const;


export type FoodCategory = keyof typeof foodCategories;

export interface NutritionProfile {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  potassium: number;
  calcium: number;
  iron: number;
  vitamin_c: number;
  vitamin_a: number;
  saturated_fat: number;
  trans_fat: number;
  cholesterol: number;
  magnesium: number;
  phosphorus: number;
  zinc: number;
  folate: number;
  niacin: number;
  riboflavin: number;
  thiamine: number;
  vitamin_b6: number;
  vitamin_b12: number;
  vitamin_d: number;
  vitamin_e: number;
  vitamin_k: number;
}

export type NutritionTotals = Record<keyof NutritionProfile, number>;



export interface IngredientInput {
  category: FoodCategory;
  quantity: number; 
}

export class NutritionCalculator {
  static calculateSingle(category: FoodCategory, quantity: number): NutritionProfile {
    const profile = NUTRITION_PROFILES[category];
    const factor = quantity / 100;

    const result: Partial<NutritionProfile> = {};
    for (const nutrient in profile) {
      const key = nutrient as keyof NutritionProfile;
      result[key] = parseFloat((profile[key] * factor).toFixed(2));
    }

    return result as NutritionProfile;
  }

  static calculateMultiple(ingredients: IngredientInput[]): NutritionTotals {
    const totals: Partial<NutritionTotals> = {};

    for (const key in NUTRITION_PROFILES.meats) {
      const nutrient = key as keyof NutritionProfile;
      totals[nutrient] = 0;
    }

    ingredients.forEach(({ category, quantity }) => {
      const values = this.calculateSingle(category, quantity);
      for (const key in values) {
        const nutrient = key as keyof NutritionProfile;
        totals[nutrient]! += values[nutrient];
      }
    });

    // Redondear
    for (const key in totals) {
      const nutrient = key as keyof NutritionProfile;
      totals[nutrient] = parseFloat(totals[nutrient]!.toFixed(2));
    }

    return totals as NutritionTotals;
  }

  static getCategories(): typeof foodCategories {
    return foodCategories;
  }
}

