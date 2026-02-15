"use client";
import PurchaseConfirmationModal from "@/components/purchases/PurchaseConfirmationModal";
import QuantityInput from "@/components/QuantityInput";

import IngredientAvailabilityCard from "@/components/recipes/IngredientAvailabilityCard";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useGetSuggestedMealplanIngredients from "@/hooks/useGetSuggestedMealplanIngredients";
import { useAuth } from "@/lib/context/authContext";
import { SuggestedMealIngredients } from "@/types/models/mealplan";

import { Download, Printer, ShoppingCart } from "lucide-react";

export default function IngredientList({ id }: { id: string }) {
  const {
    ingredientsByCategory,
    ingredientsList,
    servings,
    updateServingValue,
    completionPercentage,
    completeIngredientsCount,
    missingIngredientsCount,
    partialIngredientsCount,
  } = useGetSuggestedMealplanIngredients({
    id,
  });

  const { user } = useAuth();

  return (
    <section className="bg-card rounded-2xl p-6 card-shadow sticky top-20 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Lista de Compras
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold">Porciones</p>
        <QuantityInput
          value={servings}
          size="sm"
          onChange={(val) => updateServingValue(val)}
        />
      </div>

      {user && (
        <div className="mb-2 p-4 rounded-xl bg-muted/50 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completado</span>
            <span className="text-sm font-semibold text-primary">
              {completionPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs text-muted-foreground">
                Completos: {completeIngredientsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span className="text-xs text-muted-foreground">
                Parciales: {partialIngredientsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">
                Faltantes: {missingIngredientsCount}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(ingredientsByCategory)?.map(
          ([category, ingredients]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {ingredients?.map((ingredient) => {
                  return (
                    <IngredientAvailabilityCard
                      key={`mealplan-ingredient-${ingredient.ingredientId}`}
                      ingredient={ingredient}
                    />
                  );
                })}
              </div>
            </div>
          ),
        )}
      </div>

      <div className="mt-1">
        <PurchaseConfirmationModal<SuggestedMealIngredients>
          type="MEALPLAN"
          initialItems={ingredientsList}
        />
      </div>
    </section>
  );
}
