'use client'
import { ScheduleRecipeMealPlanDto } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { createMealPlanEntry } from "@/actions/mealplan";


export default function useCreateMealPlanEntry() {

  return useAppMutation(
    ( data: ScheduleRecipeMealPlanDto) =>
      createMealPlanEntry(data),
    {
      invalidateQueries: [
        "user_mealplan_entries",
        "active_user_mealplan",
        "todays_user_mealplan_entries",
      ],
      toastConfig: {
        loading: "Agendando receta...",
        success: "Receta agendada correctamente",
        error: "Error al añadir receta",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    }
  );

}
