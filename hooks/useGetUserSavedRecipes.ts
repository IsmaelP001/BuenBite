'use client'
import {useMemo } from "react";
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
    queryKey:['user-favorites-recipes'],
    queryFn: async () => getUserSavedRecipes(),
    enabled:!isDisabled,
  });


  const filteredRecipes = useMemo(() => {
    if (!allRecipes?.data?.length) return [];
    if (!selectedMealType || selectedMealType === "all")
      return allRecipes?.data;
    return allRecipes?.data?.filter(
      (recipe) =>
        recipe.mealTypes && recipe.mealTypes.includes(selectedMealType)
    );
  }, [allRecipes, selectedMealType]);

  return {
    allRecipes: allRecipes?.data || [],
    selectedMealType,
    recipes: filteredRecipes,
    ...queryRest,
  };
}