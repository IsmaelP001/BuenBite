import { useHttpApiClient } from "@/services/apiClient";
import { IaScanPantryItems } from "@/types/models/pantry";
import { useAppMutation } from "./useAppMutation";

export default function useSaveScanIaPantryIngredients() {
  const apiClient = useHttpApiClient();

  return useAppMutation(
    async (data: IaScanPantryItems[]) => {
      return apiClient.pantryService.saveIaScanPantryItems(data);
    },
    {
      invalidateQueries: ["pantry_items", "pantry_transactions"],
      toastConfig: {
        loading: "Guardando ingredientes detectados...",
        success: "Ingredientes guardados en la despensa",
        error: "No se pudieron guardar los ingredientes escaneados",
      },
      toastVisibility: {
        showLoading: true,
        showSuccess: true,
        showError: true,
      },
    },
  );
}
