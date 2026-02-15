import { useOptimisticMutation } from "./useOptimisticMutation";
import { useRouter } from "next/navigation";
import { addItemsToPurchase } from "@/actions/purchase";

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

export default function useAddItemsToPurchaseOrder() {
  const router = useRouter();

  return useOptimisticMutation({
    mutationFn: async (data: PurchaseItemOptimistic) =>
      await addItemsToPurchase(data),
    queries: {
      queryKey: (data: PurchaseItemOptimistic) => [
        "user_purchases_items",
        data.purchaseId,
      ],
      updateCache: (oldData: any, data: any) => {
        const existingIds = new Set(
          oldData.data.map((item: any) => item.ingredientId)
        );

        const newUniqueItems = data.items.filter(
          (item: any) => !existingIds.has(item.ingredientId)
        );

        const updatedItems = [...newUniqueItems,...oldData.data, ];
        return {
          ...oldData,
          data: updatedItems,
        };
      },
    },
    onMutate(variables) {
      router.push(`/purchases/history/${variables.purchaseId}`);
    },
  });
}
