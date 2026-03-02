'use client'
import { getPantryTransactions } from "@/actions/pantry";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetPantryTransactions() {
  const { id } = useParams<{ id?: string }>();
  const limit = 15;

  return useInfiniteQuery({
    queryKey: ["pantry_transactions", id],
    queryFn: async ({ pageParam }) =>
      await getPantryTransactions(id as string, { page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentBatch = lastPage?.data ?? [];
      if (currentBatch.length < limit) return undefined;
      return allPages.length + 1;
    },
    enabled: Boolean(id),
    staleTime: 60 * 60 * 60 * 24,
  });
}
