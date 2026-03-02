import { HttpClient } from "@/lib/http/httpClient";
import { CreateIngredientDto, FilterIngredients, Ingredient } from "@/types/models/ingredient";
import { User } from "@supabase/supabase-js";

const api_url = "http://localhost:3001";
export default async function getIngredients() {
  const res = await fetch(`${api_url}/api/ingredients`);
  const json = await res.json();
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error ${res.status}: ${errorText}`);
  }
  return json;
}

export class IngredientsService {
  constructor(private httpClient: HttpClient ) {}

  async getIngredients(filter?:FilterIngredients) {
    return await this.httpClient.get<Ingredient[]>(`ingredients`,{queryParams:filter ?? {} as any});
  }

   async getFilterActiveIngredients() {
    return await this.httpClient.get<any>(`ingredients/filter-active`);
  }

  async create(data:CreateIngredientDto) {
    return await this.httpClient.post<Ingredient>(`ingredients`,data);
  }
}
