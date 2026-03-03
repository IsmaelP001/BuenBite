import { getPurchaseItems } from "@/actions/purchase";
import {  useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

type QuantityMap = Map<string, { originalQuantity: number; currentQuantity: number }>;

export default function useGetPurchaseItems(id?: string) {
  const [quantityOverrides, setQuantityOverrides] = useState<
    Map<string, number>
  >(new Map());

  const { data, isPending } = useSuspenseQuery({
    queryKey: ["user_purchases_items", id],
    queryFn: async () =>
      getPurchaseItems(id as string),
    select: (res) => res?.data ?? [],
    staleTime: 1000 * 60 * 60 * 24,
  });

  const purchaseItemsMap = useMemo<QuantityMap>(() => {
    const map: QuantityMap = new Map();
    if (!data) return map;

    data.forEach((item) => {
      const currentQuantity = quantityOverrides.get(item.id) ?? item.amountToBuy;
      map.set(item.id, {
        originalQuantity: item.amountToBuy,
        currentQuantity,
      });
    });

    return map;
  }, [data, quantityOverrides]);

  const updateItemQuantity = (id: string, newQuantity: number) => {
    setQuantityOverrides((prev) => {
      const next = new Map(prev);
      next.set(id, newQuantity);
      return next;
    });
  };

  return {
    data,
    purchaseItemsMap,
    updateItemQuantity,
    isPending,
  };
}
