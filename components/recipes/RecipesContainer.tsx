import { searchRecipes } from "@/actions/recipes";
import RecipeCard from "../RecipeCard";

interface RecipesContainerProps {
  searchParams: Record<string, any>;
}

const filterMappings: Record<string, object> = {
  all: {},
  "quick-dinner": {
    mealTypes: ["dinner"],
    totalTime: 30,
    dificulty: "easy",
  },
  "quick-breakfast": {
    mealTypes: ["breakfast"],
    totalTime: 20,
  },
  "few-ingredients": {
    ingredientCount: 5,
  },
  "healthy-lunch": {
    mealTypes: ["lunch"],
    calories: 600, 
  },
  "quick-snack": {
    mealTypes: ["snack"],
    totalTime: 15,
  },
};

export default async function RecipesContainer({
  searchParams,
}: RecipesContainerProps) {

  const { data: recipes } = await searchRecipes({
    ...(filterMappings[searchParams?.category as string] || {}),
    ingredientIds: searchParams?.ingredientIds,
    mealTypes: searchParams?.meal,
    cuisines: searchParams?.cuisine,
    times: searchParams?.time,
    difficulties: searchParams?.difficulty,
  });

  return (
    <section>
      {recipes && recipes?.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,auto))] gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}

      {!recipes ||
        (!recipes?.length && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No se encontraron recetas en esta categoría.
            </p>
          </div>
        ))}
    </section>
  );
}
