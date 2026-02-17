'use client'
import { useMemo } from "react";
import useGetUserNutritionalHistory from "./useGetUserNutricionalHistory";
import useGetUserNutritionalMetrics from "./useGetUserNutritionalMetrics";

export default function useGetMealplanMacrosSummary() {
  const defaultStartDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  const {
    selectedDateData,
    refetch: refetchUserMacros,
    isFetching: isPendingMacros,
  } = useGetUserNutritionalHistory({
    startDate: defaultStartDate,
    currentDate: defaultStartDate,
  });
  const {
    data: userNutritionalMetrics,
    refetch: refetchUserMetrics,
    isFetching: isPendingUserMetrics,
  } = useGetUserNutritionalMetrics();

  const macrosSummary = useMemo(() => {
    const targetCalories = userNutritionalMetrics?.dailyCaloriesTarget ?? 0;
    const remainingCalories = Math.max(
      targetCalories - (selectedDateData?.calories.consumed ?? 0),
      0
    );
    const calorieProgress = Math.min(
      ((selectedDateData?.calories.consumed ?? 0) / (targetCalories || 1)) *
        100,
      100
    );
    return {
      calories: {
        targetCalories,
        calorieProgress,
        remainingCalories,
        consumed: selectedDateData?.calories.consumed,
      },
      carbs: {
        target: userNutritionalMetrics?.dailyCarbsTarget ?? 0,
        consumed: selectedDateData?.carbs.consumed,
      },
      proteins: {
        target: userNutritionalMetrics?.dailyProteinTarget ?? 0,
        consumed: selectedDateData?.protein.consumed,
      },
      fats: {
        target: userNutritionalMetrics?.dailyFatTarget ?? 0,
        consumed: selectedDateData?.fats.consumed,
      },
    };
  }, [userNutritionalMetrics, selectedDateData]);

  const onRefresh = async () => {
    const [macros, prefs] = await Promise.all([
      refetchUserMacros(),
      refetchUserMetrics(),
    ]);
    return { macros, prefs };
  };

  return {
    macrosSummary,
    isPending: isPendingMacros || isPendingUserMetrics,
    refetch: onRefresh,
  };
}
