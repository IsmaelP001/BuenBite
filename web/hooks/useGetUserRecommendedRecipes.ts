"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserRecommendedRecipes } from "@/actions/recipes";

interface UseGetRecommendedByPantryProps {
  isDisabled?: boolean;
  selectedMealType?: string;
}

export default function useGetUserRecommended({
  selectedMealType,
  isDisabled = false,
}: UseGetRecommendedByPantryProps) {
  const {
    data: allRecipes,
    refetch,
    ...queryRest
  } = useQuery({
    queryKey: ["recepies_recommended"],
    queryFn: async () => await getUserRecommendedRecipes(),
    enabled: isDisabled,
  });

  const filteredRecipes = useMemo(() => {
    const allRecipesData = allRecipes?.data || [];
    allRecipesData.sort(
      (a, b) => b.completionPercentage - a.completionPercentage,
    );
    if (!selectedMealType || selectedMealType === "all") return allRecipesData;
    return allRecipesData.filter(
      (recipe) =>
        recipe.mealTypes && recipe.mealTypes.includes(selectedMealType),
    );
  }, [allRecipes, selectedMealType]);

  return {
    allRecipes: allRecipes?.data || [],
    selectedMealType,
    recipes: filteredRecipes,
    ...queryRest,
    refetch,
  };
}
