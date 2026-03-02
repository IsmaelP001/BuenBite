import { getLatestRecipesViewed } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";

export default function useGetRecentRecipesViewed() {

  return useQuery({
    queryKey: ["recent_recepies_viewed"],
    queryFn: async () => await getLatestRecipesViewed(),
    select(data) {
      return data?.data || [];
    },
  });
}
