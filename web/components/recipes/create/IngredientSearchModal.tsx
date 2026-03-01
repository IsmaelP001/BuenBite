"use client";
import { useState } from "react";
import { Search, Plus, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Ingredient } from "@/types/models/ingredient";
import useGetIngredients from "@/hooks/useGetIngredients";
import useCreateIngredient from "@/hooks/useCreateIngredient";
import { NewRecipeIngredient } from "@/hooks/useCreateRecipe";

interface IngredientSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddIngredient: (ingredient: NewRecipeIngredient) => void;
}

type ModalStep = "search" | "select" | "create";

export function IngredientSearchModal({
  open,
  onOpenChange,
  onAddIngredient,
}: IngredientSearchModalProps) {
  const [step, setStep] = useState<ModalStep>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [measurementType, setMeasurementType] = useState("");
  const [measurementValue, setMeasurementValue] = useState("");
  const [notes, setNotes] = useState("");

  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientCategory, setNewIngredientCategory] = useState("");
  const [newIngredientCalories, setNewIngredientCalories] = useState("");

  const { ingredients, isPending } = useGetIngredients({
    searchValue: searchQuery,
  });
  const createIngredientMutation = useCreateIngredient();

  const handleSelectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setMeasurementType(ingredient.conversions.allowed_units[0] || "g");
    setStep("select");
  };

  const handleAddIngredient = () => {
    if (!selectedIngredient || !measurementValue) return;

    const newIngredient: NewRecipeIngredient = {
      measurementType,
      measurementValue: parseFloat(measurementValue),
      ingredientId: selectedIngredient.id,
      notes: notes || undefined,
      name:{
        en:selectedIngredient.name_en,
        es:selectedIngredient.name_es,
        fr:selectedIngredient.name_fr
      }
    };

    onAddIngredient(newIngredient);
    handleReset();
    onOpenChange(false);
  };

  const handleCreateIngredient = async () => {
    if (!newIngredientName || !newIngredientCategory) return;

    try {
      const { data: createdIngredient } =
        await createIngredientMutation.mutateAsync({
          name_es: newIngredientName,
          name_fr: newIngredientName,
          name_en: newIngredientName,
          category: newIngredientCategory,
          calories_100g: parseFloat(newIngredientCalories),
        });

      handleSelectIngredient(createdIngredient);
      resetCreateForm();
    } catch (error) {
      console.error("Error creating ingredient:", error);
    }
  };

  const resetCreateForm = () => {
    setNewIngredientName("");
    setNewIngredientCategory("");
    setNewIngredientCalories("");
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedIngredient(null);
    setMeasurementType("");
    setMeasurementValue("");
    setNotes("");
    setStep("search");
    resetCreateForm();
  };

  const handleBack = () => {
    if (step === "create") {
      setStep("search");
      resetCreateForm();
    } else if (step === "select") {
      setSelectedIngredient(null);
      setStep("search");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {step !== "search" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle className="text-xl font-semibold">
              {step === "search" && "Añadir Ingrediente"}
              {step === "select" && "Configurar Cantidad"}
              {step === "create" && "Crear Nuevo Ingrediente"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {step === "search" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isPending && (
              <p className="text-center text-muted-foreground py-8">
                Cargando ingredientes...
              </p>
            )}

            <div className="max-h-64 overflow-y-auto space-y-1">
              {ingredients?.map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => handleSelectIngredient(ingredient)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ingredient.name_es}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {ingredient.category} • {ingredient.calories_100g}{" "}
                      kcal/100g
                    </p>
                  </div>
                </button>
              ))}

              {ingredients?.length === 0 && searchQuery && (
                <div className="text-center py-8 space-y-3">
                  <p className="text-muted-foreground">
                    No se encontró {`(${searchQuery})`}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewIngredientName(searchQuery);
                      setStep("create");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear nuevo ingrediente
                  </Button>
                </div>
              )}

              {ingredients?.length === 0 && !searchQuery && (
                <p className="text-center text-muted-foreground py-8">
                  Busca un ingrediente para comenzar
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2a: Select ingredient details */}
        {step === "select" && selectedIngredient && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-3xl">{selectedIngredient.image}</span>
              <div className="flex-1">
                <p className="font-semibold">{selectedIngredient.name_es}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedIngredient.calories_100g} kcal/100g
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={measurementValue}
                  onChange={(e) => setMeasurementValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidad</Label>
                <Select
                  value={measurementType}
                  onValueChange={setMeasurementType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedIngredient.conversions.allowed_units.map(
                      (unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Input
                placeholder="ej: picado finamente"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddIngredient}
              disabled={!measurementValue}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Ingrediente
            </Button>
          </div>
        )}

        {step === "create" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del ingrediente</Label>
              <Input
                placeholder="ej: Aguacate"
                value={newIngredientName}
                readOnly
                onChange={(e) => setNewIngredientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select
                value={newIngredientCategory}
                onValueChange={setNewIngredientCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Frutas">Frutas</SelectItem>
                  <SelectItem value="Verduras">Verduras</SelectItem>
                  <SelectItem value="Proteínas">Proteínas</SelectItem>
                  <SelectItem value="Lácteos">Lácteos</SelectItem>
                  <SelectItem value="Granos">Granos</SelectItem>
                  <SelectItem value="Condimentos">Condimentos</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Calorías por 100g</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newIngredientCalories}
                  onChange={(e) => setNewIngredientCalories(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Grasas por 100g</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newIngredientCalories}
                  onChange={(e) => setNewIngredientCalories(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Proteinas por 100g</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newIngredientCalories}
                  onChange={(e) => setNewIngredientCalories(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Carbohidratos por 100g</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newIngredientCalories}
                  onChange={(e) => setNewIngredientCalories(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleCreateIngredient}
              disabled={
                !newIngredientName ||
                !newIngredientCategory ||
                !newIngredientCalories ||
                createIngredientMutation.isPending
              }
              className="w-full"
            >
              {createIngredientMutation.isPending ? (
                "Creando..."
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear y Añadir Ingrediente
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
