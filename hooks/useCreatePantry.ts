"use client";
import { createPantryItem } from "@/actions/pantry";
import { useAppMutation } from "./useAppMutation";

export default function useCreatePantry() {
  return useAppMutation(createPantryItem, {
    invalidateQueries: ["pantry_items"],
    toastConfig: {
      success: "¡Ingrediente añadido a tu despensa con exito!",
      error: "Error al añadir ingrediente a tu despensa",
      loading: "Añadiendo ingrediente",
    },
    toastVisibility: {
      showLoading: false,
      showSuccess: true,
      showError: true,
    },
  });
}
