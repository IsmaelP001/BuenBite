import { useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useGetIngredients from "@/hooks/useGetIngredients";

export const filterTypes = [
  { id: "meal", label: "Tipo de Comida", multiSelect: true },
  { id: "cuisine", label: "Cocina", multiSelect: true },
  { id: "ingredientIds", label: "Ingredientes", multiSelect: true },
  { id: "time", label: "Tiempo", multiSelect: true },
  { id: "difficulty", label: "Dificultad", multiSelect: true },
] as const;

export const staticFilterOptions: Record<string, Array<{id: string, label: string}>> = {
  meal: [
    { id: "breakfast", label: "Desayuno" },
    { id: "lunch", label: "Almuerzo" },
    { id: "dinner", label: "Cena" },
    { id: "dessert", label: "Postre" },
    { id: "snack", label: "Merienda" },
  ],
  cuisine: [
    { id: "mexican", label: "Mexicana" },
    { id: "italian", label: "Italiana" },
    { id: "asian", label: "Asiática" },
    { id: "mediterranean", label: "Mediterránea" },
    { id: "american", label: "Americana" },
    { id: "french", label: "Francesa" },
    { id: "spanish", label: "Española" },
    { id: "indian", label: "India" },
  ],
  time: [
    { id: "under-15", label: "< 15 min" },
    { id: "15-30", label: "15-30 min" },
    { id: "30-60", label: "30-60 min" },
    { id: "over-60", label: "> 1 hora" },
  ],
  difficulty: [
    { id: "easy", label: "Fácil" },
    { id: "medium", label: "Intermedio" },
    { id: "hard", label: "Avanzado" },
  ],
};

interface UseRecipeFiltersOptions {
  searchValue?: string;
  ingredientsLimit?: number;
}

export function useRecipeFilters(options: UseRecipeFiltersOptions = {}) {
  const { searchValue = '', ingredientsLimit = 10 } = options;
  const router = useRouter();
  const searchParams = useSearchParams();

  const { ingredients, isPending: isLoadingIngredients } = useGetIngredients({
    searchValue,
  });

  const activeFilterType = searchParams.get("filterType") || "ingredientIds";

  const ingredientsMap = useMemo(() => {
    const map = new Map();
    ingredients?.forEach((item) => {
      map.set(item.id, {
        id: item.id,
        label: item.name_es,
        category: item.category,
      });
    });
    return map;
  }, [ingredients]);

  const dynamicFilterOptions = useMemo(() => {
    if (activeFilterType !== "ingredientIds") return [];
    const ingredientsToShow = ingredients?.slice(0, ingredientsLimit);

    return ingredientsToShow?.map((item) => ({
      id: item.id,
      label: item.name_es,
      category: item.category,
    }));
  }, [activeFilterType, ingredients, ingredientsLimit]);

  // Get filters from URL
  const getFiltersFromURL = useCallback((type: string): string[] => {
    const filters = searchParams.get(type);
    return filters ? filters.split(",") : [];
  }, [searchParams]);

  // Update URL with new params
  const updateURL = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const setActiveFilterType = useCallback((type: string) => {
    updateURL({ filterType: type });
  }, [updateURL]);

  const toggleFilter = useCallback((type: string, id: string) => {
    const currentFilters = getFiltersFromURL(type);

    let newFilters: string[];

    if (currentFilters.includes(id)) {
      newFilters = currentFilters.filter((v) => v !== id);
    } else {
      newFilters = [...currentFilters, id];
    }

    updateURL({
      [type]: newFilters.length > 0 ? newFilters.join(",") : null,
    });
  }, [getFiltersFromURL, updateURL]);

  // Remove specific filter
  const removeFilter = useCallback((type: string, id: string) => {
    const currentFilters = getFiltersFromURL(type);
    const newFilters = currentFilters.filter((v) => v !== id);

    updateURL({
      [type]: newFilters.length > 0 ? newFilters.join(",") : null,
    });
  }, [getFiltersFromURL, updateURL]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    const updates: Record<string, null> = {};
    filterTypes.forEach((filter) => {
      updates[filter.id] = null;
    });
    updateURL(updates);
  }, [updateURL]);

  // Get filter label
  const getFilterLabel = useCallback((type: string, id: string): string => {
    if (type === "ingredientIds") {
      const ingredient = ingredientsMap.get(id);
      return ingredient?.label || id;
    }
    
    const option = staticFilterOptions[type]?.find((item) => item.id === id);
    return option?.label || id;
  }, [ingredientsMap]);

  // All active filters
  const allActiveFilters = useMemo(() => {
    return filterTypes.flatMap((filter) =>
      getFiltersFromURL(filter.id).map((id) => ({
        type: filter.id,
        id,
        label: getFilterLabel(filter.id, id),
      }))
    );
  }, [getFiltersFromURL, getFilterLabel]);

  // Current options based on active filter type
  const currentOptions = useMemo(() => {
    if (activeFilterType === "ingredientIds") {
      return dynamicFilterOptions;
    }
    return staticFilterOptions[activeFilterType] || [];
  }, [activeFilterType, dynamicFilterOptions]);

  // Check if filter is selected
  const isFilterSelected = useCallback((type: string, id: string): boolean => {
    return getFiltersFromURL(type).includes(id);
  }, [getFiltersFromURL]);

  // Get count of active filters by type
  const getActiveFilterCount = useCallback((type: string): number => {
    return getFiltersFromURL(type).length;
  }, [getFiltersFromURL]);

  return {
    // State
    activeFilterType,
    allActiveFilters,
    currentOptions,
    hasActiveFilters: allActiveFilters.length > 0,
    isLoadingIngredients,
    ingredients,
    ingredientsMap,
    
    // Actions
    setActiveFilterType,
    toggleFilter,
    removeFilter,
    clearAllFilters,
    getFiltersFromURL,
    getFilterLabel,
    isFilterSelected,
    getActiveFilterCount,
    updateURL,
  };
}