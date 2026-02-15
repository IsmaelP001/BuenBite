"use client";
import { AnalyzedIngredient, RecommendedRecipe } from "@/types/models/recipes";
import { useEffect, useMemo, useState } from "react";
import useGetRecipyDetails from "./useGetRecipeDetails";
import useGetRecipeIngredients from "./useGetRecipeIngredients";

export interface IngredientsList extends AnalyzedIngredient {
  updatedValue: number;
  isSufficient: boolean;
  updatedMissingAmount: number;
}

interface UseCookingStepsReturn {
  currentRecipe: RecommendedRecipe | null;
  currentStep: number;
  isLastStep: boolean;
  currentInstruction: any;
  handleNextStep: () => void;
  handlePrevStep: () => void;
  ingredientsMap: Map<string, IngredientsList>;
  servings: number;
  updateServingValue: (val: number) => void;
  ingredients: IngredientsList[];
  updateIngredientQuantity: (id: string, newQuantity: number) => void;
  resetIngredientQuantity: (id: string) => void;
  showIngredients: boolean;
  toggleIngredients: () => void;
  progressPercentage: number;
  isPending: boolean;
}

/**
 * Calcula la cantidad proporcional basada en el cambio de porciones
 */
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

/**
 * Calcula la cantidad faltante de un ingrediente
 */
const calculateMissingAmount = (
  requiredAmount: number,
  availableAmount: number,
  isSuccessConvertion: boolean | null
): number => {
  // Si no hay conversión exitosa, no podemos calcular lo que falta
  if (!isSuccessConvertion) {
    return 0;
  }

  const missing = requiredAmount - availableAmount;
  return missing > 0 ? missing : 0;
};

/**
 * Determina si hay suficiente ingrediente disponible
 */
const checkIsSufficient = (
  ingredient: AnalyzedIngredient,
  requiredAmount: number
): boolean => {
  // Si no hay conversión exitosa, asumimos que es suficiente (no podemos verificar)
  if (!ingredient.isSuccessConvertion) {
    return true;
  }

  // Si no está disponible en la despensa, no es suficiente
  if (!ingredient.isAvailableInPantry) {
    return false;
  }

  return requiredAmount <= ingredient.availableInPantry;
};

export default function useCookingSteps(): UseCookingStepsReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [servings, setServings] = useState(4);
  const [showIngredients, setShowIngredients] = useState(true);
  const [ingredients, setIngredients] = useState<IngredientsList[]>([]);

  const { recipe: currentRecipe, isPending } = useGetRecipyDetails();
  const { data, isPending: isPendingIngredients } = useGetRecipeIngredients();

  const isLastStep =
    currentStep === (currentRecipe?.instructions?.length || 0) - 1;
  const currentInstruction = currentRecipe?.instructions?.[currentStep];
  const progressPercentage = Math.round(
    ((currentStep + 1) / (currentRecipe?.instructions?.length || 1)) * 100
  );

  const calculateInitialIngredients = (ingredients: AnalyzedIngredient[]) => {
    const initialIngredients = ingredients.map((item) => {
      const updatedValue = item.recipeMeasurementValue ?? 0;
      const isSufficient = checkIsSufficient(item, updatedValue);
      const updatedMissingAmount = calculateMissingAmount(
        updatedValue,
        item.availableInPantry,
        item.isSuccessConvertion
      );

      return {
        ...item,
        updatedValue,
        isSufficient,
        updatedMissingAmount,
      };
    });

    return initialIngredients;
  };

  const resetAllIngredients = () => {
    const initialIngredients = calculateInitialIngredients(data?.ingredients ?? []);
    setIngredients(initialIngredients as IngredientsList[]);
  };

  useEffect(() => {
    if (!currentRecipe || !data?.ingredients) return;

    const originalServings = currentRecipe.servings || 1;
    setServings(originalServings);

    const initialIngredients = calculateInitialIngredients(data.ingredients);

    setIngredients(initialIngredients as IngredientsList[]);
  }, [currentRecipe, data]);

  // Recalcular valores cuando cambian las porciones
  const recalculateIngredients = (newServings: number) => {
    const originalServings = currentRecipe?.servings || 1;

    setIngredients((prev) =>
      prev.map((ingredient) => {
        const updatedValue = calculateProportionalAmount(
          ingredient.recipeMeasurementValue ?? 0,
          originalServings,
          newServings
        );

        const isSufficient = checkIsSufficient(ingredient, updatedValue);

        const updatedMissingAmount = calculateMissingAmount(
          updatedValue,
          ingredient.availableInPantry,
          ingredient.isSuccessConvertion
        );

        return {
          ...ingredient,
          updatedValue,
          isSufficient,
          updatedMissingAmount,
        };
      })
    );
  };

  const handleNextStep = () => {
    if (
      currentRecipe?.instructions &&
      currentStep < currentRecipe.instructions.length - 1
    ) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateServingValue = (newVal: number) => {
    if (newVal <= 0) return;

    setServings(newVal);
    recalculateIngredients(newVal);
  };

  const updateIngredientQuantity = (id: string, newQuantity: number) => {
    setIngredients((prev) =>
      prev.map((ingredient) => {
        if (ingredient.id !== id) return ingredient;

        const isSufficient = checkIsSufficient(ingredient, newQuantity);
        const updatedMissingAmount = calculateMissingAmount(
          newQuantity,
          ingredient.availableInPantry,
          ingredient.isSuccessConvertion
        );

        return {
          ...ingredient,
          updatedValue: newQuantity,
          isSufficient,
          updatedMissingAmount,
        };
      })
    );
  };

  const resetIngredientQuantity = (id: string) => {
    const originalServings = servings || (currentRecipe?.servings ?? 1);

    setIngredients((prev) =>
      prev.map((ingredient) => {
        if (ingredient.id !== id) return ingredient;

        const originalValue = calculateProportionalAmount(
          ingredient.recipeMeasurementValue ?? 0,
          originalServings,
          servings
        );

        const isSufficient = checkIsSufficient(ingredient, originalValue);
        const updatedMissingAmount = calculateMissingAmount(
          originalValue,
          ingredient.availableInPantry,
          ingredient.isSuccessConvertion
        );

        return {
          ...ingredient,
          updatedValue: originalValue,
          isSufficient,
          updatedMissingAmount,
        };
      })
    );
  };

  
  const toggleIngredients = () => {
    setShowIngredients((prev) => !prev);
  };

  const ingredientsMap = useMemo(() => {
    return new Map(ingredients.map((item) => [item.id, item]));
  }, [ingredients]);

  return {
    currentRecipe: currentRecipe ?? null,
    ingredientsMap,
    currentStep,
    isLastStep,
    currentInstruction,
    handleNextStep,
    handlePrevStep,
    servings,
    updateServingValue,
    ingredients,
    updateIngredientQuantity,
    resetIngredientQuantity,
    showIngredients,
    toggleIngredients,
    progressPercentage,
    isPending: isPending || isPendingIngredients,
    resetAllIngredients
  };
}
