"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSavedRecipes } from "@/actions/recipes";

interface UseGetUserSavedRecipeProps {
  selectedMealType?: string;
  isDisabled?: boolean;
}

export default function useGetUserSavedRecipe({
  selectedMealType,
  isDisabled = false,
}: UseGetUserSavedRecipeProps) {
  const { data: allRecipes, ...queryRest } = useQuery({
    queryKey: ["user-favorites-recipes"],
    queryFn: async () => getUserSavedRecipes(),
    enabled: !isDisabled,
  });

  const filteredRecipes = useMemo(() => {
    const allRecipesData = allRecipes?.data || [];
    allRecipesData.sort(
      (a, b) => b.completionPercentage - a.completionPercentage,
    );

    if (!selectedMealType || selectedMealType === "all") {
      return allRecipesData;
    }

    const recipesFiltered = allRecipesData.filter(
      (recipe) =>
        recipe.mealTypes && recipe.mealTypes.includes(selectedMealType),
    );

    return recipesFiltered;
  }, [allRecipes, selectedMealType]);

  return {
    allRecipes: allRecipes?.data || [],
    selectedMealType,
    recipes: filteredRecipes,
    ...queryRest,
  };
}
