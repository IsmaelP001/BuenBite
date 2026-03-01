"use client";
import { getRecipeTips } from "@/actions/recipes";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

interface UseGetRecipeTipsProps {
  limit?: number;
  page?: number;
  enabled?: boolean;
}

export default function useGetRecipeTips(props?: UseGetRecipeTipsProps) {
  const { id } = useParams<{ id?: string }>();
  const limit = props?.limit ?? 2;
  const page = props?.page ?? 1;

  return useQuery({
    queryKey: ["recipe_tips", id, limit, page],
    queryFn: async () => await getRecipeTips({
      recipeId: id as string,
      limit,
      page,
    }),
    select(data) {
      return {
        items: data?.data ?? [],
        hasMore: Boolean(data?.hasMore),
        page: data?.page ?? page,
      };
    },
    enabled: (props?.enabled ?? true) && Boolean(id),
    staleTime: 60 * 60 * 60 * 24,
  });
}
