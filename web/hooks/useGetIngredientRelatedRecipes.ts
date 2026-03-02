import { searchRecipes } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";

interface UseSearchRecipesProps {
  ingredientId:string;
}
export default function useGetIngredientRelatedRecipes({
ingredientId
}: UseSearchRecipesProps) {

  return useQuery({
    queryKey: ["searchRecipes", ],
    queryFn: async () =>
      await searchRecipes({
        ingredientIds:[ingredientId],
        limit:3
      }),
    select(data) {
      if (!data?.data) return [];
      return data.data;
    },
  });
}
