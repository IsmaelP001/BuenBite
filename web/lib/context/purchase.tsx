'use client';
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface SelectedItem {
  id: string;
  amount: number;
  unitType: string;
}

interface SelectedItemsContextType {
  toggleSelect: (id: string, dbAmount: number, unitType: string) => void;
  addSelected: (id: string, amount: number, unitType: string) => void;
  removeSelected: (id: string) => void;
  updateSelectedAmount: (id: string, amount: number) => void;
  isSelected: (id: string) => boolean;
  getSelectedAmount: (id: string) => number | undefined;
  selectedItemsArray: SelectedItem[];
}

interface SelectedMapItem {
  amount: number;
  unitType: string;
}

type SelectedMap = Record<string, SelectedMapItem>;

const SelectedItemsContext = createContext<SelectedItemsContextType | undefined>(undefined);

export const SelectedPurchaseItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

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
      (id: string, dbAmount = 0, unitType: string) => {
        setSelectedMap((prev) => {
          if (prev[id]) {
            const next = { ...prev };
            delete next[id];
            return next;
          } else {
            return {
              ...prev,
              [id]: {
                amount: Math.max(0, Math.floor(dbAmount || 0)),
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
          [id]: { ...current, amount: Math.max(0, Math.floor(amount)) },
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

  const value = {
    toggleSelect,
    addSelected,
    removeSelected,
    updateSelectedAmount,
    isSelected,
    getSelectedAmount,
    selectedItemsArray
  };

  return (
    <SelectedItemsContext.Provider value={value}>
      {children}
    </SelectedItemsContext.Provider>
  );
};

export const useSelectedPurchaseItems = () => {
  const context = useContext(SelectedItemsContext);
  if (context === undefined) {
    throw new Error('useSelectedPurchaseItems debe usarse dentro de SelectedPurchaseItemsProvider');
  }
  return context;
};
