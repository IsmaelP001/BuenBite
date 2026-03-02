import { getPurchaseItems } from "@/actions/purchase";
import {  useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export default function useGetPurchaseItems(id?: string) {

  const [purchaseItemsMap, setPurchaseItemsMap] = useState<
    Map<string, { originalQuantity: number; currentQuantity: number }>
  >(new Map());

  const { data, isPending } = useSuspenseQuery({
    queryKey: ["user_purchases_items", id],
    queryFn: async () =>
      getPurchaseItems(id as string),
    select: (res) => res?.data ?? [],
    staleTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (!data) return;

    const map = new Map<
      string,
      { originalQuantity: number; currentQuantity: number }
    >();

    data.forEach((item) => {
      map.set(item.id, {
        originalQuantity: item.amountToBuy,
        currentQuantity: item.amountToBuy,
      });
    });

    setPurchaseItemsMap(map);
  }, [data]);

  const updateItemQuantity = (id: string, newQuantity: number) => {
    setPurchaseItemsMap((prev) => {
      const next = new Map(prev);
      const item = next.get(id);
      if (!item) return prev;

      next.set(id, {
        ...item,
        currentQuantity: newQuantity,
      });

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
