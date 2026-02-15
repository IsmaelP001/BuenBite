"use client";
import { MarkMealPlanAsCooked } from "@/types/models/mealplan";
import { useAppMutation } from "./useAppMutation";
import { markMealplanRecipeAsCooked } from "@/actions/mealplan";

export default function useMarkMealplanRecipeAsCooked() {
  return useAppMutation(
    async (data: MarkMealPlanAsCooked) =>
      await markMealplanRecipeAsCooked(data),
    {
      invalidateQueries: ["user_mealplan_entries"],
      toastConfig: {
        error: "Error al marcar receta como cocinada",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: false,
        showError: true,
      },
    }
  );
}
