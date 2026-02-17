"use client";
import { useAppMutation } from "./useAppMutation";
import { createIngredient } from "@/actions/ingredients";
import { CreateIngredientDto } from "@/types/models/ingredient";

export default function useCreateIngredient() {
  return useAppMutation((data: CreateIngredientDto) => createIngredient(data), {
    toastConfig: {
      error: "Error al crear ingrediente",
    },
    toastVisibility: {
      showLoading: false,
      showSuccess: false,
      showError: true,
    },
  });
}
