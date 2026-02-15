import { useOptimisticMutation } from "./useOptimisticMutation";
import { cancelActiveUserPlan } from "@/actions/mealplan";

export default function useCancelActiveUserPlan() {

  return useOptimisticMutation({
    mutationFn: async () =>
      await cancelActiveUserPlan(),
    queries: {
      queryKey: (data: any) => ["active_user_mealplan"],
      updateCache: (oldData: any, data: any) => {
       
        const currentActiveUserPlan = {
          ...oldData.data,
          status:'canceled'
        }
        return {
          ...oldData,
          data:currentActiveUserPlan
        };
      },
    },
  });
}
