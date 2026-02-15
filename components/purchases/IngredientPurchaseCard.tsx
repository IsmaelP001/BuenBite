"use client";
import { MissingMealplanIngredient } from "@/types/models/pantry";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Check } from "lucide-react";
import QuantityInput from "../QuantityInput";
import Link from "next/link";

interface IngredientPurchaseCardProps {
  ingredient: MissingMealplanIngredient;
  type: "mealplan" | "pantry";
  onSelect: (ingredientId: string) => void;
  updateQuantity: (qty: number) => void;
  isSelected: boolean;
  quantity: number;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Proteínas: "text-red-600 border-red-200",
    Vegetales: "text-green-600 border-green-200",
    Lácteos: "text-blue-600 border-blue-200",
    Legumbres: "bg text-amber-600 border-amber-200",
    Pastas: "text-orange-600 border-orange-200",
    Aceites: "text-yellow-600 border-yellow-200",
    Especias: "text-purple-600 border-purple-200",
  };
  return colors[category] || "text-muted-foreground";
};
const IngredientPurchaseCard = ({
  ingredient,
  onSelect,
  isSelected,
  updateQuantity,
  quantity,
  type,
}: IngredientPurchaseCardProps) => {
  return (
    <div
      className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      }`}
      onClick={() => onSelect(ingredient.id)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 items-start">
            <Checkbox
              checked={isSelected}
              className="mt-1"
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => onSelect(ingredient.id)}
            />
            <div className=" items-center gap-2 mb-1">
              <Link href={`/pantry/${ingredient.ingredientId}`}>
                <h4 className="font-semibold text-foreground truncate group-hover:underline">
                  {ingredient.name.es}
                </h4>
              </Link>
              <p className={`text-xs ${getCategoryColor(ingredient.category)}`}>
                {ingredient.category}
              </p>
            </div>
          </div>
          {type === "mealplan" && ingredient.requiredQuantity && (
            <p className="text-xs text-destructive">
              <span>
                Necesitas{" "}
                <span className="font-semibold">
                  {`${ingredient.requiredQuantity} ${
                    ingredient.totalRequiredQuantity !==
                    ingredient.requiredQuantity
                      ? `de ${ingredient.totalRequiredQuantity}`
                      : ""
                  }`}{" "}
                  {ingredient.measurementType}
                </span>
              </span>
            </p>
          )}

          {type === "mealplan" &&
            (ingredient.isSuccessConvertion &&
            ingredient.measurementValue > 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Tienes{" "}
                <span className="font-semibold">
                  {ingredient.measurementValue} {ingredient.measurementType}
                </span>
              </p>
            ) : ingredient.originalPantryQuantity > 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Tienes{" "}
                <span className="font-semibold">
                  {ingredient.originalPantryQuantity}{" "}
                  {ingredient.pantryMeasurementType}
                </span>
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-0.5">Sin stock</p>
            ))}

          {type === "pantry" &&
            (ingredient.measurementValue > 0 ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                Tienes{" "}
                <span className="font-semibold">
                  {ingredient.measurementValue?.toFixed(2)}{" "}
                  {ingredient.measurementType}
                </span>
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-0.5">Sin stock</p>
            ))}
          {type === "pantry" &&
            (ingredient.pendingPurchaseQuantity > 0 ? (
              <p className="text-xs text-gray-400 dark:text-emerald-400 mt-0.5">
                Pendientes{" "}
                <span className="font-semibold">
                  {ingredient.pendingPurchaseQuantity?.toFixed(2)}{" "}
                  {ingredient.measurementType}
                </span>
              </p>
            ) : null)}
        </div>
        <div className="text-right">
          {isSelected && (
            <div
              className=" items-center gap-1 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <QuantityInput
                size="sm"
                value={quantity}
                onChange={updateQuantity}
              />
              <p className="text-center text-xs">
                {ingredient.measurementType}
              </p>
            </div>
          )}
        </div>
      </div>
      {ingredient?.recipes?.length > 0 && (
        <p className="text-xs font-medium text-gray-400">
          {ingredient.recipes.join(" , ")}{" "}
        </p>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientPurchaseCard;
