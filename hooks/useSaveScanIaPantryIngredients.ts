import { useHttpApiClient } from "@/services/apiClient";
import { IaScanPantryItems } from "@/types/models/pantry";
import { useMutation } from "@tanstack/react-query";

export default function useSaveScanIaPantryIngredients() {
  const apiClient = useHttpApiClient();

  return useMutation({
    mutationFn: async (data: IaScanPantryItems[]) => {
      return await apiClient.pantryService.saveIaScanPantryItems(data);
    },
    onSuccess: () => {
      // router.push("/(tabs)/pantry");
    },
    onError: (error: any) => {
    
    },
  });
}
