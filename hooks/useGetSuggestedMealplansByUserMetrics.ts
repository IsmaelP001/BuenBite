import { getAllSuggestedMealPlansByUserMetrics } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";

export default function useGetSuggestedMealplanByUserMetrics() {

  return useQuery({
    queryKey: ["suggested_mealplan_recipes_user_metrics"],
    queryFn: async () => {
      return await getAllSuggestedMealPlansByUserMetrics()
    },
    select(data){
        return data?.data!
    }
  });
}
