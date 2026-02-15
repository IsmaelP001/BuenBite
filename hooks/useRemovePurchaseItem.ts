import { useOptimisticMutation } from "./useOptimisticMutation";
import { useParams } from "next/navigation";
import { removePurchaseItem } from "@/actions/purchase";

export interface PurchaseItemOptimistic {
  purchaseId: string;
  items: {
    ingredientId: string;
    measurementType: string;
    amountToBuy: number;
    name: { en: string; es: string; fr: string };
    category: string;
    id: string;
  }[];
}

export default function useRemovePurchaseItem() {
  const { id } = useParams<{ id: string }>();

  return useOptimisticMutation({
    mutationFn: async (id: string) =>
      await removePurchaseItem(id),
    queries: {
      queryKey: () => ["user_purchases_items", id],
      updateCache: (oldData: any, purchaseItemId: string) => {
        const filteredPurchaseItems = oldData.data.filter(
          (item: any) => item.id !== purchaseItemId
        );

        return {
          ...oldData,
          data: filteredPurchaseItems,
        };
      },
    },
  });
}
