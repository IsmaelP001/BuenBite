import { RemoveMealPlanEntry } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { removeMealPlanEntry } from "@/actions/mealplan";

export default function useRemoveMealPlanEntry() {
  return useAppMutation(
    ( data: RemoveMealPlanEntry) =>
      removeMealPlanEntry(data),
    {
      invalidateQueries: [
        "user_mealplan_entries",
        "todays_user_mealplan_entries",
        "active_user_mealplan",
        "missing_mealplan_purchase_items",
      ],
      toastConfig: {
        loading: "Removiendo receta del plan...",
        success: "Receta removida del plan",
        error: "Error al remover receta",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    }
  );
}
