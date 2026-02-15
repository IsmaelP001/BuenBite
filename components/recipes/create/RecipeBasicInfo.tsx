import { Clock, Users, ChefHat, ImagePlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RecipeItem } from "@/types/models/recipes";
import { useRef, useState } from "react";

interface RecipeBasicInfoProps {
  recipe: Partial<RecipeItem>;
  onChange: (updates: Partial<RecipeItem>) => void;
}

const mealTypeOptions: { value: string; label: string }[] = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Almuerzo" },
  { value: "dinner", label: "Cena" },
  { value: "dessert", label: "Postre" },
];

const difficultyOptions: { value: string; label: string }[] = [
  { value: "easy", label: "Fácil" },
  { value: "medium", label: "Media" },
  { value: "hard", label: "Difícil" },
];

export function RecipeBasicInfo({ recipe, onChange }: RecipeBasicInfoProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMealTypeToggle = (mealType: string, checked: boolean) => {
    const currentTypes = recipe.mealTypes || [];
    if (checked) {
      onChange({ mealTypes: [...currentTypes, mealType] });
    } else {
      onChange({ mealTypes: currentTypes.filter((t) => t !== mealType) });
    }
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe ser menor a 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onChange({ image: file });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    onChange({ image: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const displayImage = imagePreview || recipe.image;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Imagen de la Receta</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {displayImage ? (
          <div className="relative border-2 border-muted rounded-xl overflow-hidden">
            <img
              src={displayImage}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClickUpload}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
          >
            <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Arrastra una imagen o haz clic para subir
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP (máx. 5MB)
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la Receta *</Label>
        <Input
          id="name"
          placeholder="ej: Pollo al Curry con Arroz"
          value={recipe.name || ""}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          placeholder="Una breve descripción de tu receta..."
          value={recipe.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          className="resize-none min-h-20"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="prepTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Prep (min)
          </Label>
          <Input
            id="prepTime"
            type="number"
            placeholder="15"
            value={recipe.prepTime || ""}
            onChange={(e) =>
              onChange({ prepTime: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cookTime" className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Cocción (min)
          </Label>
          <Input
            id="cookTime"
            type="number"
            placeholder="30"
            value={recipe.cookTime || ""}
            onChange={(e) =>
              onChange({ cookTime: parseInt(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servings" className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Porciones
          </Label>
          <Input
            id="servings"
            type="number"
            placeholder="4"
            value={recipe.servings || ""}
            onChange={(e) =>
              onChange({ servings: parseInt(e.target.value) || 0 })
            }
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-muted-foreground" />
            Dificultad
          </Label>
          <Select
            value={recipe.dificulty || ""}
            onValueChange={(value) => onChange({ dificulty: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              {difficultyOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label>Tipo de Comida</Label>
        <div className="flex flex-wrap gap-4">
          {mealTypeOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Checkbox
                checked={(recipe.mealTypes || []).includes(option.value)}
                onCheckedChange={(checked) =>
                  handleMealTypeToggle(option.value, checked as boolean)
                }
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas Adicionales</Label>
        <Textarea
          id="notes"
          placeholder="Tips, sustituciones, consejos..."
          value={recipe.notes || ""}
          onChange={(e) => onChange({ notes: e.target.value })}
          className="resize-none min-h-20"
        />
      </div>

      <label className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg cursor-pointer">
        <Checkbox
          checked={recipe.isSharedCommunity || false}
          onCheckedChange={(checked) =>
            onChange({ isSharedCommunity: checked as boolean })
          }
        />
        <div>
          <p className="font-medium">Compartir con la comunidad</p>
          <p className="text-sm text-muted-foreground">
            Permite que otros usuarios vean tu receta
          </p>
        </div>
      </label>
    </div>
  );
}
