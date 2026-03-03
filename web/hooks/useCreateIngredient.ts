"use client";
import { useAppMutation } from "./useAppMutation";
import { createIngredient } from "@/actions/ingredients";
import { CreateIngredientDto } from "@/types/models/ingredient";

export default function useCreateIngredient() {
  return useAppMutation((data: CreateIngredientDto) => createIngredient(data), {
    invalidateQueries: ["ingredients"],
    toastConfig: {
      loading: "Creando ingrediente...",
      success: "Ingrediente creado correctamente",
      error: "Error al crear ingrediente",
    },
    toastVisibility: {
      showLoading: true,
      showSuccess: true,
      showError: true,
    },
  });
}
