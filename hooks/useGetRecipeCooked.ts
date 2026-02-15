'use client'
import { getRecipeCooked } from "@/actions/recipes";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetRecipeCooked() {
  const { id } = useParams();

  const query = useInfiniteQuery({
    queryKey: ["recipe_cooked",id],
    queryFn: async ({ pageParam = 1 }) => {
      return await getRecipeCooked({
        recipeId: id as string,
        limit: 10,
        page: pageParam as number,
      });
    },
    initialPageParam: 0,
    getNextPageParam(lastPage) {
      if (!lastPage.hasMore) return undefined;
      return (lastPage?.page ?? 1) + 1;
    },
    select(data) {
      return data.pages.flatMap((item) => item.data);
    },
  });

  return {
    ...query,
  };
}
