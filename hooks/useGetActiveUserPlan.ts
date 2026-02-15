import { getActiveUserPlan } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";


export default function useGetDefaultSuggestedMealplans() {

  return useQuery({
    queryKey: ["active_user_mealplan"],
    queryFn: async () => await getActiveUserPlan(),
    select(data){
      const results = data?.data || null;
      return results
    }
  });
}
