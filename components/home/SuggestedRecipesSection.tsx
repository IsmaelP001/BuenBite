import RecipeCard from "../RecipeCard";
import HorizontalScrollList from "../HorizontalScrollList";
import { ApiClient } from "@/services/apiClient";

export default async function SuggestedRecipesSection() {
  const apiClient = new ApiClient();
  const { data: recipes } = await apiClient.recipeService.getRecipes({
    page: 1,
    limit: 15,
  });

  return (
    <HorizontalScrollList
      data={recipes || []}
      title="Mas recetas"
      subTitle={{
        href: "/recipes",
        text: "Ver Mas",
      }}
      renderItem={(recipe) => {
        return (
          <div className="w-[220px] md:w-[300px]">
            <RecipeCard {...recipe} />
          </div>
        );
      }}
    />
  );
}
