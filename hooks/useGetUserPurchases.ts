import { getUserPurchases } from "@/actions/purchase";
import { useQuery } from "@tanstack/react-query";

export default function useGetUserPurchases() {
  
  return useQuery({
    queryKey: ["user_purchases"],
    queryFn: async () => getUserPurchases(),
    select(data) {
      if (!data?.data) return [];
      return data?.data;
    },
    staleTime: 60 * 60 * 60 * 24,
  });
}
