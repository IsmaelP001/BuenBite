"use client";
import { getSocialExplore, searchSocialUsers, getSocialInsights } from "@/actions/social";
import { ExploreFilters, SearchUsersFilters } from "@/types/models/social";
import { useQuery } from "@tanstack/react-query";

export function useGetExplore(filters?: ExploreFilters) {
  return useQuery({
    queryKey: ["social", "explore", filters],
    queryFn: async () => getSocialExplore(filters),
    select: (data) => data.data,
  });
}

interface UseSearchUsersFilters {
  query?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useSearchUsers({
  query = "",
  page = 1,
  limit = 20,
  enabled = true,
}: UseSearchUsersFilters = {}) {
  const filters: SearchUsersFilters = {
    q: query,
    page: String(page),
    limit: String(limit),
  };

  return useQuery({
    queryKey: ["social", "search", "users", query, page, limit],
    queryFn: async () => searchSocialUsers(filters),
    enabled,
  });
}

export function useGetInsights() {
  return useQuery({
    queryKey: ["social", "insights"],
    queryFn: async () => getSocialInsights(),
    select: (data) => data.data,
  });
}
