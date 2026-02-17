import { getMealPlanMissingPantryItems } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type UpdateQuantityMissingItem = {
  id: string;
  newValue: number;
};

interface UseMealPlanMissingIngredientsProps {
  searchQuery?: string;
  selectedCategory?: string;
  dateRangeFilter: { startDate: string; endDate: string };
}

export default function useMissingMealPlanPurchaseItems({
  dateRangeFilter,
  searchQuery = "",
  selectedCategory = "all",
}: UseMealPlanMissingIngredientsProps) {

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["USER-MISSING-PLAN-PANTRY-ITEMS",dateRangeFilter],
     queryFn: async () =>
       await getMealPlanMissingPantryItems(dateRangeFilter),
    select(data: any) {
      if (!data?.data?.length) return [];
      return data.data.map((item: any) => {
        const pending = item.pendingPurchaseQuantity || 0;
        const recurrent = item?.isRecurrent ? item.recurrentAmount : 0;
        const recommended = item.missingValue || 0;
        const amountToBuy =
          pending > 0 || recurrent > 0 ? pending + recurrent : recommended;

        return {
          ...item,
          amountToBuy: Math.round(amountToBuy || 1),
        };
      });
    },
    staleTime: 66 * 60 * 60 * 24,
  });


  const filteredItems = useMemo(() => {
    let filtered = (data ?? []);

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.ingredientName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    return filtered;
  }, [data, searchQuery, selectedCategory]);



  return {
    mealplanItems: filteredItems,
    totalItems: data?.length || 0,
    isPending,
    isError,
    error,
    refetch,
  };
}
