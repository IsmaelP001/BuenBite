"use client";

import { softDeleteRecipe } from "@/actions/recipes";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface RecipeDeleteButtonProps {
  recipeId: string;
}

export default function RecipeDeleteButton({ recipeId }: RecipeDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar esta receta? Esta acción la ocultará de tu lista."
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await softDeleteRecipe(recipeId);
      toast.success("Receta eliminada");
      router.push("/recipes");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar la receta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isDeleting}
      onClick={handleDelete}
      className="inline-flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
