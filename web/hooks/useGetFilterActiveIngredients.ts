import { getFilterActiveIngredients } from "@/actions/ingredients";
import { useQuery } from "@tanstack/react-query";


export default function useGetFilterActiveIngredients() {

  return useQuery({
    queryKey: ["filter_active_ingredients"],
    queryFn: async () =>
      await getFilterActiveIngredients(),
    select(data) {
      if (!data?.data?.length) return [];
      return data.data;
    },
    staleTime:24 * 24 * 24 * 50
  });
}
