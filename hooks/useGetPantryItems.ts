import { getUserPantryItems } from "@/actions/pantry";
import { PantryItem } from "@/types/models/pantry";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface FilterOptions {
  foodCategory?: string;
  ingredientName?: string;
  activeFilters?: FilterType[];
  initialData?: any[];
}

interface GroupedPantry {
  category: string;
  items: any[];
}

interface CategorySummary {
  label: string;
  id: string;
  count: number;
}

export type FilterType =
  | "all"
  | "low_stock"
  | "expiring"
  | "alerted"
  | "for_purchase";

export default function useGetPantryItems({
  foodCategory,
  ingredientName,
  activeFilters = ["all"],
}: FilterOptions) {
  const { data, isPending, refetch, ...rest } = useSuspenseQuery({
    queryKey: ["pantry_items"],
    queryFn: async () => await getUserPantryItems(),
    select(data) {
      let results = data?.data || [];

      if (!results.length) {
        return results;
      }

      const hasActiveFilters =
        activeFilters.length > 0 && !activeFilters.includes("all");

      if (foodCategory || hasActiveFilters || ingredientName) {
        results = results.filter((item) => {
          const matchCategory =
            !foodCategory || foodCategory === "all"
              ? true
              : item.category?.toLowerCase() === foodCategory.toLowerCase();

          let matchName = true;
          if (ingredientName) {
            const search = ingredientName.toLowerCase();

            matchName = Object.values(item.name)
              .filter(Boolean)
              .some((name) => name.toLowerCase().includes(search));
          }

          let matchFilter = true;

          if (activeFilters.includes("all")) {
            matchFilter = true;
          } else if (hasActiveFilters) {
            matchFilter = activeFilters.some((filter) => {
              if (filter === "low_stock") {
                return item?.isLowStock === true;
              } else if (filter === "expiring") {
                return item?.isExpiring === true;
              } else if (filter === "for_purchase") {
                return (
                  (item?.pendingPurchaseQuantity !== undefined &&
                    item.pendingPurchaseQuantity > 0) ||
                  item?.isLowStock === true ||
                  item?.isExpiring === true
                );
              } else if (filter === "alerted") {
                return false;
              }
              return false;
            });
          }

          const result = matchCategory && matchName && matchFilter;

          return result;
        });
      }

      return results;
    },
    staleTime: 60 * 60 * 1000 * 24,
  });

  const groupedPantryItems: GroupedPantry[] = useMemo(() => {
    if (!data?.length || isPending) return [];

    const groups: Record<string, any[]> = {};

    data.forEach((item: any) => {
      const category = item?.category || "Sin categoría";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  }, [data, isPending]);

  const categoriesSummary: CategorySummary[] = useMemo(() => {
    return groupedPantryItems.map((group) => ({
      label: group.category,
      id: group.category,
      count: group.items.length,
    }));
  }, [groupedPantryItems]);

  const lowStockItems: PantryItem[] = useMemo(() => {
    const result = data?.filter((item) => item?.isLowStock === true) ?? [];
    return result;
  }, [data]);

  const expiringProductsItems: PantryItem[] = useMemo(() => {
    const results = data?.filter((item) => item?.isExpiring === true) ?? [];
    return results;
  }, [data]);

   const pendingPurchaseProduts: PantryItem[] = useMemo(() => {
    const results = data?.filter((item) => item?.pendingPurchaseQuantity > 0) ?? [];
    return results;
  }, [data]);

  return {
    pantryItems: groupedPantryItems,
    ungroupedPantryItems: data,
    categories: categoriesSummary,
    isPending,
    refetch,
    lowStockItems,
    expiringProductsItems,
    pendingPurchaseProduts,
    ...rest,
  };
}
