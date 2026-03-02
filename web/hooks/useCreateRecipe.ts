"use client";
import { useRouter } from "next/navigation";
import {
  CreateRecipeDto,
  CreateRecipeIngredientDto,
  Instruction,
  RecipeItem,
} from "@/types/models/recipes";
import z from "zod";
import { useState } from "react";
import { useAppMutation } from "./useAppMutation";
import { createRecipe } from "@/actions/recipes";

const recipeSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre de la receta es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  image: z.file().optional(),
  prepTime: z
    .number()
    .min(1, "El tiempo de preparación debe ser mayor a 1")
    .max(1440, "El tiempo de preparación no puede exceder 24 horas"),
  cookTime: z
    .number()
    .min(1, "El tiempo de cocción debe ser mayor a 1")
    .max(1440, "El tiempo de cocción no puede exceder 24 horas"),
  servings: z
    .number()
    .min(1, "Debe servir al menos 1 porción")
    .max(100, "El número de porciones no puede exceder 100"),
  dificulty: z.enum(["easy", "medium", "hard"],'Seleccione un nivel de dificultad'),
  mealTypes: z.array(z.string()).min(1,'Seleccione al menos un tipo de comida'),
  notes: z.string().optional(),
});

const ingredientsSchema = z
  .array(z.any())
  .min(1, "Añade al menos un ingrediente");

const stepsSchema = z
  .array(
    z.object({
      step: z.string().min(1),
    })
  )
  .min(1, "Añade al menos un paso de preparación");


  export interface NewRecipeIngredient {
  ingredientId: string;
  measurementType: string;
  measurementValue: number;
  name:{
    es:string,
    fr:string;
    en:string
  }
  notes?: string;
}
export default function useCreateRecipe({
  scrollToErrFn,
}: {
  scrollToErrFn: (type: "basic" | "ingredients" | "steps") => void;
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState<Partial<RecipeItem>>({
    name: "",
    description: "",
    prepTime: 0,
    cookTime: 0,
    servings: 4,
    image: undefined,
    dificulty: undefined,
    mealTypes: [],
    instructions: [],
    notes: "",
    isSharedCommunity: false,
  });

  const [ingredients, setIngredients] = useState<NewRecipeIngredient[]>(
    []
  );
  const [steps, setSteps] = useState<Instruction[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const { mutateAsync: createRecipeMutation, isPending: isSubmitting } =
    useAppMutation(async (data: FormData) => await createRecipe(data), {
      invalidateQueries: ["user_purchases"],
      toastConfig: {
        success: "¡Receta creada con exito!",
        error: "Error al crear receta",
        loading: "Creando orden",
      },
      toastVisibility: {
        showLoading: false,
        showSuccess: true,
        showError: true,
      },
      onSuccess: () => {
        router.push(`/recipes`);
      },
    });

  const handleSave = async () => {
    const errors: Record<string, string> = {};

    const recipeValidation = recipeSchema.safeParse({
      name: recipe.name || "",
      image: recipe?.image,
      description: recipe.description,
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      servings: recipe.servings || 4,
      dificulty: recipe.dificulty,
      mealTypes: recipe.mealTypes || [],
      notes: recipe.notes,
    });

    if (!recipeValidation.success) {
      recipeValidation.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
    }

    const ingredientsValidation = ingredientsSchema.safeParse(ingredients);
    if (!ingredientsValidation.success) {
      errors.ingredients = ingredientsValidation.error.issues[0].message;
    }

    const filledSteps = steps.filter((s) => s.step.trim());
    const stepsValidation = stepsSchema.safeParse(filledSteps);
    if (!stepsValidation.success) {
      errors.steps = stepsValidation.error.issues[0].message;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (
        errors.name ||
        errors.prepTime ||
        errors.cookTime ||
        errors.servings
      ) {
        scrollToErrFn("basic");
      } else if (errors.ingredients) {
        scrollToErrFn("ingredients");
      } else if (errors.steps) {
        scrollToErrFn("steps");
      }

      return;
    }

    const fullRecipe: CreateRecipeDto = {
      name: recipe.name!,
      description: recipe.description || "",
      prepTime: recipe.prepTime || 0,
      cookTime: recipe.cookTime || 0,
      isSharedCommunity: recipe.isSharedCommunity || false,
      servings: recipe.servings || 0,
      dificulty: recipe.dificulty || undefined,
      mealTypes: recipe.mealTypes || [],
      instructions: filledSteps,
      notes: recipe.notes || "",
      image: recipe.image,
      ingredients: ingredients.map((ing) => ({
        ingredientId: ing.ingredientId,
        measurementType: ing.measurementType,
        measurementValue: ing.measurementValue,
        notes: ing.notes,
      })),
    };
    try {
      await handleCreateRecipe(fullRecipe);
      setValidationErrors({});
    } catch (error) {}
  };

  const handleCreateRecipe = async (data: CreateRecipeDto) => {
    const formData = new FormData();
    if (data?.image) {
      formData.append("image", data.image);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value?.toString() || "");
      }
    });

    await createRecipeMutation(formData);
  };

  const handleRecipeChange = (updates: Partial<RecipeItem>) => {
    setRecipe((prev) => ({ ...prev, ...updates }));
    const newErrors = { ...validationErrors };
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setValidationErrors(newErrors);
  };

  const handleAddIngredient = (ingredient: NewRecipeIngredient) => {
    setIngredients((prev) => [...prev, ingredient]);
    const newErrors = { ...validationErrors };
    delete newErrors.ingredients;
    setValidationErrors(newErrors);
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.ingredientId !== id));
  };

  return {
    handleCreateRecipe,
    isSubmitting,
    recipe,
    steps,
    ingredients,
    handleAddIngredient,
    handleRecipeChange,
    handleRemoveIngredient,
    handleSave,
    validationErrors,
    setSteps,
    setValidationErrors,
  };
}
