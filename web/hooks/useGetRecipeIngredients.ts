"use client"
import { getRecipeIngredients } from "@/actions/recipes";
import { IngredientsAnalysisResult } from "@/types/models/pantry";
import { RecipeIngredient } from "@/types/models/recipes";
import {useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetRecipeIngredients() {
    const { id } = useParams();
  
  return useSuspenseQuery({
    queryKey: ["recipe_ingredients", id],
    queryFn: async () => await getRecipeIngredients(id as string),
    select(data) {
      if (!data?.data) return null;
      return data?.data as IngredientsAnalysisResult<RecipeIngredient>
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
