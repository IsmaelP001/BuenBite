"use client";
import { useAppMutation } from "./useAppMutation";
import { setUpUserNutritionalMetrics } from "@/actions/user";

export default function useSetUpUserNutritionalMetrics() {
  

  return useAppMutation(
    async (data: Record<string, unknown>) => {
      return await setUpUserNutritionalMetrics(data);
    },
    {
      invalidateQueries: [
        "user_preferences",
        "user_nutritional_metrics",
        "suggested_mealplan_recipes_user_metrics",
      ],
      toastConfig: {
        loading: "Guardando tus datos nutricionales...",
        success: 'Datos nutricionales guardados con exito',
        error: 'Error al guardar tus datos nutricionales',
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    }
  );
}
