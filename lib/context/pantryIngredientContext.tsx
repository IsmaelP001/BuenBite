"use client";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useMemo } from "react";

export interface PantryItem {
  id: string;
  userId: string;
  name: {
    en: string;
    fr: string;
    es: string;
  };
  ingredientId: string | null;
  category: string;
  expirationDate: string | null;
  image: string;
  isRecurrent: boolean;
  recurrentAmount: number;
  brand: string | null;
  isRegisteredByUser: boolean;
  measurementType: string;
  pendingPurchaseQuantity: number;
  measurementValue: number;
  lowValueAlert: number;
  updatedAt: string;
  include: boolean;
  isLowStock: boolean;
  isOutStock: boolean;
  isExpiring: boolean;
  remainingDaysExpire: number | null;
  hasPurchaseQuantity: boolean;
}

export interface Ingredient {
  id: string;
  name_en: string;
  name_es: string;
  name_fr: string;
  alias: string[];
  image: string;
  notes?: string;
  category: string;
  calories_100g: number;
  protein_100g: number;
  fat_100g: number;
  carbohydrates_100g: number;
  conversions: {
    allowed_units: string[];
    density: number;
    volume_per_unit: Record<string, number>;
    weight_per_unit: Record<string, number>;
  };
}

interface CategorySummary {
  label: string;
  id: string;
  count: number;
}

// Tipo unificado para selección de ingredientes
export interface SelectedIngredientItem {
  name: string;
  ingredientId: string;
  image: string;
  category: string;
  quantity?: number; // Opcional para pantryItems
  // Campos adicionales para identificar el origen
  isPantryItem: boolean;
  pantryItemId?: string; // ID del item en la despensa si aplica
}

interface IngredientSelectionContextType {
  selectedIngredients: SelectedIngredientItem[];
  addIngredient: (item: SelectedIngredientItem) => void;
  removeIngredient: (ingredientId: string) => void;
  toggleIngredient: (item: SelectedIngredientItem) => void;
  clearIngredients: () => void;
  isSelected: (ingredientId: string) => boolean;
  categories: CategorySummary[];
  isModalOpen: boolean;
  onModalOpenChange: (val: boolean) => void;

  isRecipesSidebarMobileOpen: boolean;
  onRecipesSidebarMobileChange: (val: boolean) => void;

  getSelectedCount: () => number;
  addIngredients: (items: SelectedIngredientItem[]) => void;
  // Helpers para crear items desde diferentes fuentes
  createFromPantryItem: (
    pantryItem: PantryItem,
    language?: "en" | "es" | "fr"
  ) => SelectedIngredientItem;
  createFromIngredient: (
    ingredient: Ingredient,
    language?: "en" | "es" | "fr"
  ) => SelectedIngredientItem;
}

const PantryIngredientSelectionContext = createContext<
  IngredientSelectionContextType | undefined
>(undefined);

interface IngredientSelectionProviderProps {
  children: ReactNode;
}

export const PantryIngredientSelectionProvider = ({
  children,
}: IngredientSelectionProviderProps) => {
  const [selectedIngredients, setSelectedIngredients] = useState<
    SelectedIngredientItem[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRecipesSidebarMobileOpen, setIsRecipesSidebarMobileOpen] =
    useState<boolean>(false);

  const searchParams = useSearchParams();

  const createFromPantryItem = (
    pantryItem: PantryItem,
    language: "en" | "es" | "fr" = "es"
  ): SelectedIngredientItem => {
    return {
      name: pantryItem.name[language],
      ingredientId: pantryItem.ingredientId!,
      image: pantryItem.image,
      category: pantryItem.category,
      quantity: pantryItem.measurementValue,
      isPantryItem: true,
      pantryItemId: pantryItem.id,
    };
  };

  // Helper para crear item desde Ingredient
  const createFromIngredient = (
    ingredient: Ingredient,
    language: "en" | "es" | "fr" = "es"
  ): SelectedIngredientItem => {
    const nameMap = {
      en: ingredient.name_en,
      es: ingredient.name_es,
      fr: ingredient.name_fr,
    };

    return {
      name: nameMap[language],
      ingredientId: ingredient.id,
      image: ingredient.image,
      category: ingredient.category,

      isPantryItem: false,
    };
  };

  const addIngredient = (item: SelectedIngredientItem) => {
    setSelectedIngredients((prev) => {
      // Verificar si ya existe (por ingredientId o por nombre)
      const exists = prev.some((selected) => {
        if (item.ingredientId && selected.ingredientId) {
          return selected.ingredientId === item.ingredientId;
        }
        return selected.name === item.name;
      });

      if (exists) {
        return prev;
      }
      return [...prev, item];
    });
  };
  const addIngredients = (items: SelectedIngredientItem[]) => {
    setSelectedIngredients((prev) => {
      const newItems = items.filter((item) => {
        return !prev.some((selected) => {
          if (item.ingredientId && selected.ingredientId) {
            return item.ingredientId === selected.ingredientId;
          }
          return selected.name === item.name;
        });
      });

      if (newItems.length === 0) {
        return prev;
      }

      return [...prev, ...newItems];
    });
  };

  const removeIngredient = (ingredientId: string) => {
    setSelectedIngredients((prev) =>
      prev.filter((item) => {
        return item.ingredientId !== ingredientId;
      })
    );
  };

  const toggleIngredient = (item: SelectedIngredientItem) => {
    setSelectedIngredients((prev) => {
      const exists = prev.some((selected) => {
        if (item.ingredientId && selected.ingredientId) {
          return selected.ingredientId === item.ingredientId;
        }
        return selected.name === item.name;
      });

      if (exists) {
        return prev.filter((selected) => {
          if (item.ingredientId && selected.ingredientId) {
            return selected.ingredientId !== item.ingredientId;
          }
          return selected.name !== item.name;
        });
      }

      return [...prev, item];
    });
  };

  const clearIngredients = () => {
    setSelectedIngredients([]);
  };

  const isSelected = (ingredientId: string): boolean => {
    return selectedIngredients.some((item) => {
      return item.ingredientId === ingredientId;
    });
  };

  const getSelectedCount = (): number => {
    return selectedIngredients.length;
  };

  const filterIngredients = useMemo(() => {
    const currentCategory = searchParams.get("category");
    if (!currentCategory) return selectedIngredients;
    return selectedIngredients.filter(
      (item) => item.category === currentCategory
    );
  }, [searchParams, selectedIngredients]);

  const groupedIngredientsByCategory = useMemo(() => {
    const groups: Record<string, any[]> = {};

    selectedIngredients.forEach((item) => {
      const category = item?.category || "Sin categoría";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items,
    }));
  }, [selectedIngredients]);

  const categories: CategorySummary[] = useMemo(() => {
    return groupedIngredientsByCategory.map((group) => ({
      label: group.category,
      id: group.category,
      count: group.items.length,
    }));
  }, [groupedIngredientsByCategory]);

  const onModalOpenChange = (val: boolean) => {
    setIsModalOpen(val);
  };

  const onRecipesSidebarMobileChange = (val)=>{
    setIsRecipesSidebarMobileOpen(val)
  }
  return (
    <PantryIngredientSelectionContext.Provider
      value={{
        selectedIngredients: filterIngredients,
        addIngredient,
        removeIngredient,
        toggleIngredient,
        clearIngredients,
        isSelected,
        getSelectedCount,
        createFromPantryItem,
        createFromIngredient,
        categories,
        isModalOpen,
        onModalOpenChange,
        addIngredients,
        onRecipesSidebarMobileChange,
        isRecipesSidebarMobileOpen
      }}
    >
      {children}
    </PantryIngredientSelectionContext.Provider>
  );
};

export const usePantryIngredientSelection = () => {
  const context = useContext(PantryIngredientSelectionContext);
  if (context === undefined) {
    throw new Error(
      "useIngredientSelection must be used within an IngredientSelectionProvider"
    );
  }
  return context;
};
