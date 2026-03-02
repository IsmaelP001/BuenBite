import { getUserCookedRecipes } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserCookedRecipes({startDate}:{startDate:Date}) {

  return useQuery({
    queryKey: ["user_cooked_recipes"],
    queryFn: async () => getUserCookedRecipes(startDate),
    select(data) {
      if (!data?.data) return null;
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
