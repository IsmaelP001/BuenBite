import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiClient } from "@/services/apiClient";
import { SuggestedMealplanRecipes } from "@/types/models/mealplan";
import {
  Calendar,
  Clock,
  Coffee,
  Flame,
  Moon,
  Sun,
  Sunset,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
const PLAN_DAYS = [
  { label: "Day 1", value: "1" },
  { label: "Day 2", value: "2" },
  { label: "Day 3", value: "3" },
  { label: "Day 4", value: "4" },
  { label: "Day 5", value: "5" },
  { label: "Day 6", value: "6" },
  { label: "Day 7", value: "7" },
];
const getMealIcon = (type: string) => {
  switch (type) {
    case "breakfast":
      return <Sun className="h-4 w-4" />;
    case "lunch":
      return <Sunset className="h-4 w-4" />;
    case "dinner":
      return <Moon className="h-4 w-4" />;
    default:
      return <Coffee className="h-4 w-4" />;
  }
};

const getMealColor = (type: string) => {
  switch (type) {
    case "breakfast":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "lunch":
      return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    case "dinner":
      return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
    default:
      return "bg-muted text-muted-foreground";
  }
};
export default async function RecipesList({ id }: { id: string }) {
  const apiClient = new ApiClient();
  const recipes = await apiClient.mealplanService.getSuggestedMealPlanRecipes(
    id
  );
  const groupedRecipes = recipes.data.reduce<
    Record<number, SuggestedMealplanRecipes[]>
  >((acc, item) => {
    if (!acc[item.dayNumber]) {
      acc[item.dayNumber] = [];
    }
    acc[item.dayNumber].push(item);
    return acc;
  }, {});

  return (
    <section className="bg-card rounded-2xl card-shadow overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Plan por Día
        </h2>
      </div>

      <Tabs defaultValue="1" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-full justify-start p-2 bg-muted/50 rounded-none gap-1">
            {PLAN_DAYS.map((day) => (
              <TabsTrigger
                key={day.value}
                value={day.value}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                {day.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {PLAN_DAYS.map((day) => {
          const dayNumber = Number(day.value);
          const recipesForDay = groupedRecipes[dayNumber] ?? [];

          return (
            <TabsContent key={day.value} value={day.value} className="p-2 mt-0">
              <div className="space-y-4">
                {recipesForDay.length > 0 ? (
                  recipesForDay.map((meal, index) => (
                    <Link
                      key={meal.id ?? index}
                      href={`/recipes/${meal?.recipe?.id}`}
                    >
                      <div className="flex items-center gap-4 py-3 px-2 md:px-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                          <Image
                            src={meal?.recipe.image}
                            alt={meal?.mealType}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border mb-2 ${getMealColor(
                              meal?.mealType
                            )}`}
                          >
                            {getMealIcon(meal.mealType)}
                            {meal.mealType}
                          </div>

                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors ">
                            {meal?.recipe?.name}
                          </h4>

                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {meal?.recipe?.cookTime} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame className="h-3.5 w-3.5" />
                              {meal?.recipe?.calories.toFixed(2)} kcal
                            </span>
                          </div>
                        </div>

                      
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="min-h-[100px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Recetas no disponibles para este día
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total del día:</span>

                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {recipesForDay.reduce(
                        (acc, meal) => acc + (meal?.recipe?.cookTime ?? 0),
                        0
                      )}{" "}
                      min
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <Flame className="h-4 w-4" />
                      {recipesForDay
                        .reduce((acc, meal) => acc + (meal?.recipe?.calories ?? 0), 0)
                        .toFixed(2)}{" "}
                      kcal
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
}
