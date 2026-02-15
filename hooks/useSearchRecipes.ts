import { searchRecipes } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";

interface UseSearchRecipesProps {
  searchParams: Record<string, any>;
}
export default function useSearchRecipes({
  searchParams,
}: UseSearchRecipesProps) {
  const paramsValues = Object.values(searchParams).filter((value) => value !== undefined && value !== null && value !== '');
  

  return useQuery({
    queryKey: ["searchRecipes", paramsValues.join(",")],
    queryFn: async () =>
      await searchRecipes(searchParams),
    select(data) {
      if (!data?.data) return [];
      return data.data;
    },
    enabled: paramsValues.length > 0,
  });
}
