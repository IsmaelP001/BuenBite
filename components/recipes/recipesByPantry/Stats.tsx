import { Skeleton } from "@/components/ui/skeleton";
import usePantryBasedRecommendedRecipes, {
  completitionValue,
} from "@/hooks/getRecommendedByPantryRecipes";
import useGetPantryItems from "@/hooks/useGetPantryItems";
import { AlertCircle, CheckCircle, Package } from "lucide-react";
import React from "react";

export default function Stats() {
  const { data: recipes, isPending: isPendingRecipes } =
    usePantryBasedRecommendedRecipes();
  const { pantryItems, isPending: isPendingPantry } = useGetPantryItems({});

  const stats = React.useMemo(() => {
    let complete = 0;
    let almost = 0;

    recipes?.forEach((recipe) => {
      const completition = completitionValue(recipe);
      if (completition > 98) {
        complete += 1;
      } else if (completition > 0 && completition < 98) {
        almost += 1;
      }
    });

    return { complete, almost };
  }, [recipes]);

  if (isPendingPantry || isPendingRecipes) {
    return (
      <div className="flex gap-3 justify-between items-center mb-5">
        <Skeleton className="h-20 flex-1 rounded-2xl" />
        <Skeleton className="h-20 flex-1 rounded-2xl" />
        <Skeleton className="h-20 flex-1 rounded-2xl" />
      </div>
    );
  }

  return (
  <section className="mb-5 grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
  {/* Card 1 */}
  <div className="bg-card rounded-xl p-4 border border-border/50">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">
        <CheckCircle className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-primary">
          {stats.complete}
        </p>
        <p className="text-sm text-muted-foreground">Recetas listas</p>
      </div>
    </div>
  </div>

  {/* Card 2 */}
  <div className="bg-card rounded-xl p-4 border border-border/50">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-amber-500/10">
        <AlertCircle className="h-5 w-5 text-amber-500" />
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold text-primary">
          {stats.complete}
        </p>
        <p className="text-sm text-muted-foreground">Casi listas</p>
      </div>
    </div>
  </div>

  {/* Card 3 → full width on mobile */}
  <div className="col-span-2 sm:col-span-1 bg-card rounded-xl p-4 border border-border/50">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-muted">
        <Package className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xl md:text-2xl font-bold">
          {pantryItems?.length ?? 0}
        </p>
        <p className="text-sm text-muted-foreground">
          Ingredientes en despensa
        </p>
      </div>
    </div>
  </div>
</section>

  );
}
