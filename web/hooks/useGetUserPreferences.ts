import { getUserPreferences } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserPreferences() {
  return useQuery({
    queryKey: ["user_preferences"],
    queryFn: async () => await getUserPreferences(),
    select(data) {
      const results = data?.data;
      return results;
    },
  });
}
