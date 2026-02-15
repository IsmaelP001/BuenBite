import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Ingredient } from "@/types/models/ingredient";
import { IngredientCard } from "./IngredientCard";

interface SearchResultsProps {
  ingredients: Ingredient[] | undefined;
  isPending: boolean;
  noResults: boolean;
  searchQuery: string;
  onSelectIngredient: (ingredient: Ingredient) => void;
  onCreateClick: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  ingredients,
  isPending,
  noResults,
  searchQuery,
  onSelectIngredient,
  onCreateClick,
}) => {
  if (isPending) {
    return (
      <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2 bg-secondary/30">
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">Buscando...</p>
        </div>
      </div>
    );
  }

  if (noResults) {
    return (
      <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2 bg-secondary/30">
        <div className="text-center py-6">
          <p className="text-muted-foreground mb-4">
            No se encontró {`"${searchQuery}"`}.
          </p>
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Ingrediente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-2 bg-secondary/30">
      {ingredients?.map((ingredient) => (
        <IngredientCard
          key={ingredient.id}
          ingredient={ingredient}
          onClick={onSelectIngredient}
        />
      ))}
    </div>
  );
};