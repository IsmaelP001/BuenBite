import { getLatestCommunityRecipes } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";

export default function useGetLatestCommunityRecipes() {

  return useQuery({
    queryKey: ["community_recipes"],
    queryFn: async () => await getLatestCommunityRecipes(),
    select(data) {
      return data?.data || [];
    },
    
  });
}
