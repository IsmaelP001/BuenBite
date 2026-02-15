import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple } from "lucide-react";
import { PantryIngredientInput } from "@/types/models/pantry";
import { AddedIngredientItem } from "./AddedIngredientItem";

interface AddedIngredientsListProps {
  items: PantryIngredientInput[];
  editingId: string | null;
  onQuantityChange: (id: string, quantity: string) => void;
  onUnitChange: (id: string, unit: string) => void;
  onEdit: (item: PantryIngredientInput) => void;
  onRemove: (id: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AddedIngredientsList: React.FC<AddedIngredientsListProps> = ({
  items,
  editingId,
  onQuantityChange,
  onUnitChange,
  onEdit,
  onRemove,
  onSave,
  isSaving,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" />
          Ingredientes Añadidos
        </CardTitle>
        <CardDescription>
          {items.length === 0
            ? "No hay ingredientes añadidos aún"
            : `${items.length} ingrediente${
                items.length !== 1 ? "s" : ""
              } en la lista`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Apple className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Lista vacía</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Busca y añade ingredientes para comenzar a construir tu despensa
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {items.map((item) => (
                <AddedIngredientItem
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onQuantityChange={onQuantityChange}
                  onUnitChange={onUnitChange}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Button
                disabled={isSaving}
                onClick={onSave}
                className="w-full"
                size="lg"
              >
                {isSaving
                  ? "Guardando..."
                  : ` Guardar ${items.length} Ingrediente${
                      items.length !== 1 ? "s" : ""
                    }`}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
