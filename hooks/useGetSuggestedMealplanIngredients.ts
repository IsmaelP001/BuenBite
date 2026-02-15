import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import useRecipeServings, { IngredientsList } from "./useRecipeServings";
import { getSuggestedMealplanIngredients } from "@/actions/mealplan";

export default function useGetSuggestedMealplanIngredients({
  id,
}: {
  id: string;
}) {
  const { data, ...rest } = useSuspenseQuery({
    queryKey: ["suggested_mealplan_ingredients", id],
    queryFn: async () => {
      return await getSuggestedMealplanIngredients(id);
    },
    select(data) {
      return data?.data ?? {};
    },
  });

  const { ingredients, ...servingsRest } = useRecipeServings({
    originalServings: data?.targetServings,
    ingredientsData: data?.ingredients || [],
  });

  const ingredientsByCategory = useMemo(() => {
    if (!ingredients) return {};

    return ingredients.reduce<Record<string, IngredientsList[]>>(
      (acc, item) => {
        const category = item.category;

        if (!acc[category]) {
          acc[category] = [];
        }

        acc[category].push({
          ...item,
          availabilityStatus: item.updatedAvailabilityStatus,
          missingAmount: item.updatedMissingAmount,
          measurementValue: item.updatedValue,
        });
        return acc;
      },
      {}
    );
  }, [ingredients]);

  const ingredientsList = useMemo(() => {
    return ingredients.map((ingredient) => ({
      ...ingredient,
      availabilityStatus: ingredient.updatedAvailabilityStatus,
      missingAmount: ingredient.updatedMissingAmount,
      measurementValue: ingredient.updatedValue,
    }));
  }, [ingredients]);

  return {
    data,
    ingredients,
    ingredientsByCategory,
    ingredientsList,
    ...rest,
    ...servingsRest,
  };
}
