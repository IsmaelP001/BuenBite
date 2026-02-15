"use client";
import { ChefHat } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import CompactRecipeCard from "../CompactedRecipeCard";
import { useQuery } from "@tanstack/react-query";
import { useHttpApiClient } from "@/services/apiClient";
import { usePantryIngredientSelection } from "@/lib/context/pantryIngredientContext";
import { ApiResponse } from "@/types";
import { SearchRecipe } from "@/types/models/recipes";

interface RecipeContentProps {
  recipes: SearchRecipe[];
  selectedIngredientsCount: number;
  onClearSelection: () => void;
  isLoading: boolean;
}

function RecipeContent({
  recipes,
  selectedIngredientsCount,
  onClearSelection,
  isLoading,
}: RecipeContentProps) {

   if (isLoading) {
    return (
      <div className="mt-16 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando Recetas...</p>
        </div>
      </div>
    );
  }
  if (!recipes?.length) {
    return (
      <div className="text-center py-12">
        <ChefHat className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground text-sm">
          {selectedIngredientsCount > 0
            ? "No hay recetas con los ingredientes seleccionados"
            : "No hay recetas disponibles con tus ingredientes"}
        </p>
        {selectedIngredientsCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={onClearSelection}
          >
            Limpiar selección
          </Button>
        )}
      </div>
    );
  }

 

  return (
    <div className="space-y-3 pr-4">
      {recipes.map((recipe) => (
        <CompactRecipeCard
          key={recipe.id}
          id={recipe.id}
          image={recipe.image}
          title={recipe.name}
          category={"category"}
          time={recipe.totalTime.toString()}
          rating={5}
          ingredientsAvailable={recipe.matchingIngredientsCount}
          ingredientsTotal={recipe.totalIngredientsCount}
        />
      ))}
    </div>
  );
}

export default function RecipesByPantrySidebar() {
  const [showRecipePanel, setShowRecipePanel] = useState(true);
  const apiClient = useHttpApiClient();
  const {
    selectedIngredients,
    clearIngredients,
    isRecipesSidebarMobileOpen,
    onRecipesSidebarMobileChange,
  } = usePantryIngredientSelection();

  const query = useQuery<ApiResponse<SearchRecipe[]>>({
    queryKey: ["search-recipes", selectedIngredients.sort()],
    queryFn: () =>
      apiClient.recipeService.searchRecipes({
        ingredientIds: selectedIngredients.map((item) => item.ingredientId),
      }),
    enabled: selectedIngredients.length > 0,
  });

  const recipes: SearchRecipe[] = query.data?.data ?? [];
  const { isPending, isFetching } = query;


  return (
    <>
      {/* Botón flotante para pantallas pequeñas */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet
          open={isRecipesSidebarMobileOpen}
          onOpenChange={onRecipesSidebarMobileChange}
        >
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full shadow-lg h-14 w-14 relative"
            >
              <ChefHat className="h-6 w-6" />
              {recipes?.length > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
                >
                  {recipes.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Recetas Disponibles
              </SheetTitle>
              <SheetDescription>
                {selectedIngredients.length > 0
                  ? `Con ${selectedIngredients.length} ingrediente${
                      selectedIngredients.length > 1 ? "s" : ""
                    } seleccionado${selectedIngredients.length > 1 ? "s" : ""}`
                  : "Basadas en tu despensa"}
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(85vh-120px)] mt-6">
              <RecipeContent
                recipes={recipes}
                selectedIngredientsCount={selectedIngredients.length}
                onClearSelection={clearIngredients}
                isLoading={isFetching}
              />
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar para pantallas grandes */}
      <aside
        className={`hidden lg:block w-full ${
          showRecipePanel ? "" : "lg:hidden"
        }`}
      >
        <div className="sticky top-24">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  Recetas Disponibles
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedIngredients.length > 0
                    ? `Con ${selectedIngredients.length} ingrediente${
                        selectedIngredients.length > 1 ? "s" : ""
                      } seleccionado${
                        selectedIngredients.length > 1 ? "s" : ""
                      }`
                    : "Basadas en tu despensa"}
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {recipes?.length} recetas
              </Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <RecipeContent
                recipes={recipes}
                selectedIngredientsCount={selectedIngredients.length}
                onClearSelection={clearIngredients}
                isLoading={isFetching}
              />
            </ScrollArea>
          </div>
        </div>
      </aside>
    </>
  );
}
