import { useState, useMemo } from "react";
import { Search, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useGetIngredients from "@/hooks/useGetIngredients";
import CategoryChip from "../home/CategoryShip";
import { Ingredient } from "@/types/models/ingredient";
import Image from "next/image";
import { isValidUrl } from "@/lib/utils";

interface IngredientSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIngredients: (ingredients: Ingredient[]) => void;
}

const IngredientSelectorModal = ({
  open,
  onOpenChange,
  onAddIngredients,
}: IngredientSelectorModalProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIngredients, setSelectedIngredients] = useState<Map<string, Ingredient>>(new Map());

  const { groupedIngredients, isPending, categoriesSummary } =
    useGetIngredients({
      searchValue,
      isDisabled: !open,
    });

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") {
      return groupedIngredients.flatMap((group) => group.items);
    }

    const group = groupedIngredients.find(
      (g) => g.category === selectedCategory
    );
    return group?.items || [];
  }, [groupedIngredients, selectedCategory]);

  const handleToggleIngredient = (item: Ingredient) => {
    setSelectedIngredients((prev) => {
      const newMap = new Map(prev);

      if (newMap.has(item.id)) {
        newMap.delete(item.id);
      } else {
        newMap.set(item.id, item);
      }

      return newMap;
    });
  };

  const handleAddIngredients = () => {
    onAddIngredients(Array.from(selectedIngredients.values()));
    setSelectedIngredients(new Map());
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedIngredients(new Map());
    setSearchValue("");
    setSelectedCategory("all");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Añadir Ingredientes</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar ingredientes..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative bg-background z-10 pb-0.5">
          <div className="w-full overflow-x-auto">
            <div className="flex gap-2">
              {categoriesSummary?.map((category) => (
                <CategoryChip
                  key={category.id}
                  label={category.label}
                  count={category.count}
                  isActive={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {isPending ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Cargando ingredientes...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                No se encontraron ingredientes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 py-0.5 ">
              {filteredItems.map((item) => {
                const isSelected = selectedIngredients.has(item.id);
                const valUrl = isValidUrl(item?.image) ? item.image : "/file.svg";
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleIngredient(item)}
                    className={`
                      relative group rounded-lg overflow-hidden border-2 transition-all
                      ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-muted-foreground/20"
                      }
                    `}
                  >
                    <div className="aspect-square relative bg-muted">
                      <Image
                        src={valUrl}
                        width={50}
                        height={50}
                        alt={`Imagen de ${item?.name_es}`}
                        className="w-full h-full object-cover"
                      />

                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary rounded-full p-1.5">
                            <X className="h-4 w-4 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-2 bg-card">
                      <p className="text-sm font-medium text-center line-clamp-2">
                        {item.name_es}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-1">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleAddIngredients}
            disabled={selectedIngredients.size === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir ({selectedIngredients.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientSelectorModal;