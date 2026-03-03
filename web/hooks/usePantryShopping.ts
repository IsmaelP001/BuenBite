import { PantryItem, PendingPurchase } from "@/types/models/pantry";
import { useState } from "react";
import { useOptimisticMutation } from "./useOptimisticMutation";
import { registerPendingPurchase } from "@/actions/pantry";

export const usePantryShopping = (item: PantryItem) => {
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(1);


  const { mutate: registerPendingPurchaseMutation } = useOptimisticMutation({
    mutationFn: async (data: PendingPurchase) =>
      await registerPendingPurchase(data),
    queries: {
      queryKey: ["pantry_items"],
      updateCache: (oldData: any, data: any) => {
        return {
          ...oldData,
          data: oldData?.data.map((item: any) =>
            item.ingredientId === data.ingredientId
              ? {
                  ...item,
                  lowValueAlert: data.lowValueAlert,
                }
              : item
          ),
        };
      },
    },
  });
  const handleQuantityChange = (amount: number) => {
    setQuantityToAdd(amount);
  };

  const addToShoppingList = () => {
    if (!item) return;

    registerPendingPurchaseMutation({
      ingredientId: item.ingredientId!,
      pendingPurchaseQuantity: quantityToAdd,
      measurementType: item.measurementType,
    });

    setShowAddToCart(false);
  };

  const setShowAddToCartWithSync = (isOpen: boolean) => {
    if (isOpen) {
      setQuantityToAdd(item.pendingPurchaseQuantity || 1);
    }
    setShowAddToCart(isOpen);
  };

  return {
    showAddToCart,
    setShowAddToCart: setShowAddToCartWithSync,
    quantityToAdd,
    handleQuantityChange,
    addToShoppingList,
  };
};
