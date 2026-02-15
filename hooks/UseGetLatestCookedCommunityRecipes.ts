import { getLatestCookedCommunityRecipes } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";

export default function UseGetLatestCookedCommunityRecipes() {

  return useQuery({
    queryKey: ["latest_cooked_community_recipes"],
    queryFn: async () => await getLatestCookedCommunityRecipes(),
    select(data) {
      return data?.data || [];
    },
  });
}
