'use client'
import { getUserMealPlanEntries } from "@/actions/mealplan";
import { extractDateFromDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";

export default function useGetMealplanEntries({
  selectedDate,
}: {
  selectedDate: Date;
}) {

  const rangeRef = useRef<{ startDate: Date; endDate: Date } | null>(null);

  const { startDate, endDate } = useMemo(() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    if (!rangeRef.current) {
      const start = new Date(selected);
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - 5);

      const end = new Date(selected);
      end.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() + 5);

      rangeRef.current = { startDate: start, endDate: end };
      return rangeRef.current;
    }

    const currentStart = rangeRef.current.startDate;
    const currentEnd = rangeRef.current.endDate;

    const isOutOfRange = selected < currentStart || selected > currentEnd;

    if (isOutOfRange) {
      const start = new Date(selected);
      start.setDate(start.getDate() - 5);

      const end = new Date(selected);
      end.setDate(end.getDate() + 5);

      rangeRef.current = { startDate: start, endDate: end };
    }

    return rangeRef.current;
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
