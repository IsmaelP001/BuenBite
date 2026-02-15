"use client";
import { Button } from "../ui/button";
import { ChefHat } from "lucide-react";
import { usePantryIngredientSelection } from "@/lib/context/pantryIngredientContext";


export default function ShowRelatedRecipesBtn() {
  const { onRecipesSidebarMobileChange } = usePantryIngredientSelection();

  const handleAddIngredient = () => {
    onRecipesSidebarMobileChange(true);
  };
  return (
    <Button className="block lg:hidden" onClick={handleAddIngredient} variant='hero-outline' size="lg">
      <ChefHat className="h-6 w-6 inline mr-2 my-auto" />
      Ver Recetas
    </Button>
  );
}
