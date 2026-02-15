"use client";
import { useState } from "react";
import IngredientCard from "../IngredientCard";
import useGetPantryItems from "@/hooks/useGetPantryItems";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { usePantryIngredientSelection } from "@/lib/context/pantryIngredientContext";
import Link from "next/link";

export default function PantryIngredientListContainer() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const searchParams = useSearchParams();
  const {
    createFromPantryItem,
    isSelected,
    removeIngredient,
    addIngredient,
  } = usePantryIngredientSelection();
  const { ungroupedPantryItems } = useGetPantryItems({
    foodCategory: searchParams.get("category") || "all",
    ingredientName: searchParams.get("query") || "",
    activeFilters:
      (searchParams.get("filters")?.split(",") as any[]) || undefined,
  });

  return (
    <>
      <section>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-[repeat(auto-fill,minmax(160px,auto))] gap-2"
              : "flex flex-col gap-4"
          }
        >
          {ungroupedPantryItems?.map((ingredient, index) => (
            <IngredientCard
              isSelected={isSelected(ingredient.ingredientId)}
              onSelect={() => addIngredient(createFromPantryItem(ingredient))}
              selectable={true}
              key={index}
              onRemoveSelected={()=>removeIngredient(ingredient.ingredientId)}
              {...ingredient}
            />
          ))}
        </div>

        {ungroupedPantryItems?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No se encontraron ingredientes.
            </p>
            <Link href={'/pantry/create'}>
            <Button variant="outline">
              <Plus className="h-4 w-4" />
              Agregar ingrediente
            </Button></Link>
          </div>
        )}
      </section>
    </>
  );
}
