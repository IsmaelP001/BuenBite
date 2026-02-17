"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPantryBasedRecommendedRecipes } from "@/actions/recipes";
import { useSearchParams } from "next/navigation";
import {
  GetPantryBasedRecommendedRecipesParams,
  RecommendedRecipe,
} from "@/types/models/recipes";

interface UsePantryBasedRecommendedRecipesProps {
  limit?: number;
  isDisabled?: boolean;
}
export const completitionValue = (item: RecommendedRecipe) => {
  return item.targetServingsCompletionPercentage && item.targetServings
    ? item.targetServingsCompletionPercentage
    : item.completionPercentage;
};

export default function usePantryBasedRecommendedRecipes({
  limit = 10,
  isDisabled = false,
}: UsePantryBasedRecommendedRecipesProps = {}) {
  const searchParams = useSearchParams();

  return useInfiniteQuery({
    queryKey: ["pantry_based_recommended_recipes", searchParams.get("q")],
    queryFn: async ({ pageParam = 1 }) => {
      const params: GetPantryBasedRecommendedRecipesParams = {
        page: pageParam,
        limit: limit,
        searchQuery: searchParams.get("q") ?? "",
      };
      return getPantryBasedRecommendedRecipes(params);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return (lastPage?.page ?? 1) + 1;
    },
    select(data) {

      let recipes = data.pages.flatMap((item) => item.data);

      const sort = searchParams.get("sort");
      const availability = searchParams.get("availability");

      if (availability && availability !== "all") {
        if (availability === "complete") {
          recipes = recipes.filter((item) => completitionValue(item) > 98);
        } else if (availability === "almost") {
          recipes = recipes.filter(
            (item) =>
              completitionValue(item) > 70 && completitionValue(item) < 99
          );
        } else if (availability === "partial") {
          recipes = recipes.filter(
            (item) =>
              completitionValue(item) > 30 && completitionValue(item) < 70
          );
        }
      }

      if (sort) {
        if (sort === "time") {
          recipes = recipes.sort((a, b) => a.totalTime - b.totalTime);
        } else if (sort === "availability") {
          recipes = recipes.sort(
            (a, b) => b.completionPercentage - a.completionPercentage
          );
        }
      }

      return recipes;
    },
    enabled: !isDisabled,
  });
}
