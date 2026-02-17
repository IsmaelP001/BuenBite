import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewRecipeIngredient } from "@/hooks/useCreateRecipe";

interface RecipeIngredientsListProps {
  ingredients: NewRecipeIngredient[];
  onRemove: (id: string) => void;
  onAddClick: () => void;
}

export function RecipeIngredientsList({
  ingredients,
  onRemove,
  onAddClick,
}: RecipeIngredientsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ingredientes</h3>
        <Button onClick={onAddClick} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Añadir
        </Button>
      </div>

      {ingredients.length === 0 ? (
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-3">
            No hay ingredientes añadidos
          </p>
          <Button onClick={onAddClick} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Añadir primer ingrediente
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.ingredientId}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{ingredient?.name?.es}</p>
                <p className="text-sm text-muted-foreground">
                  {ingredient.measurementValue} {ingredient?.measurementType}
                  {ingredient.notes && ` • ${ingredient.notes}`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(ingredient.ingredientId)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
