'use client'
import {  useMemo } from "react";
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
    if (!allRecipes?.data?.length) return [];
    if (!selectedMealType || selectedMealType === "all")
      return allRecipes?.data;
    return allRecipes?.data?.filter(
      (recipe: any) =>
        recipe.mealTypes && recipe.mealTypes.includes(selectedMealType)
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
