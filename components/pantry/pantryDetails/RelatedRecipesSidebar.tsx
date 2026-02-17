'use client'
import useGetIngredientRelatedRecipes from "@/hooks/useGetIngredientRelatedRecipes";
import { ChefHat, Clock, Users, Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function RelatedRecipesSidebar() {
  const { id } = useParams();
  const { data: recipesRelated } = useGetIngredientRelatedRecipes({
    ingredientId: id as string,
  });
  
  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24 space-y-6">
        {/* Related Recipes */}
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">
              Recetas Relacionadas
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Recetas que usan este ingrediente
          </p>

          {recipesRelated && recipesRelated.length > 0 ? (
            <div className="space-y-6">
              {recipesRelated.map((recipe) => (
                <Link href={`/recipes/${recipe.id}`} key={recipe.id}>
                  <div className="flex gap-3 w-full text-left p-3 mb-2 rounded-lg border border-border hover:border-primary transition-colors group">
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1 truncate group-hover:text-primary transition-colors">
                        {recipe.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.totalTime}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {recipe.servings}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No hay recetas disponibles
              </p>
              <p className="text-xs text-muted-foreground">
                Aún no hay recetas que usen este ingrediente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}