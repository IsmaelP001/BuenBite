import { getRecipeTips } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetRecipeMostRecentTips() {
    const { id } = useParams();
  
  return useQuery({
    queryKey: ["recipe_most_recent_tip",id],
    queryFn: async () => await getRecipeTips({recipeId:id as string,limit:1}),
    select(data) {
        console.log('recipe_most_recent_tip',data)
      if (!data?.data) return null;
      return data?.data?.[0];
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
