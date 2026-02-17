import { useState } from "react";
import useGetPantryItems from "./useGetPantryItems";
import { PantryItem } from "@/types/models/pantry";

export type UpdateQuantityPantryItem = {
  id: string;
  newValue: any;
};
export type RemoveItemPantryItem = { id: string };

export type ItemsByCategory = {
  category: string;
  items: PantryItem[];
};

interface GetPantryPurchaseItemsProps {
  selectedCategory: string;
  ingredientName?: string;
}


export default function useGetPantryPurchaseItems({
  selectedCategory,
  ingredientName,
}: GetPantryPurchaseItemsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { pantryItems, ungroupedPantryItems, isPending, ...rest } =
    useGetPantryItems({
      foodCategory: selectedCategory,
      ingredientName,
    });

  return {
    itemsByCategory: pantryItems,
    productItems: ungroupedPantryItems,
    totalItems: ungroupedPantryItems?.length || 0,
    isPending,
    searchQuery,
    setSearchQuery,
    ...rest,
  };
}
