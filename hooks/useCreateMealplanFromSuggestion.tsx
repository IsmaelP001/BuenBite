import { CreateMealPlanFromSuggestion } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { createMealPlanFromSuggestion } from "@/actions/mealplan";

export default function useCreateMealPlanFromSuggestion() {
  return useAppMutation(
    async (data: CreateMealPlanFromSuggestion) => {
      return await createMealPlanFromSuggestion(data);
    },
    {
      invalidateQueries: ["pantry_items"],
      toastConfig: {
        success: "Recetas agregadas a tu calendario de comidas.",
        error: "No se pudieron agregar las recetas. Intenta nuevamente.",
        loading: "Agendando recetas...",
      },
      toastVisibility: {
        showLoading: false,
        showSuccess: true,
        showError: true,
      },
    }
  );
}
