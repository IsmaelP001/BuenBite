"use client";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { usePantryIngredientSelection } from "@/lib/context/pantryIngredientContext";
import { useRouter } from "next/navigation";

interface AddIngredientsBtnProps {
  type: "pantry" | "ingredient";
}
export default function AddIngredientsBtn({ type }: AddIngredientsBtnProps) {
  const { onModalOpenChange } = usePantryIngredientSelection();
  const router = useRouter();

  const handleAddIngredient = () => {
    if (type === 'pantry') {
      router.push("/pantry/create");
      return;
    }
    onModalOpenChange(true);
  };
  return (
    <Button onClick={handleAddIngredient} variant="hero" size="lg">
      <Plus className="h-5 w-5" />
      Agregar Ingrediente
    </Button>
  );
}
