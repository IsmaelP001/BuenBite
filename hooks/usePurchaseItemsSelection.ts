import { useState } from "react";

interface UseItemSelectionProps {
  initialSelectedItems?: PurchaseItemDto[];
}

export interface PurchaseItemDto {
  pantryId?: string;
  ingredientName: string;
  category: string;
  expirationDate?: string;
  measurementType: string;
  amountToBuy: number;
}

export default function usePurchaseItemSelection({ 
  initialSelectedItems = [] 
}: UseItemSelectionProps = {}) {
  const [selectedItems, setSelectedItems] = useState<PurchaseItemDto[]>(initialSelectedItems);

  const handleToggleSelect = (itemData: PurchaseItemDto) => {
    const itemId = itemData.pantryId;
    if (!itemId) return;

    setSelectedItems((prev) => {
      const isAlreadySelected = prev.some(item => item.pantryId === itemId);
      
      if (isAlreadySelected) {
        return prev.filter(item => item.pantryId !== itemId);
      } else {
        return [...prev, itemData];
      }
    });
  };

  const handleSelectItem = (itemData: PurchaseItemDto) => {
    const itemId = itemData.pantryId;
    if (!itemId) return;

    setSelectedItems((prev) => {
      const isAlreadySelected = prev.some(item => item.pantryId === itemId);
      if (!isAlreadySelected) {
        return [...prev, itemData];
      }
      return prev;
    });
  };

    const handleMultipleSelectAll = (items: PurchaseItemDto[]) => {
    setSelectedItems(items);
  };

  const handleDeselectItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter(item => item.pantryId !== itemId));
  };



  const handleDeselectAll = () => {
    setSelectedItems([]);
  };

  const isSelected = (itemId: string) => {
    return selectedItems.some(item => item.pantryId === itemId);
  };

  const getSelectedCount = () => selectedItems.length;

  const getSelectedItems = (): string[] => {
    return selectedItems.map(item => item.pantryId).filter(Boolean) as string[];
  };

  const getSelectedItemsData = (): PurchaseItemDto[] => {
    return selectedItems;
  };

  const getSelectedItemData = (itemId: string): PurchaseItemDto | undefined => {
    return selectedItems.find(item => item.pantryId === itemId);
  };

  const updateSelectedItemData = (itemId: string, newData: Partial<PurchaseItemDto>) => {
    setSelectedItems((prev) =>
      prev.map(item =>
        item.pantryId === itemId ? { ...item, ...newData } : item
      )
    );
  };

  return {
    selectedItems,
    handleToggleSelect,
    handleSelectItem,
    handleDeselectItem,
    handleDeselectAll,
    isSelected,
    getSelectedCount,
    getSelectedItems,
    getSelectedItemsData,
    getSelectedItemData,
    updateSelectedItemData,
  };
}