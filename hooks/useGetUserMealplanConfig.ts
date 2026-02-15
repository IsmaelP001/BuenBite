import { getUserMealPlanConfig } from "@/actions/mealplan";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetUserMealplanConfig() {
  const { id } = useParams<{ id?: string }>();

  return useQuery({
    queryKey: ["pantry_transactions", id],
    queryFn: async () =>await getUserMealPlanConfig(),
    select(data) {
      if (!data?.data) return null;
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
