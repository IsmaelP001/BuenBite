import HorizontalScrollList from "../HorizontalScrollList";
import { CalendarDays } from "lucide-react";
import { getUserRecipesFromPantry } from "@/actions/recipes";
import PantryRecipeCard from "../PantryRecipeCard";

export default async function UserRecipesSection() {
  const recipes = await getUserRecipesFromPantry();
  return (
    <HorizontalScrollList
      data={recipes.data || []}
      titleIcon={CalendarDays}
      title="Tus recetas"
      subTitle={{
        href: "/recipes",
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
  );
}
