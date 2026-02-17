import HorizontalScrollList from "../HorizontalScrollList";
import RecipeCard from "../RecipeCard";
import { getCommunityRecipes } from "@/actions/recipes";

export default async function CommuntyRecipesSection() {
  const recipes = await getCommunityRecipes();
  return (
    <HorizontalScrollList
      data={recipes?.data || []}
      title="Recetas de la Comunidad"
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
