'use client'
import { getSuggestedMealPlansByCategory } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";

export default function useGetSuggestedMealplansByCategory() {

  return useQuery({
    queryKey: ["suggested_mealplan_by_category"],
    queryFn: async () => {
      return await getSuggestedMealPlansByCategory({limit:3})
    },
    select(data){
        return data?.data!
    }
  });
}
