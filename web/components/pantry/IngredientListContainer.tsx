"use client";
import { useState } from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { cn, isValidUrl } from "@/lib/utils";
import Image from "next/image";
import { usePantryIngredientSelection } from "@/lib/context/pantryIngredientContext";
import IngredientSelectorModal from "./IngredientSelectorModal";
import Link from "next/link";
import { categoryColors } from "@/lib/constants/ingredient-category-colors";

export default function IngredientListContai() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const {
    selectedIngredients,
    isModalOpen,
    onModalOpenChange,
    createFromIngredient,
    addIngredients,
    isSelected,
    removeIngredient,
  } = usePantryIngredientSelection();

  return (
    <>
      <section>
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-[repeat(auto-fill,minmax(145px,auto))] gap-2"
              : "flex flex-col gap-4"
          }
        >
          {selectedIngredients?.map((ingredient) => {
            const isIngSelected = isSelected(ingredient.ingredientId);
            return (
              <button
                onClick={() => removeIngredient(ingredient.ingredientId)}
                key={ingredient.ingredientId}
              >
                <div className="relative block group bg-card rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 animate-fade-in">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={
                        isValidUrl(ingredient.image)
                          ? ingredient.image
                          : "/file.svg"
                      }
                      alt={`pantry-image-${ingredient.name}`}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium absolute bottom-2 left-2 ",
                        categoryColors[ingredient.category] || "bg-gray-600 text-white",
                      )}
                    >
                      {ingredient.category}
                    </span>
                  </div>

                  <div className="hidden hover:block">
                    <Link href={""}>Ver receta</Link>
                  </div>
                  {isIngSelected && (
                    <button className="absolute top-2 right-2 bg-primary rounded-full p-1.5">
                      <X className="h-5 w-5 text-primary-foreground" />
                    </button>
                  )}

                  <div className="p-4 ">
                    
                    <h3 className="font-display font-medium  mb-1 group-hover:text-primary transition-colors">
                      {ingredient.name}
                    </h3>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedIngredients?.length === 0 && (
          <div className="flex flex-col items-center text-center gap-3 py-10">
            <h3 className="text-lg font-semibold">
              Aquí verás tus ingredientes
            </h3>

            <p className="text-sm text-muted-foreground max-w-sm">
              Añade ingredientes para empezar a buscar recetas basadas en lo que
              tienes en casa.
            </p>

            <Button onClick={() => onModalOpenChange(true)}>
              Añadir ingredientes
            </Button>

            <div className="mt-4 border-t pt-4 w-full max-w-sm">
              <p className="text-sm text-muted-foreground mb-2">
                ¿Quieres empezar más rápido?
              </p>

              <Button variant="secondary">
                Autocompletar ingredientes sugeridos
              </Button>
            </div>
          </div>
        )}
      </section>
      <IngredientSelectorModal
        open={isModalOpen}
        onOpenChange={onModalOpenChange}
        onAddIngredients={(ingredients) => {
          const items = ingredients.map((item) => createFromIngredient(item));
          addIngredients(items);
        }}
      />
    </>
  );
}
