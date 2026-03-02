import { HttpClient } from "@/lib/http/httpClient";
import { IngredientsService } from "./api/ingredientsService";
import { PantryService } from "./api/pantryService";
import { PurchaseService } from "./api/purchasesService";
import { RecipeService } from "./api/recepiesService";
import { UserService } from "./api/userService";
import { MealplanService } from "./api/mealplanService";
import { SocialService } from "./api/socialService";
import { GamificationService } from "./api/gamificationService";
import { createSupabaseClient } from "@/lib/supabase/client";

export class ApiClient {
  public ingredientService: IngredientsService;
  public pantryService: PantryService;
  public recipeService: RecipeService;
  public purchaseService: PurchaseService;
  public userService: UserService;
  public mealplanService: MealplanService;
  public socialService: SocialService;
  public gamificationService: GamificationService;

  constructor() {
    const httpClient = new HttpClient();
    this.ingredientService = new IngredientsService(httpClient);
    this.pantryService = new PantryService(httpClient);
    this.purchaseService = new PurchaseService(httpClient);
    this.recipeService = new RecipeService(httpClient);
    this.userService = new UserService(httpClient);
    this.mealplanService = new MealplanService(httpClient);
    this.socialService = new SocialService(httpClient);
    this.gamificationService = new GamificationService(httpClient);
  }

  async initialize() {
    const supabase = createSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id ?? "";

    return userId;
  }
}

export function useHttpApiClient(): ApiClient {
  return new ApiClient();
}

export async function createApiClient() {
  return new ApiClient();
}
