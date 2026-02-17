import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { CreateIngredientDto, Ingredient } from "@/types/models/ingredient";
import useCreateIngredient from "@/hooks/useCreateIngredient";
import Loading from "@/components/Loading";

export interface NewIngredientForm {
  name: string;
  category: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  unit: string;
}

interface CreateIngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: NewIngredientForm;
  onFormChange: (data: Partial<NewIngredientForm>) => void;
  onSubmit: (ing: Ingredient) => void;
  onClose:()=>void
}

export const CreateIngredientDialog: React.FC<CreateIngredientDialogProps> = ({
  open,
  onOpenChange,
  formData,
  onFormChange,
  onSubmit,
  onClose
}) => {
  const { mutateAsync: createIngredientMutation, isPending } =
    useCreateIngredient();
  const handleSubmit = async () => {
    try {
      const newIng: CreateIngredientDto = {
        name_en: formData.name,
        name_fr: formData.name,
        name_es: formData.name,
        ...formData,
      };
      const { data: ingredient } = await createIngredientMutation(newIng);
      onSubmit(ingredient);
      onClose()
    } catch (error) {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Ingrediente</DialogTitle>
          <DialogDescription>
            Ingresa la información nutricional por cada 100g
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={formData.name}
                readOnly
                onChange={(e) => onFormChange({ name: e.target.value })}
                placeholder="Nombre del ingrediente"
              />
            </div>
            <div>
              <Label>Categoría *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => onFormChange({ category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proteins">Proteínas</SelectItem>
                  <SelectItem value="Vegetables">Verduras</SelectItem>
                  <SelectItem value="Fruits">Frutas</SelectItem>
                  <SelectItem value="Dairy">Lácteos</SelectItem>
                  <SelectItem value="Grains">Granos</SelectItem>
                  <SelectItem value="Fats & Oils">Grasas y Aceites</SelectItem>
                  <SelectItem value="Condiments">Condimentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium mb-3">
              Información Nutricional (por 100g)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Calorías (kcal)</Label>
                <Input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => onFormChange({ calories: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Proteínas (g)</Label>
                <Input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => onFormChange({ protein: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Carbohidratos (g)</Label>
                <Input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => onFormChange({ carbs: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label className="text-xs">Grasas (g)</Label>
                <Input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => onFormChange({ fat: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <Button
            disabled={!formData.name || !formData.category || isPending}
            onClick={handleSubmit}
            className="w-full"
          >
            {isPending ? (
              <Loading />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Crear y Seleccionar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
