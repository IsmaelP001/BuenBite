import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus } from "lucide-react";
import { Ingredient } from "@/types/models/ingredient";

interface QuantityUnitFormProps {
  selectedIngredient: Ingredient;
  mode: "pantry" | "purchase";
  quantity: string;
  unit: string;
  expiryDate: string | null ;
  onQuantityChange: (value: string) => void;
  onUnitChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onAddToPantry: () => void;
  isCreating?: boolean;
}

export const QuantityUnitForm: React.FC<QuantityUnitFormProps> = ({
  selectedIngredient,
  quantity,
  unit,
  expiryDate,
  onQuantityChange,
  onUnitChange,
  onExpiryDateChange,
  onAddToPantry,
  mode,
  isCreating
}) => {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Cantidad y Unidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cantidad *</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => onQuantityChange(e.target.value)}
              placeholder="Ej: 500"
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <Label>Unidad *</Label>
            <Select value={unit} onValueChange={onUnitChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona" />
              </SelectTrigger>
              <SelectContent>
                {selectedIngredient.conversions.allowed_units.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {mode === "pantry" && (
          <div>
            <Label>Fecha de Caducidad (opcional)</Label>
            <Input
              type="date"
              value={expiryDate ?? ""}
              onChange={(e) => onExpiryDateChange(e.target.value)}
            />
          </div>
        )}

        <Button
          onClick={onAddToPantry}
          className="w-full"
          size="lg"
          disabled={!quantity}
        >
          <Plus className="w-4 h-4 mr-2" />
          {isCreating ? "Creando..." : mode === "pantry" ? "Añadir a Despensa" : "Añadir a Orden de Compra"}
        </Button>
      </CardContent>
    </Card>
  );
};
