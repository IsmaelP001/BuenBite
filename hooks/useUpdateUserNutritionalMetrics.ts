import { UserNutritionMetrics } from "@/types/models/user";
import { useOptimisticMutation } from "./useOptimisticMutation";
import { updateUserNutritionalMetrics } from "@/actions/user";


export default function useUpdateUserNutritionalMetrics() {
  return useOptimisticMutation({
    mutationFn: async (data: Partial<UserNutritionMetrics>) =>
      await updateUserNutritionalMetrics(data),
    queries: {
      queryKey: (data: any) => ["user_nutritional_metrics"],
      updateCache: (oldData: any, data: any) => {
        return {
          ...oldData,
          data: {
            ...oldData.data,
            ...data,
          }
        };
      },
    },
    debounce:{
      delay:2000,
      leading:true,
    }
  });
}
