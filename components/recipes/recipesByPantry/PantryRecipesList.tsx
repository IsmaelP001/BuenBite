"use client";
import PantryRecipeCard from "@/components/PantryRecipeCard";
import { Button } from "@/components/ui/button";
import usePantryBasedRecommendedRecipes from "@/hooks/getRecommendedByPantryRecipes";
import { useIntersectionObserver } from "@/hooks/useIntesectionObserver";
import { ChefHat } from "lucide-react";
import Link from "next/link";
import  { useCallback } from "react";

export default function PantryRecipesList() {
  const {
    data: recipes,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = usePantryBasedRecommendedRecipes();

  const handleIntersect = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const observerRef = useIntersectionObserver(
    handleIntersect,
    hasNextPage && !isFetchingNextPage
  );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando recetas...</p>;
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display text-xl font-semibold mb-2">
          No encontramos recetas
        </h3>
        <p className="text-muted-foreground mb-4">
          Intenta cambiar los filtros o agregar más ingredientes a tu despensa
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/pantry">Ir a Despensa</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {recipes.length} receta{recipes.length !== 1 ? "s" : ""} encontrada
          {recipes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <section className="grid grid-cols-2 gap-y-3 gap-x-1 md:gap-x-4 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] ">
        {recipes.map((recipe) => (
          <PantryRecipeCard key={recipe.id} {...recipe} />
        ))}
      </section>

      <div
        ref={observerRef}
        className="h-20 flex items-center justify-center mt-8"
      >
        {isFetchingNextPage && (
          <p className="text-sm text-muted-foreground">
            Cargando más recetas...
          </p>
        )}
      </div>
    </>
  );
}
