import { useOptimisticMutation } from "./useOptimisticMutation";
import { markActiveUserPlanAsCompleated } from "@/actions/mealplan";

export default function useMarkUserActiveMealplanAsCompleated() {

  return useOptimisticMutation({
    mutationFn: async () =>
      await markActiveUserPlanAsCompleated(),
    queries: {
      queryKey: (data: any) => ["active_user_mealplan"],
      updateCache: (oldData: any, data: any) => {
       
        const currentActiveUserPlan = {
          ...oldData.data,
          status:'completed'
        }
        return {
          ...oldData,
          data:currentActiveUserPlan
        };
      },
    },
    onSuccess(data) {},
  });
}
