import { RemoveMealPlanEntry } from "@/types/models/recipes";
import { useAppMutation } from "./useAppMutation";
import { removeMealPlanEntry } from "@/actions/mealplan";

export default function useRemoveMealPlanEntry() {
  return useAppMutation(
    ( data: RemoveMealPlanEntry) =>
      removeMealPlanEntry(data),
    {
      invalidateQueries: ["user_mealplan_entries"],
      toastConfig: {
        error: "Error al remover receta",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: false,
        showError: true,
      },
    }
  );
}
