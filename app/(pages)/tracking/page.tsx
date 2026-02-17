import { format } from "date-fns";
import { es } from "date-fns/locale";
import NutritionSummary from "@/components/tracking/NutritionSummary";
import HorizontalCalendarContainer from "@/components/tracking/HorizontalCalendarContainer";
import MealSectionContainer from "@/components/tracking/MealSectionContainer";
import MaxWidthWrapper from "@/components/MaxWithWrapper";
export type MealTypeEn =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "dessert"
  | "snack"
  | "drink"
  | "all";

export interface WeeklyMealRecipe {
  recipeName: string;
  calories: number;
  fats: number;
  carbs: number;
  protein: number;
  quantity: number;
  scheduledTime: string;
  recipeId?: string;
  mealPlanEntryId?: string;
  image: string;
}

export interface WeeklyMealDay {
  label: string;
  value: MealTypeEn;
  recipes: WeeklyMealRecipe[];
}

export default async function CalorieTracking() {
  return (
    <MaxWidthWrapper>
      <div className="min-h-screen bg-background">
        <main className="py-4">
          <div className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Seguimiento de Calorías
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", {
                locale: es,
              })}
            </p>
          </div>

          <HorizontalCalendarContainer />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <MealSectionContainer />

            <div className="space-y-6">
              <NutritionSummary />
            </div>
          </div>
        </main>
      </div>
    </MaxWidthWrapper>
  );
}
