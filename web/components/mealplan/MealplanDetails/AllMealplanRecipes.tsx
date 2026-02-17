import { ApiClient } from "@/services/apiClient";
import { ChefHat } from "lucide-react";
import Link from "next/link";

export default async function AllMealplanRecipes({ id }: { id: string }) {
  const apiClient = new ApiClient();
  const { data: recipes } =
    await apiClient.mealplanService.getSuggestedMealPlanRecipes(id);
  return (
    <section className="bg-card rounded-2xl p-6 card-shadow">
      <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
        <ChefHat className="h-5 w-5 text-primary" />
        Todas las Recetas del Plan
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {recipes.map(({ recipe }, index) => (
          <Link key={index} href={`/recipes/${recipe?.id}`}>
            <div className="group relative rounded-xl overflow-hidden aspect-square cursor-pointer">
              <img
                src={recipe?.image}
                alt={recipe?.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-background text-sm font-medium line-clamp-2">
                  {recipe?.name}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
