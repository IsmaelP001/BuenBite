import { useHttpApiClient } from "@/services/apiClient";
import { IaRecipeCookDto } from "@/types/models/ia";
import { IaScanPantryItems } from "@/types/models/pantry";
import { useAppMutation } from "./useAppMutation";

export default function useSaveIaScanPantryUsage() {
  const apiClient = useHttpApiClient();

  return useAppMutation(
    async (data: IaScanPantryItems[]) => {
      return apiClient.pantryService.saveIaScanPantryItemsUsage(data);
    },
    {
      invalidateQueries: ["pantry_items", "pantry_transactions"],
      toastConfig: {
        loading: "Actualizando consumo de despensa...",
        success: "Consumo actualizado correctamente",
        error: "No se pudo actualizar el consumo de despensa",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    },
  );
}

export function useSaveIaScanRecipeNutritionalValues() {
  const apiClient = useHttpApiClient();

  return useAppMutation(
    async (data: IaRecipeCookDto) => {
      return apiClient.recipeService.saveIaScanNutritionalValues(data);
    },
    {
      invalidateQueries: [
        "user_nutritional_history",
        "user_weekly_nutritional_resume",
        "recipe_cooked",
      ],
      toastConfig: {
        loading: "Guardando valores nutricionales...",
        success: "Valores nutricionales guardados",
        error: "No se pudieron guardar los valores nutricionales",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    },
  );
}

