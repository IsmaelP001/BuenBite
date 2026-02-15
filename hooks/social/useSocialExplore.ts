"use client";
import { getSocialExplore, searchSocialUsers, getSocialInsights } from "@/actions/social";
import { ExploreFilters, ExplorePeriod, SearchUsersFilters } from "@/types/models/social";
import { useQuery } from "@tanstack/react-query";

export function useGetExplore(filters?: ExploreFilters) {
  return useQuery({
    queryKey: ["social", "explore", filters],
    queryFn: async () => getSocialExplore(filters),
    select: (data) => data.data,
  });
}

export function useSearchUsers(query: string, enabled = true) {
  const filters: SearchUsersFilters = { q: query, limit: "20" };
  return useQuery({
    queryKey: ["social", "search", "users", query],
    queryFn: async () => searchSocialUsers(filters),
    enabled: enabled && query.length >= 2,
    select: (data) => data.data,
  });
}

export function useGetInsights() {
  return useQuery({
    queryKey: ["social", "insights"],
    queryFn: async () => getSocialInsights(),
    select: (data) => data.data,
  });
}
