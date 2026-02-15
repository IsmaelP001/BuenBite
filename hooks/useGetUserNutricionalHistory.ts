import { getUserNutricionalHistory } from "@/actions/user";
import { extractDateFromDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
function getDaysBetweenDates(start: Date, end: Date = new Date()): number {
  const msInDay = 1000 * 60 * 60 * 24;
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / msInDay);
}

export default function useGetUserNutritionalHistory({
  startDate,
  currentDate,
}: {
  startDate: Date;
  currentDate: Date;
}) {

  const { data, ...rest } = useQuery({
    queryKey: ["user_nutritional_history"],
    queryFn: async () =>
      await getUserNutricionalHistory(startDate),
    select(data) {
      if (!data?.data) return null;
      return data?.data;
    },
    staleTime: 1000 * 60 * 60 * 12,
  });

  const resultsAvg = useMemo(() => {
    const numOfDaysAvg = getDaysBetweenDates(startDate, new Date());
    const totalData = data?.reduce(
      (acc, item) => {
        acc.caloriesConsumedAvg += Number(item.calories.consumed ?? 0);
        acc.carbsConsumedAvg += Number(item.carbs.consumed ?? 0);
        acc.proteinsConsumedAvg += Number(item.protein.consumed ?? 0);
        acc.fatsConsumedAvg += Number(item.fats.consumed ?? 0);
        return acc;
      },
      {
        caloriesConsumedAvg: 0,
        carbsConsumedAvg: 0,
        proteinsConsumedAvg: 0,
        fatsConsumedAvg: 0,
      }
    );
    return {
      caloriesConsumedAvg: Math.round(
        (totalData?.caloriesConsumedAvg ?? 0) / numOfDaysAvg
      ),
      carbsConsumedAvg: Math.round((totalData?.carbsConsumedAvg ?? 0) / numOfDaysAvg),
      proteinsConsumedAvg: Math.round(
        (totalData?.proteinsConsumedAvg ?? 0 ) / numOfDaysAvg
      ),
      fatsConsumedAvg: Math.round((totalData?.fatsConsumedAvg ?? 0 ) / numOfDaysAvg),
      numOfDaysAvg,
    };
  }, [data, startDate]);

  const selectedDateData = useMemo(() => {
    const dateString = extractDateFromDate(currentDate);
    return (
      data?.find((item) => item.date === dateString) || {
        date: dateString,
        protein: {
          consumed: 0,
          goal: 0,
        },
        fats: { consumed: 0, goal: 0 },
        carbs: { consumed: 0, goal: 0 },
        calories: {
          consumed: 0,
          goal: 0,
        },
      }
    );
  }, [currentDate, data]);

  return {
    ...rest,
    data,
    resultsAvg,
    selectedDateData,
    refetch: rest.refetch,
  };
}
