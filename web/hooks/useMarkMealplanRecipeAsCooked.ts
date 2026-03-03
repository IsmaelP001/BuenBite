"use client";
import { MarkMealPlanAsCooked } from "@/types/models/mealplan";
import { useAppMutation } from "./useAppMutation";
import { markMealplanRecipeAsCooked } from "@/actions/mealplan";

export default function useMarkMealplanRecipeAsCooked() {
  return useAppMutation(
    async (data: MarkMealPlanAsCooked) =>
      await markMealplanRecipeAsCooked(data),
    {
      invalidateQueries: [
        "user_mealplan_entries",
        "todays_user_mealplan_entries",
        "active_user_mealplan",
        "pantry_items",
        "pantry_transactions",
        "user_nutritional_history",
      ],
      toastConfig: {
        loading: "Registrando receta cocinada...",
        success: "Receta marcada como cocinada",
        error: "Error al marcar receta como cocinada",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    }
  );
}
