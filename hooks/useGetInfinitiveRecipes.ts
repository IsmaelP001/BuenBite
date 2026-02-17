'use client'
import { getRecipes } from "@/actions/recipes";
import { useInfiniteQuery } from "@tanstack/react-query";


interface UseRecipesInfiniteProps {
  filter?: {
    userId?: string;
    onlyCommunityRecipes?: boolean;
  };
  limit?: number;
  enabled?: boolean;
}

export function useRecipesInfinite({
  filter = {},
  limit = 10,
  enabled = true,
}: UseRecipesInfiniteProps = {}) {
  return useInfiniteQuery({
    queryKey: ["recipes", "infinite", filter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam.toString(),
        limit: limit.toString(),
        ...(filter.userId && { userId: filter.userId }),
        ...(filter.onlyCommunityRecipes !== undefined && {
          onlyCommunityRecipes: filter.onlyCommunityRecipes.toString(),
        }),
      };

      return getRecipes(params);
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
