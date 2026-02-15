import HorizontalScrollList from "../HorizontalScrollList";
import { getPantryBasedRecommendedRecipes } from "@/actions/recipes";
import PantryRecipeCard from "../PantryRecipeCard";
import { getQueryClient } from "@/lib/queryClient";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function PantryBasedRecommendedRecipesSection() {
  const queryClient = getQueryClient();
  const recipes = await queryClient.fetchQuery({
    queryKey: ["pantry_based_recommended_recipes"],
    queryFn: async () => await getPantryBasedRecommendedRecipes({}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HorizontalScrollList
        data={recipes.data || []}
        title="Sugeridas por tu despensa"
        subTitle={{
          href: "/recipes/suggested-by-pantry",
          text: "Ver Mas",
        }}
        renderItem={(recipe) => {
          return (
            <div className="w-[220px] md:w-[300px]">
              <PantryRecipeCard {...recipe} />
            </div>
          );
        }}
      />
    </HydrationBoundary>
  );
}
