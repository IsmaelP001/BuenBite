import { useMemo, useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { RotateCcw, Star, Trash, X, Camera } from "lucide-react";
import { Textarea } from "../ui/textarea";
import QuantityInput from "../QuantityInput";
import { IngredientsList } from "@/hooks/useRecipeServings";
import {
  RegisterPantryItemsCookedDto,
  RegisterRecipeAsCooked,
} from "@/types/models/recipes";
import { useParams, useRouter } from "next/navigation";
import useSaveRecipeCooked from "@/hooks/useSaveRecipeCooked";
import Image from "next/image";

interface ConfirmationCookDialogProps {
  ingredients: IngredientsList[];
  resetIngredientQuantity: (id: string) => void;
  updateIngredientQuantity: (id: string, newQuantity: number) => void;
  show: boolean;
  onOpenChange: (open: boolean) => void;
  resetIngredients: () => void;
  removeIngredient: (id: string) => void;
  servings: number;
}

export default function ConfirmationCookDialog({
  ingredients,
  show,
  onOpenChange,
  updateIngredientQuantity,
  resetIngredientQuantity,
  removeIngredient,
  resetIngredients,
  servings,
}: ConfirmationCookDialogProps) {
  const [modalStep, setModalStep] = useState<"ingredients" | "rating">(
    "ingredients"
  );
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const { mutateAsync: saveRecipeCooked, isPending: isSaving } =
    useSaveRecipeCooked();
  const router = useRouter();
  const validIngredients = useMemo(() => {
    return ingredients.filter((item) => !item.isConfirmationRemoved) ?? [];
  }, [ingredients]);

  const handleSave = async () => {
    const ingredients: RegisterPantryItemsCookedDto[] = validIngredients.map(
      (ing) => ({
        ingredientId: ing.ingredientId,
        measurementType: ing.isSuccessConvertion
          ? ing.measurementType
          : (ing.pantryMeasurementType as string),
        measurementValue: ing.updatedValue,
      })
    );

    const data: RegisterRecipeAsCooked = {
      recipeId: id as string,
      ingredients: ingredients,
      servings,
      rating: rating ? rating : undefined,
      notes: comment,
      image,
    };

    try {
      await saveRecipeCooked(data);
      router.back();
    } catch (error) {
      console.log("err cooking recipe", error);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona una imagen válida");
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar 5MB");
        return;
      }

      setImage(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={show} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {modalStep === "ingredients" ? (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar ingredientes utilizados</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto py-1">
              {validIngredients?.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center px-3 bg-secondary/50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{ing?.name?.es}</p>
                    {ing.isSuccessConvertion ? (
                      <p className="text-sm text-muted-foreground">
                        Disponible: {ing.availableConvertedQuantity}{" "}
                        {ing.measurementType}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Disponible: {ing.originalPantryQuantity}{" "}
                        {ing.pantryMeasurementType}
                      </p>
                    )}
                    {!ing.isSuccessConvertion ? (
                      <p className="text-xs text-destructive">
                        Conversion no disponible
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-center mt-1">
                    <p className="text-sm text-muted-foreground">
                      Cantidad utilizada:
                    </p>
                    <div className="items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => resetIngredientQuantity(ing.id)}
                      >
                        <RotateCcw size={20} />
                      </Button>
                      <QuantityInput
                        value={ing.updatedValue}
                        onChange={(val) =>
                          updateIngredientQuantity(
                            ing.id,
                            parseFloat(val.toString())
                          )
                        }
                        max={1000}
                        size="sm"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeIngredient(ing.id)}
                      >
                        <Trash />
                      </Button>
                    </div>
                    {ing.isSuccessConvertion ? (
                      <p className="text-sm text-muted-foreground">
                      {ing.measurementType}
                    </p>
                    ):(
                      <p className="text-sm text-muted-foreground">
                      {ing.pantryMeasurementType}
                    </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!validIngredients.length && (
              <div className="flex flex-col items-center justify-center">
                <p className="pb-4 font-medium">
                  Restablecer ingredientes a su estado original
                </p>
                <Button variant="hero-outline" onClick={resetIngredients}>
                  Restablecer
                </Button>
              </div>
            )}
            <DialogFooter>
              {ingredients.length > validIngredients.length && (
                <Button
                  variant="outline"
                  onClick={resetIngredients}
                  className="w-full"
                >
                  Restablecer
                </Button>
              )}
              <Button onClick={() => setModalStep("rating")} className="w-full">
                Confirmar y continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>¿Cómo te quedó la receta?</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Foto de tu platillo (opcional)
                </label>

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
                  >
                    <Camera className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Haz clic para subir una foto
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG hasta 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      width={300}
                      height={300}
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Calificación</label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredStar || rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Comentario (opcional)
                </label>
                <Textarea
                  placeholder="¿Cómo te quedó? ¿Algún tip para la próxima vez?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex-col gap-2 sm:flex-col">
              <Button
                onClick={handleSave}
                className="w-full"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : " Guardar experiencia"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setModalStep("ingredients")}
                className="w-full"
              >
                Volver
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
