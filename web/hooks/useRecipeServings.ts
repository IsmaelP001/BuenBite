"use client";
import { AnalyzedIngredient, IngredientAvailabilityStatus } from "@/types/models/pantry";
import {  RecipeIngredient } from "@/types/models/recipes";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";



export interface IngredientsList extends AnalyzedIngredient<RecipeIngredient> {
  updatedValue: number;
  updatedMissingAmount: number;
  updatedAvailabilityStatus: IngredientAvailabilityStatus;
  isConfirmationRemoved: boolean;
}

interface UseRecipeServingsProps {
  originalServings: number;
  ingredientsData: AnalyzedIngredient<RecipeIngredient>[] | undefined;
}

interface UseRecipeServingsReturn {
  servings: number;
  ingredients: IngredientsList[];
  completionPercentage: number;
  completeIngredientsCount: number;
  partialIngredientsCount: number;
  missingIngredientsCount: number;
  noStockIngredientsCount: number;
  updateServingValue: (val: number) => void;
  updateIngredientQuantity: (id: string, newQuantity: number) => void;
  resetIngredientQuantity: (id: string) => void;
  resetAllIngredients: () => void;
  removeIngredient: (id: string) => void;
}

interface IngredientStats {
  percentage: number;
  complete: number;
  partial: number;
  missing: number;
  noStock: number;
}


const calculateProportionalAmount = (
  originalAmount: number,
  originalServings: number,
  newServings: number
): number => {
  if (!originalAmount || !originalServings || originalServings === 0) {
    return originalAmount;
  }
  return (originalAmount / originalServings) * newServings;
};


const determineAvailabilityStatus = (
  requiredAmount: number,
  availableAmount: number,
  isAvailableInPantry: boolean,
  isSuccessConvertion: boolean | null,
  originalPantryAmount: number,
  originalStatus: IngredientAvailabilityStatus 
): IngredientAvailabilityStatus => {

  if( originalStatus && originalStatus === "PANTRY_NOT_PROVIDED"){ 
    return "PANTRY_NOT_PROVIDED";
  }

  if (!isAvailableInPantry) {
    return "MISSING";
  }

  if (!isSuccessConvertion && isAvailableInPantry) {
    return "UNSUCCESSFUL_CONVERSION";
  }

  if (originalPantryAmount === 0) {
    return "NO_STOCK";
  }

  if (availableAmount === 0) {
    return "NO_STOCK";
  }

  if (availableAmount >= requiredAmount) {
    return "COMPLETE";
  }

  if (availableAmount > 0) {
    return "PARTIAL";
  }

  return "NO_STOCK";
};

const calculateMissingAmount = (
  requiredAmount: number,
  availableAmount: number,
  isSuccessConvertion: boolean | null
): number => {
  if (!isSuccessConvertion) {
    return requiredAmount;
  }

  const missing = requiredAmount - availableAmount;
  return Math.max(0, Math.floor(missing));
};


const updateIngredientCalculations = (
  ingredient: AnalyzedIngredient<RecipeIngredient> | IngredientsList,
  newValue: number
): IngredientsList => {
  const updatedAvailabilityStatus = determineAvailabilityStatus(
    newValue,
    ingredient.availableConvertedQuantity,
    ingredient.isAvailableInPantry,
    ingredient.isSuccessConvertion,
    ingredient.originalPantryQuantity,
    ingredient.availabilityStatus
  );

  const updatedMissingAmount = calculateMissingAmount(
    newValue,
    ingredient.availableConvertedQuantity,
    ingredient.isSuccessConvertion
  );

  return {
    ...ingredient,
    updatedValue: newValue,
    updatedAvailabilityStatus,
    updatedMissingAmount,
    isConfirmationRemoved: "isConfirmationRemoved" in ingredient 
      ? ingredient.isConfirmationRemoved 
      : false,
  } as IngredientsList;
};


const calculateIngredientStats = (
  ingredients: IngredientsList[]
): IngredientStats => {
  if (!ingredients.length) {
    return { percentage: 0, complete: 0, partial: 0, missing: 0, noStock: 0 };
  }

  let totalScore = 0;
  let complete = 0;
  let partial = 0;
  let missing = 0;
  let noStock = 0;
  let countedIngredients = 0; 

  ingredients.forEach((ingredient) => {
    switch (ingredient.updatedAvailabilityStatus) {
      case "COMPLETE":
        complete++;
        break;
      case "PARTIAL":
        partial++;
        break;
      case "MISSING":
        missing++;
        break;
      case "NO_STOCK":
        noStock++;
        break;
    }

    if (!ingredient.isSuccessConvertion && ingredient.isAvailableInPantry) {
      return; 
    }

    const required = ingredient.updatedValue;
    const available = ingredient.availableConvertedQuantity ?? 0;

    if (required <= 0) {
      totalScore += 100;
      countedIngredients++; 
      return;
    }

    const ingredientPercentage = Math.min((available / required) * 100, 100);
    totalScore += ingredientPercentage;
    countedIngredients++; 
  });

  const percentage = countedIngredients > 0
    ? Math.round((totalScore / countedIngredients) * 100) / 100
    : 0;

  return { percentage, complete, partial, missing, noStock };
};

export default function useRecipeServings({
  originalServings,
  ingredientsData,
}: UseRecipeServingsProps): UseRecipeServingsReturn {
  const [servings, setServings] = useState<number>(originalServings);
  const [ingredients, setIngredients] = useState<IngredientsList[]>([]);

  const lastProcessedIds = useRef<string>("");

  useEffect(() => {
    if (originalServings > 0 && servings !== originalServings) {
      const timeoutId = window.setTimeout(() => {
        setServings(originalServings);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [originalServings]);

  useEffect(() => {
    if (!ingredientsData || ingredientsData.length === 0) {
      lastProcessedIds.current = "";
      const timeoutId = window.setTimeout(() => {
        setIngredients([]);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const currentIds = ingredientsData
      .map((i) => i.id)
      .sort()
      .join(",");

    if (lastProcessedIds.current === currentIds) return;
    lastProcessedIds.current = currentIds;

    const initialIngredients = ingredientsData.map((item) =>
      updateIngredientCalculations(item, item.measurementValue ?? 0)
    );

    const timeoutId = window.setTimeout(() => {
      setIngredients(initialIngredients);
      setServings(originalServings);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [ingredientsData, originalServings]);

  const resetAllIngredients = useCallback(() => {
    if (!ingredientsData) return;
    
    const initialIngredients = ingredientsData.map((item) =>
      updateIngredientCalculations(
        item,
        calculateProportionalAmount(
          item.measurementValue ?? 0,
          originalServings,
          servings
        )
      )
    );
    setIngredients(initialIngredients);
  }, [ingredientsData, originalServings, servings]);

  const stats = useMemo(
    () => calculateIngredientStats(ingredients),
    [ingredients]
  );

  const updateServingValue = useCallback(
    (newVal: number) => {
      if (newVal <= 0 || newVal === servings) return;

      setIngredients((prev) =>
        prev.map((ingredient) => {
          const newValue = calculateProportionalAmount(
            ingredient.measurementValue ?? 0,
            originalServings,
            newVal
          );
          return updateIngredientCalculations(ingredient, newValue);
        })
      );

      setServings(newVal);
    },
    [servings, originalServings]
  );

  const updateIngredientQuantity = useCallback(
    (id: string, newQuantity: number) => {
      if (
        typeof newQuantity !== "number" ||
        isNaN(newQuantity) ||
        newQuantity < 0
      ) {
        console.warn("Invalid quantity provided:", newQuantity);
        return;
      }

      setIngredients((prev) =>
        prev.map((ingredient) =>
          ingredient.id === id
            ? updateIngredientCalculations(ingredient, newQuantity)
            : ingredient
        )
      );
    },
    []
  );

  const resetIngredientQuantity = useCallback(
    (id: string) => {
      setIngredients((prev) =>
        prev.map((ingredient) => {
          if (ingredient.id !== id) return ingredient;

          const originalValue = calculateProportionalAmount(
            ingredient.measurementValue ?? 0,
            originalServings,
            servings
          );

          return updateIngredientCalculations(ingredient, originalValue);
        })
      );
    },
    [originalServings, servings]
  );

  const removeIngredient = useCallback((id: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, isConfirmationRemoved: true } : ing
      )
    );
  }, []);

  return {
    servings,
    ingredients,
    completionPercentage: stats.percentage,
    completeIngredientsCount: stats.complete,
    partialIngredientsCount: stats.partial,
    missingIngredientsCount: stats.missing,
    noStockIngredientsCount: stats.noStock,
    updateServingValue,
    updateIngredientQuantity,
    resetIngredientQuantity,
    resetAllIngredients,
    removeIngredient,
  };
}
