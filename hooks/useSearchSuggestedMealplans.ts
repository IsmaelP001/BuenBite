'use client'
import { getAllSuggestedMealPlans } from "@/actions/mealplan";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseRecipesInfiniteProps {
  filters?: {
    dietType?: string;
    query?:string
    suitableForGoals?: string;
  };
  limit?: number;
  enabled?: boolean;
}

export function useGetSearchSuggestedMealplans({
  filters = {},
  limit = 10,
  enabled = true,
}: UseRecipesInfiniteProps = {}) {
  return useInfiniteQuery({
    queryKey: ["search_suggested_mealplans", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam.toString(),
        limit: limit.toString(),
        ...filters
      };

      return getAllSuggestedMealPlans(params)
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;

      return (lastPage?.page ?? 1) + 1;
    },
    select(data) {
      return data.pages.flatMap((item) => item.data);
    },
    enabled,
  });
}
