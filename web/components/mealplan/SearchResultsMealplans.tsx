import { getAllSuggestedMealPlans } from "@/actions/mealplan";
import MealPlanCard from "../MealplanCard";
import { ApiClient } from "@/services/apiClient";

const filterMappings: Record<string, object> = {
  all: {},
  keto: { dietType: "keto" },
  mediterranean: { dietType: "mediterranean" },
  balanced: { dietType: "balanced" },
  vegetarian: { dietType: "vegetarian" },
  "high-Protein": { dietType: "high-Protein" },
  vegan: { dietType: "vegan" },
  lose_weight: { suitableForGoals: "lose_weight" },
  maintain_weight: { suitableForGoals: "maintain_weight" },
  gain_weight: { suitableForGoals: "gain_weight" },
  build_muscle: { suitableForGoals: "build_muscle" },
};

interface SearchResultsMealplansProps {
  category?: string;
  query?:string;
}

export default async function SearchResultsMealplans({
  category,
  query
}: SearchResultsMealplansProps) {

  const {data} = await getAllSuggestedMealPlans( { ...(category ? filterMappings[category] : {}),query:query ?? "" })

  if (!data || (!data?.length )) {
    return (
      <div className="min-h-[200px]  w-full grid place-content-center">
        <p className="text-muted-foreground mb-4 block mx-auto">
          No se encontraron resultados.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2 className="font-display text-xl font-semibold">
          {data.length} planes encontrados
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,auto))] gap-3">
          {data?.map((item) => (
            <MealPlanCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
