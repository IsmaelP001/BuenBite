import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Apple, Trash2 } from "lucide-react";
import { PantryIngredientInput } from "@/types/models/pantry";
import { categoryIcons } from "@/lib/constants";

interface AddedIngredientItemProps {
  item: PantryIngredientInput;
  isEditing: boolean;
  onQuantityChange: (id: string, quantity: string) => void;
  onUnitChange: (id: string, unit: string) => void;
  onEdit: (item: PantryIngredientInput) => void;
  onRemove: (id: string) => void;
}

export const AddedIngredientItem: React.FC<AddedIngredientItemProps> = ({
  item,
  isEditing,
  onQuantityChange,
  onUnitChange,
  onRemove,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isEditing
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
          {categoryIcons[
            item.ingredient.category as keyof typeof categoryIcons
          ] || <Apple className="w-6 h-6 text-primary" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h4 className="font-semibold text-foreground">
                {item.ingredient.name_es}
              </h4>
              <p className="text-xs text-muted-foreground">
                {item.ingredient.category}
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cantidad</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => onQuantityChange(item.id, e.target.value)}
                className="h-9 mt-1"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Unidad</Label>
              <Select
                value={item.unit}
                onValueChange={(value) => onUnitChange(item.id, value)}
              >
                <SelectTrigger className="h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {item.ingredient.conversions.allowed_units.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
