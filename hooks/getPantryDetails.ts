'use client'
import { getPantryById } from "@/actions/pantry";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export default function useGetPantryDetails() {
  const { id } = useParams<{ id?: string }>();
  
  return useQuery({
    queryKey: ["pantry_details",id],
    queryFn: async () => await getPantryById(id!),
    select(data) {
      if (!data?.data) return null;
      return data?.data
    },
    staleTime: 24 * 24 * 24 * 24
  });
}
