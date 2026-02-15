import { useOptimisticMutation } from "./useOptimisticMutation";
import { AddItemsToPurchase, ConfirmPurchaseItem } from "@/types/models/purchase";
import { confirmPurchase } from "@/actions/purchase";

export default function useConfirmPurchase() {
  return useOptimisticMutation({
    mutationFn: async(data:ConfirmPurchaseItem[])=> await confirmPurchase(data),
    queries: [
      {
        queryKey: ["user_purchases"],
        updateCache: (oldData: any, data: AddItemsToPurchase) => {
          const puchaseId = data.purchaseId;
          const updatedItems = oldData.data?.map((item: any) =>
            item?.id === puchaseId ? { ...item, status: "confirmed" } : item
          );
          return {
            ...oldData,
            data: updatedItems,
          };
        },
      },
    ],
  });
}
