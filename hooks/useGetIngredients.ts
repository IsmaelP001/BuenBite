import { getIngredients } from "@/actions/ingredients";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface UseGetIngredients {
  searchValue?: string;
  isDisabled?: boolean;
}
interface CategorySummary {
  label: string;
  id:string;
  count?: number;
}
export default function useGetIngredients({
  searchValue,
  isDisabled = false,
}: UseGetIngredients) {

  const { data: ingredients, isPending } = useQuery({
    queryKey: ["ingredients", searchValue],
    queryFn: async () =>
      await getIngredients({ query: searchValue }),
    select(data) {
      if (!data?.data?.length) return [];

      return data.data;
    },
    enabled:!isDisabled
  });

  const groupedIngredients = useMemo(() => {
    if (!ingredients?.length || isPending) return [];

    const groups: Record<string, any[]> = {};

    ingredients.forEach((item) => {
      const category = item?.category ;

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  }, [ingredients, isPending]);

    const categoriesSummary: CategorySummary[] = useMemo(() => {
      const ingredients= groupedIngredients.map((group) => ({
        label: group.category,
        id:group.category,
        count: group.items.length,
      }));
      return [{id:'all',label:'Todos'},...ingredients]
    }, [groupedIngredients]);

  return {
    ingredients,
    groupedIngredients,
    isPending,
    categoriesSummary
  };
}
