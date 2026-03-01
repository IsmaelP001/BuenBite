import { useMemo, useState } from "react";
import { Ingredient } from "@/types/models/ingredient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "./SearchBarResults";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useGetIngredients from "@/hooks/useGetIngredients";
import { Plus, Sparkles } from "lucide-react";

interface QuickIngredientSuggestionsProps {
  suggestions: Ingredient[];
  isPending: boolean;
  addedIngredientIds: Set<string>;
  onQuickAdd: (ingredient: Ingredient) => void;
}

export const QuickIngredientSuggestions: React.FC<
  QuickIngredientSuggestionsProps
> = ({ suggestions, isPending, addedIngredientIds, onQuickAdd }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const shouldSearchInModal = modalSearchQuery.trim().length >= 2;
  const { ingredients: searchedIngredients, isPending: isSearching } =
    useGetIngredients({
      searchValue: modalSearchQuery.trim(),
      isDisabled: !shouldSearchInModal,
    });

  const quickSuggestions = useMemo(() => suggestions.slice(0, 8), [suggestions]);

  return (
    <div className="space-y-3 rounded-lg border bg-secondary/30 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Sugerencias rápidas
          </p>
          <p className="text-xs text-muted-foreground">
            Toca para agregar al instante y edita cantidad luego.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          disabled={isPending || suggestions.length === 0}
        >
          Ver más
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {isPending && (
          <p className="text-xs text-muted-foreground py-2">
            Cargando sugerencias...
          </p>
        )}

        {!isPending &&
          quickSuggestions.map((ingredient) => {
            const isAdded = addedIngredientIds.has(ingredient.id);
            return (
              <Button
                key={ingredient.id}
                type="button"
                variant={isAdded ? "secondary" : "outline"}
                size="sm"
                className="h-auto py-1.5 px-3"
                disabled={isAdded}
                onClick={() => onQuickAdd(ingredient)}
              >
                {!isAdded && <Plus className="w-3 h-3 mr-1" />}
                {ingredient.name_es}
              </Button>
            );
          })}

        {!isPending && quickSuggestions.length === 0 && (
          <p className="text-xs text-muted-foreground py-2">
            No hay sugerencias disponibles.
          </p>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Más sugerencias de ingredientes</DialogTitle>
            <DialogDescription>
              Puedes agregar varios con un clic y ajustar cantidades después.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <SearchBar
              value={modalSearchQuery}
              onChange={setModalSearchQuery}
              placeholder="Busca para encontrar más ingredientes..."
            />

            {shouldSearchInModal ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Resultados de búsqueda</p>
                <div className="flex flex-wrap gap-2">
                  {isSearching && (
                    <p className="text-xs text-muted-foreground py-2">
                      Buscando ingredientes...
                    </p>
                  )}
                  {!isSearching &&
                    searchedIngredients?.map((ingredient) => {
                      const isAdded = addedIngredientIds.has(ingredient.id);
                      return (
                        <Button
                          key={ingredient.id}
                          type="button"
                          variant={isAdded ? "secondary" : "outline"}
                          size="sm"
                          className="h-auto py-1.5 px-3"
                          disabled={isAdded}
                          onClick={() => onQuickAdd(ingredient)}
                        >
                          {ingredient.name_es}
                          {isAdded && (
                            <Badge variant="secondary" className="ml-2">
                              Agregado
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  {!isSearching && searchedIngredients?.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2">
                      No encontramos ingredientes con ese término.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Sugeridos para ti</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((ingredient) => {
                    const isAdded = addedIngredientIds.has(ingredient.id);
                    return (
                      <Button
                        key={ingredient.id}
                        type="button"
                        variant={isAdded ? "secondary" : "outline"}
                        size="sm"
                        className="h-auto py-1.5 px-3"
                        disabled={isAdded}
                        onClick={() => onQuickAdd(ingredient)}
                      >
                        {ingredient.name_es}
                        {isAdded && (
                          <Badge variant="secondary" className="ml-2">
                            Agregado
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
