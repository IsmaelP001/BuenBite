'use client'
import { getUserMealPlanEntries } from "@/actions/mealplan";
import { extractDateFromDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export default function useGetMealplanEntries({
  selectedDate,
}: {
  selectedDate: Date;
}) {
  const { startDate, endDate } = useMemo(() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    const start = new Date(selected);
    start.setDate(start.getDate() - 5);

    const end = new Date(selected);
    end.setDate(end.getDate() + 5);

    return { startDate: start, endDate: end };
  }, [selectedDate]);

  return useQuery({
    queryKey: [
      "user_mealplan_entries",
      extractDateFromDate(startDate),
      extractDateFromDate(endDate),
    ],
    queryFn: async () =>
      await getUserMealPlanEntries({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
  });
}
