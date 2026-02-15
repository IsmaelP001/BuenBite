import { getWeeklyNutricionalDataConsumed } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserWeeklyNutritionalResume() {

  return useQuery({
    queryKey: ["user_weekly_nutriciona_resume"],
    queryFn: async () => getWeeklyNutricionalDataConsumed(),
    select(data) {
      if (!data?.data) return null;
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
