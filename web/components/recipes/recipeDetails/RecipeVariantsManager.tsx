"use client";

import { createRecipe, getRecipeIngredients, getRecipeVariants } from "@/actions/recipes";
import { IngredientSearchModal } from "@/components/recipes/create/IngredientSearchModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useAppMutation } from "@/hooks/useAppMutation";
import { RecipeItem } from "@/types/models/recipes";
import { useQuery } from "@tanstack/react-query";
import { PencilLine, Plus, Trash2, Layers, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState } from "react";

type EditableIngredient = {
  ingredientId: string;
  name: string;
  measurementType: string;
  measurementValue: number;
  notes?: string;
  allowedUnits: string[];
};

type EditableInstruction = {
  step: string;
};

type SourceRecipeIngredient = {
  ingredientId: string;
  ingredientName: string;
  measurementType: string;
  measurementValue: number;
  notes?: string;
  name?: { es?: string };
  conversions?: { allowed_units?: string[] };
};

interface RecipeVariantsManagerProps {
  recipe: RecipeItem;
}

export default function RecipeVariantsManager({ recipe }: RecipeVariantsManagerProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [variantName, setVariantName] = useState(`${recipe.name} (Mi versión)`);
  const [variantNotes, setVariantNotes] = useState(recipe.notes ?? "");
  const [ingredients, setIngredients] = useState<EditableIngredient[]>([]);
  const [instructions, setInstructions] = useState<EditableInstruction[]>(
    recipe.instructions ?? [],
  );
  const [variantImage, setVariantImage] = useState<File | null>(null);
  const [variantImagePreview, setVariantImagePreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const variantsQuery = useQuery({
    queryKey: ["recipe_variants", recipe.id],
    queryFn: async () => getRecipeVariants(recipe.id),
    select: (res) => res?.data ?? [],
  });

  const sourceIngredientsQuery = useQuery({
    queryKey: ["recipe_variant_source_ingredients", recipe.id],
    queryFn: async () => getRecipeIngredients(recipe.id),
    select: (res) => (res?.data?.ingredients ?? []) as SourceRecipeIngredient[],
  });

  const mappedSourceIngredients = useMemo(() => {
    return (sourceIngredientsQuery.data ?? []).map((item) => ({
      ingredientId: item.ingredientId,
      name: item?.name?.es ?? item.ingredientName,
      measurementType: item.measurementType,
      measurementValue: item.measurementValue,
      notes: item.notes,
      allowedUnits: item?.conversions?.allowed_units ?? [item.measurementType],
    }));
  }, [sourceIngredientsQuery.data]);

  const { mutateAsync: createVariantMutation, isPending: isSavingVariant } = useAppMutation(
    async () => {
      const formData = new FormData();
      if (variantImage) {
        formData.append("image", variantImage);
      }
      formData.append("parentRecipeId", recipe.id);
      formData.append("name", variantName.trim());
      formData.append("description", recipe.description ?? "");
      formData.append("prepTime", String(recipe.prepTime ?? 0));
      formData.append("cookTime", String(recipe.cookTime ?? 0));
      formData.append("servings", String(recipe.servings ?? 1));
      formData.append("dificulty", String(recipe.dificulty ?? "medium"));
      formData.append("difficulty", String(recipe.dificulty ?? "medium"));
      formData.append("notes", variantNotes);
      formData.append("isSharedCommunity", "false");
      formData.append("mealTypes", JSON.stringify(recipe.mealTypes ?? []));
      formData.append(
        "instructions",
        JSON.stringify(
          instructions.filter((item) => item.step.trim().length > 0),
        ),
      );
      formData.append(
        "ingredients",
        JSON.stringify(
          ingredients.map((item) => ({
            ingredientId: item.ingredientId,
            measurementType: item.measurementType,
            measurementValue: item.measurementValue,
            notes: item.notes,
          })),
        ),
      );

      return createRecipe(formData);
    },
    {
      toastConfig: {
        success: "Variante creada",
        error: "No se pudo crear la variante",
      },
    },
  );

  const handleCreateVariant = async () => {
    if (!variantName.trim()) return;
    if (ingredients.length === 0) return;
    if (instructions.filter((item) => item.step.trim().length > 0).length === 0) {
      return;
    }

    const result = await createVariantMutation();
    const variantId = result?.data?.id;
    setIsCreateOpen(false);
    if (variantId) {
      router.push(`/recipes/${variantId}`);
      return;
    }
    variantsQuery.refetch();
  };

  const openCreateDialog = () => {
    setIngredients(mappedSourceIngredients);
    setVariantName(`${recipe.name} (Mi versión)`);
    setVariantNotes(recipe.notes ?? "");
    setInstructions(recipe.instructions ?? []);
    setVariantImage(null);
    setVariantImagePreview(null);
    setIsCreateOpen(true);
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVariantImage(file);
    setVariantImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Variantes de receta</h2>
          <p className="text-sm text-muted-foreground">
            Cada usuario puede crear su propia versión sin modificar la receta original.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsListOpen(true)}>
            <Layers className="w-4 h-4 mr-2" />
            Variantes ({variantsQuery.data?.length ?? 0})
          </Button>
          <Button onClick={openCreateDialog}>
            <PencilLine className="w-4 h-4 mr-2" />
            Crear mi versión
          </Button>
        </div>
      </div>

      <Dialog open={isListOpen} onOpenChange={setIsListOpen} >
        <DialogContent >
          <DialogHeader>
            <DialogTitle>Variantes disponibles</DialogTitle>
            <DialogDescription>
              Versiones creadas por usuarios a partir de esta receta base.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {(variantsQuery.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Aún no hay variantes para esta receta.</p>
            )}
            {(variantsQuery.data ?? []).map((variant) => (
              <Link
                key={variant.id}
                href={`/recipes/${variant.id}`}
                className="flex items-center gap-3 border rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                onClick={() => setIsListOpen(false)}
              >
                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0">
                  {variant.image ? (
                    <Image
                      src={variant.image}
                      alt={variant.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <p className="text-xs text-muted-foreground">{variant.totalTime} min</p>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear variante</DialogTitle>
            <DialogDescription>
              Modifica ingredientes y guarda tu propia versión de la receta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre de tu variante</Label>
              <div className="flex items-center gap-2">
                <Input value={variantName} onChange={(e) => setVariantName(e.target.value)} />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => imageInputRef.current?.click()}
                  type="button"
                >
                  <ImagePlus className="w-4 h-4" />
                </Button>
              </div>
              {variantImagePreview && (
                <div className="inline-flex items-center gap-2 border rounded-md p-1 pr-2">
                  <Image
                    src={variantImagePreview}
                    alt="Preview"
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6"
                    type="button"
                    onClick={() => {
                      setVariantImage(null);
                      setVariantImagePreview(null);
                      if (imageInputRef.current) imageInputRef.current.value = "";
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Instrucciones</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setInstructions((prev) => [...prev, { step: "" }])
                  }
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir paso
                </Button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {instructions.map((instruction, index) => (
                  <div key={`instruction-${index}`} className="flex gap-2 items-start">
                    <Input
                      value={instruction.step}
                      placeholder={`Paso ${index + 1}`}
                      onChange={(e) => {
                        const next = [...instructions];
                        next[index] = { step: e.target.value };
                        setInstructions(next);
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setInstructions((prev) =>
                          prev.filter((_, stepIndex) => stepIndex !== index),
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ingredientes</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsIngredientModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir ingrediente
                </Button>
              </div>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {ingredients.map((ingredient) => (
                  <div key={ingredient.ingredientId} className="grid grid-cols-12 gap-2 border rounded-lg p-2">
                    <div className="col-span-4 flex items-center text-sm font-medium">
                      {ingredient.name}
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={ingredient.measurementValue}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setIngredients((prev) =>
                            prev.map((item) =>
                              item.ingredientId === ingredient.ingredientId
                                ? { ...item, measurementValue: Number.isNaN(value) ? 0 : value }
                                : item,
                            ),
                          );
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <Select
                        value={ingredient.measurementType}
                        onValueChange={(unit) => {
                          setIngredients((prev) =>
                            prev.map((item) =>
                              item.ingredientId === ingredient.ingredientId
                                ? { ...item, measurementType: unit }
                                : item,
                            ),
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ingredient.allowedUnits.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setIngredients((prev) =>
                            prev.filter((item) => item.ingredientId !== ingredient.ingredientId),
                          );
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Comentarios</Label>
              <Textarea
                value={variantNotes}
                onChange={(e) => setVariantNotes(e.target.value)}
                placeholder="Notas o comentarios sobre tu versión de la receta"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button
                disabled={
                  isSavingVariant ||
                  ingredients.length === 0 ||
                  !variantName.trim() ||
                  instructions.filter((item) => item.step.trim().length > 0).length === 0
                }
                onClick={handleCreateVariant}
              >
                Guardar variante
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <IngredientSearchModal
        open={isIngredientModalOpen}
        onOpenChange={setIsIngredientModalOpen}
        onAddIngredient={(item) => {
          setIngredients((prev) => {
            const exists = prev.some((ingredient) => ingredient.ingredientId === item.ingredientId);
            if (exists) return prev;
            return [
              ...prev,
              {
                ingredientId: item.ingredientId,
                name: item.name.es,
                measurementType: item.measurementType,
                measurementValue: item.measurementValue,
                notes: item.notes,
                allowedUnits: [item.measurementType],
              },
            ];
          });
        }}
      />
    </div>
  );
}
