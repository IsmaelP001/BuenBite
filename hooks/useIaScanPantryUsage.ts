import { useHttpApiClient } from "@/services/apiClient";
import { IaRecipeCookDto } from "@/types/models/ia";
import { IaScanPantryItems } from "@/types/models/pantry";
import { useMutation } from "@tanstack/react-query";

export default function useSaveIaScanPantryUsage() {
  const apiClient = useHttpApiClient();

  return useMutation({
    mutationFn: async (data: IaScanPantryItems[]) => {
      return await apiClient.pantryService.saveIaScanPantryItemsUsage(data);
    },
    onSuccess: () => {
    },
    onError: (error: any) => {},
  });
}

export  function useSaveIaScanRecipeNutritionalValues() {
  const apiClient = useHttpApiClient();

  return useMutation({
    mutationFn: async (data: IaRecipeCookDto) => {
      return await apiClient.recipeService.saveIaScanNutritionalValues(data);
    },
    onSuccess: () => {
    },
    onError: (error: any) => {},
  });
}


