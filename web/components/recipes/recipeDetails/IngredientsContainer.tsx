import { getQueryClient } from "@/lib/queryClient";
import { ApiClient } from "@/services/apiClient";
import React from "react";
import IngredientSidebar from "./IngredientSidebar";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default function IngredientsContainer({ id }: { id: string }) {
  const queryClient = getQueryClient();
  const apiClient = new ApiClient();
  queryClient.prefetchQuery({
    queryKey: ["recipe_ingredients", id],
    queryFn: async () =>
      await apiClient.recipeService.getRecipeIngredients(id as string),
  });

  queryClient.prefetchQuery({
    queryKey: ["recepies_by_id", id],
    queryFn: async () =>
      await apiClient.recipeService.getRecipeById(id as string),
  });

  return (
    <>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <IngredientSidebar />
      </HydrationBoundary>
    </>
  );
}
