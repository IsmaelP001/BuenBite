"use client";
import PurchaseConfirmationModal from "@/components/purchases/PurchaseConfirmationModal";
import QuantityInput from "@/components/QuantityInput";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useGetRecipeIngredients from "@/hooks/useGetRecipeIngredients";
import useRecipeServings from "@/hooks/useRecipeServings";
import { RecipeIngredient } from "@/types/models/recipes";
import { ChefHat } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import IngredientAvailabilityCard from "../IngredientAvailabilityCard";
import useGetRecipyDetails from "@/hooks/useGetRecipeDetails";
import { useAuth } from "@/lib/context/authContext";

export default function IngredientSidebar() {
  const { id } = useParams();
  const { data: ingredientsData } = useGetRecipeIngredients();
  const { recipe } = useGetRecipyDetails();
  const { user } = useAuth();
  const {
    servings,
    ingredients,
    updateServingValue,
    completionPercentage,
    completeIngredientsCount,
    missingIngredientsCount,
    partialIngredientsCount,
  } = useRecipeServings({
    ingredientsData: ingredientsData?.ingredients ?? [],
    originalServings: ingredientsData?.targetServings ?? recipe?.servings ?? 1,
  });

  return (
    <div className="sticky top-18 space-y-6 ">
      <div className="bg-card rounded-xl p-3 shadow-sm border">
        <div className="flex flex-row justify-between items-center mb-2">
          <h2 className="font-display text-xl font-semibold">Ingredientes</h2>
          <QuantityInput
            value={servings}
            size="sm"
            onChange={(val) => updateServingValue(val)}
          />
        </div>

        {user && (
          <div className="mb-2 px-4 py-1 rounded-xl bg-muted/50 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completado</span>
              <span className="text-sm font-semibold text-primary">
                {completionPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />

            <div className="grid grid-cols-3 gap-2 pt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-muted-foreground">
                  {completeIngredientsCount} Completos
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-xs text-muted-foreground">
                  {partialIngredientsCount} Parcial
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-xs text-muted-foreground">
                  {missingIngredientsCount} Faltantes
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {ingredients.map((ing) => {
            return (
              <IngredientAvailabilityCard
                key={`recipe-ingredient-${ing.ingredientId}`}
                ingredient={{
                  ...ing,
                  availabilityStatus: ing.updatedAvailabilityStatus,
                  missingAmount: ing.updatedMissingAmount,
                  measurementValue: ing.updatedValue,
                }}
              />
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 ">
          <Link href={`/recipes/${id}/cook`}>
            <Button className="w-full" size="lg">
              <ChefHat className="w-4 h-4 mr-2" />
              Empezar a Cocinar
            </Button>
          </Link>
          <div className="mt-2">
            <PurchaseConfirmationModal<RecipeIngredient>
              initialItems={ingredients
                .map((item) => ({
                  ...item,
                  missingAmount: item.updatedMissingAmount,
                  measurementValue: item.updatedValue,
                  availabilityStatus: item.updatedAvailabilityStatus,
                }))
                .filter(
                  (item) => item.updatedAvailabilityStatus !== "COMPLETE",
                )}
              type="INGREDIENTS"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
