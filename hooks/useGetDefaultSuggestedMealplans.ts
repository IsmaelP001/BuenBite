import { getDefaultSuggestedMealPlans } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";


export default function useGetDefaultSuggestedMealplans() {

  return useQuery({
    queryKey: ["default_suggested_mealplan"],
    queryFn: async () => await getDefaultSuggestedMealPlans(),
    select(data){
      const results = data?.data || [];
      return results
    },
  });
}
