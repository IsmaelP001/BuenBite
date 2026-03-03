import { CreateMealPlanFromSuggestion } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { createMealPlanFromSuggestion } from "@/actions/mealplan";

export default function useCreateMealPlanFromSuggestion() {
  return useAppMutation(
    async (data: CreateMealPlanFromSuggestion) => {
      return await createMealPlanFromSuggestion(data);
    },
    {
      invalidateQueries: [
        "pantry_items",
        "user_mealplan_entries",
        "active_user_mealplan",
        "todays_user_mealplan_entries",
        "default_suggested_mealplan",
      ],
      toastConfig: {
        success: "Recetas agregadas a tu calendario de comidas.",
        error: "No se pudieron agregar las recetas. Intenta nuevamente.",
        loading: "Agendando recetas...",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    }
  );
}
