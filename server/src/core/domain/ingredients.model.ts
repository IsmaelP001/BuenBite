export interface Ingredient {
  id: string;
  name_es: string;
  name_en: string;
  name_fr: string;
  category: string;
  image?: string | null;
  notes?: string | null;
  alias: string[];
  calories_100g: number;
  isApproved:boolean;
  protein_100g: number;
  fat_100g: number;
  carbohydrates_100g: number;
  creationType: 'scan' | 'admin' | 'unregister'
  conversions?: {
    density: number;
    weight_per_unit: Record<string, number>;
    volume_per_unit: Record<string, number>;
    allowed_units: string[];
    default_unit:string;
  };
}

export type IngredientCategory =
  | "meats"
  | "seafood"
  | "dairy"
  | "grains"
  | "legumes"
  | "flours_and_sugars"
  | "spices"
  | "herbs"
  | "condiments_and_sauces"
  | "vegetables"
  | "fruits"
  | "nuts_and_seeds"
  | "bakery_and_pastry"
  | "eggs_and_derivatives"
  | "oils_and_fats"
  | "beverages_non_alcoholic"
  | "beverages_alcoholic"
  | "supplements_and_vitamins"
  | "desserts_and_sweets"
  | "frozen_foods"
  | "canned_goods"
  | "ready_to_eat"
  | "unregistered"
  | "all";




export interface IngredientsFilter {
  ingredientIds?: string[];
  limit?: number;
  isFilterActive?: boolean;
  ingredientName?: string;
  ingredientNames?: string[];
}
export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  product_name_en?: string;
  product_name_es?: string;
  product_name_fr?: string;
  image_url?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    "energy-kj_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    sugars_100g?: number;
    fat_100g?: number;
    "saturated-fat_100g"?: number;
    fiber_100g?: number;
    sodium_100g?: number;
    salt_100g?: number;
  };
  categories_tags?: string[];
  allergens_tags?: string[];
}


export const DEFAULT_UNITS_BY_CATEGORY: Record<IngredientCategory, string[]> = {
  meats: ['gram', 'kilogram', 'pound', 'ounce'],
  seafood: ['gram', 'kilogram', 'pound', 'ounce'],
  dairy: ['milliliter', 'liter', 'gram', 'kilogram'],
  grains: ['gram', 'kilogram', 'ounce', 'pound'],
  legumes: ['gram', 'kilogram', 'ounce', 'pound'],
  flours_and_sugars: ['gram', 'kilogram', 'ounce', 'pound'],
  spices: ['gram', 'milligram', 'ounce'],
  herbs: ['gram', 'ounce'],
  condiments_and_sauces: ['milliliter', 'liter', 'gram', 'kilogram'],
  vegetables: ['gram', 'kilogram', 'ounce', 'pound'],
  fruits: ['gram', 'kilogram', 'ounce', 'pound'],
  nuts_and_seeds: ['gram', 'kilogram', 'ounce'],
  bakery_and_pastry: ['gram', 'kilogram', 'ounce'],
  eggs_and_derivatives: ['gram', 'kilogram'],
  oils_and_fats: ['milliliter', 'liter', 'gram'],
  beverages_non_alcoholic: ['milliliter', 'liter'],
  beverages_alcoholic: ['milliliter', 'liter'],
  supplements_and_vitamins: ['gram', 'milligram'],
  desserts_and_sweets: ['gram', 'kilogram', 'ounce'],
  frozen_foods: ['gram', 'kilogram', 'ounce', 'pound'],
  canned_goods: ['gram', 'kilogram', 'milliliter', 'liter'],
  ready_to_eat: ['gram', 'kilogram', 'ounce'],
  unregistered: ['gram', 'kilogram', 'milliliter', 'liter'],
  all: ['gram', 'kilogram', 'milliliter', 'liter', 'ounce', 'pound'],
};
