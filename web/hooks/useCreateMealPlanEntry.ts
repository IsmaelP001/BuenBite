'use client'
import { ScheduleRecipeMealPlanDto } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { createMealPlanEntry } from "@/actions/mealplan";


export default function useCreateMealPlanEntry() {

  return useAppMutation(
    ( data: ScheduleRecipeMealPlanDto) =>
      createMealPlanEntry(data),
    {
      invalidateQueries: ["user_mealplan_entries"],
        toastConfig: {
        error: "Error al añadir receta",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: false,
        showError: true,
      },
    }
  );

}
