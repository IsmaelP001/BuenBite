'use client'
import { getPantryTransactions } from "@/actions/pantry";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetPantryTransactions() {
  const { id } = useParams<{ id?: string }>();

  return useQuery({
    queryKey: ["pantry_transactions", id],
    queryFn: async () => await getPantryTransactions(id as string),
    select(data) {
      if (!data?.data) return [];
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
