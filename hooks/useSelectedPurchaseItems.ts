import { useCallback, useMemo, useState } from "react";
interface SelectedMapItem {
  amount: number;
  unitType: string;
}

type SelectedMap = Record<string, SelectedMapItem>;

export const useSelectedPurchaseItems = () => {
  const [selectedMap, setSelectedMap] = useState<SelectedMap>({});

  const addSelected = useCallback(
    (id: string, amount: number, unitType: string) => {
      setSelectedMap((prev) => {
        if (prev[id] && prev[id].amount === amount) return prev;
        return { ...prev, [id]: { amount, unitType } };
      });
    },
    []
  );

  const removeSelected = useCallback((id: string) => {
    setSelectedMap((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const toggleSelect = useCallback(
    (id: string, dbAmount = 1, unitType: string) => {
      setSelectedMap((prev) => {
        if (prev[id]) {
          const next = { ...prev };
          delete next[id];
          return next;
        } else {
          return {
            ...prev,
            [id]: {
              amount: Math.max(1, Math.floor(dbAmount || 1)),
              unitType,
            },
          };
        }
      });
    },
    []
  );

  const updateSelectedAmount = useCallback((id: string, amount: number) => {
    setSelectedMap((prev) => {
      const current = prev[id];
      if (!current) return prev;
      if (current.amount === amount) return prev;
      return {
        ...prev,
        [id]: { ...current, amount: Math.max(1, Math.floor(amount)) },
      };
    });
  }, []);

  const isSelected = useCallback(
    (id: string): boolean => Boolean(selectedMap[id]),
    [selectedMap]
  );

  const getSelectedAmount = useCallback(
    (id: string): number | undefined => selectedMap[id]?.amount,
    [selectedMap]
  );

  const selectedItemsArray = useMemo(
    () =>
      Object.entries(selectedMap).map(([id, { amount, unitType }]) => ({
        id,
        amount,
        unitType,
      })),
    [selectedMap]
  );

  return {
    selectedMap,
    totalSelectedArticles:(Object.entries(selectedMap)?.length ?? 0),
    addSelected,
    removeSelected,
    toggleSelect,
    updateSelectedAmount,
    isSelected,
    getSelectedAmount,
    selectedItemsArray,
  };
};
