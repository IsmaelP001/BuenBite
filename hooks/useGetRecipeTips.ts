'use client'
import { getRecipeTips } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetRecipeTips() {
    const { id } = useParams();
  
  return useQuery({
    queryKey: ["recipe_tips",id],
    queryFn: async () => await getRecipeTips({
      recipeId:id as string,
      limit:2
    }),
    select(data) {
      if (!data?.data) return [];
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
