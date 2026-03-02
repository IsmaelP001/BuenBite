"use client";
import { AlertTriangle, Clock, ShoppingBag } from "lucide-react";
import { Badge } from "../ui/badge";
import IngredientPurchaseCard from "./IngredientPurchaseCard";
import useGetPantryItems from "@/hooks/useGetPantryItems";
import { useSelectedPurchaseItems } from "@/lib/context/purchase";

export default function IngredientsContainer() {
  const { toggleSelect, updateSelectedAmount, isSelected, getSelectedAmount } =
    useSelectedPurchaseItems();

  const { lowStockItems, expiringProductsItems,pendingPurchaseProduts, isPending } = useGetPantryItems(
    {}
  );

  return (
    <>
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-foreground">Bajo en Stock</h2>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
              {lowStockItems?.length}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {lowStockItems.map((ingredient) => (
            <IngredientPurchaseCard
              key={ingredient.id}
              type="pantry"
              quantity={getSelectedAmount(ingredient.ingredientId!) ?? 1}
              isSelected={isSelected(ingredient.ingredientId!)}
              ingredient={ingredient}
              onSelect={() =>
                toggleSelect(
                  ingredient.ingredientId!,
                  1,
                  ingredient.measurementType
                )
              }
              updateQuantity={(qty) =>
                updateSelectedAmount(ingredient.ingredientId!, Number(qty))
              }
            />
          ))}
        </div>
      </section>

      {/* Expiring Soon */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            <h2 className="text-xl font-bold text-foreground">
              Próximos a Vencer
            </h2>
            <Badge className="bg-red-500/10 text-red-600 border-red-200">
              {expiringProductsItems.length}
            </Badge>
          </div>
         
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Sugerimos reemplazar estos ingredientes pronto
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {expiringProductsItems.map((ingredient) => (
            <IngredientPurchaseCard
              key={ingredient.id}
              type="pantry"
              quantity={getSelectedAmount(ingredient.id) ?? 1}
              isSelected={isSelected(ingredient.id)}
              ingredient={ingredient}
              onSelect={() =>
                toggleSelect(ingredient.id, 1, ingredient.measurementType)
              }
              updateQuantity={(qty) =>
                updateSelectedAmount(ingredient.id, Number(qty))
              }
            />
          ))}
        </div>
      </section>

      {/* Pending purchase items  */}
       <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-bold text-foreground">
              Pendientes para compra
            </h2>
            <Badge className="bg-orange-600/10 text-orange-600 border-red-200">
              {pendingPurchaseProduts?.length ?? 0}
            </Badge>
          </div>
         
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingPurchaseProduts.map((ingredient) => (
            <IngredientPurchaseCard
              key={ingredient.id}
              type="pantry"
              quantity={getSelectedAmount(ingredient.id) ?? 1}
              isSelected={isSelected(ingredient.id)}
              ingredient={ingredient}
              onSelect={() =>
                toggleSelect(ingredient.id,(ingredient?.pendingPurchaseQuantity ?? 1) ,ingredient.measurementType)
              }
              updateQuantity={(qty) =>
                updateSelectedAmount(ingredient.id, Number(qty))
              }
            />
          ))}
        </div>
      </section>
    </>
  );
}
