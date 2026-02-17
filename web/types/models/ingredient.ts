export interface Ingredient {
  id: string;
  name_en: string;
  name_es: string;
  name_fr: string;
  alias: string[];
  image: string;
  notes?: string;
  category: string;
  calories_100g: number;
  protein_100g: number;
  fat_100g: number;
  carbohydrates_100g: number;
  conversions: {
    allowed_units: string[];
    density: number;
    volume_per_unit: Record<string, number>;
    weight_per_unit: Record<string, number>;
  };
}




export interface CreateIngredientDto {
  name_es: string;
  name_en: string;
  name_fr: string;
  category: string;
  calories_100g?: number;
  protein_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number
}


export interface FilterIngredients{
  query?:string;
  limit?:number;
}