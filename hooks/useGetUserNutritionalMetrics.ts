'use client'
import { getUserNutritionalMetrics } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserNutritionalMetrics() {

  return useQuery({
    queryKey: ["user_nutritional_metrics"],
    queryFn: async () => getUserNutritionalMetrics(),
    select(data) {
      if (!data?.data) return null;
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
