import { getAllSuggestedMealPlans } from "@/actions/mealplan";
import { useInfiniteQuery } from "@tanstack/react-query";


interface UseRecipesInfiniteProps {

  limit?: number;
  enabled?: boolean;
}

export function useGetInfinitySuggestedMealplans({
  limit = 10,
  enabled = true,
}: UseRecipesInfiniteProps = {}) {
  return useInfiniteQuery({
    queryKey: ["suggested_mealplan_infinitive"],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        limit: limit,
      };
      return getAllSuggestedMealPlans(params);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
     
      return (lastPage?.page ?? 1)+ 1;
    },
    select(data){
        return data.pages.flatMap(item=>item.data);
    },
    enabled,
  });
}
