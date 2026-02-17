"use client";
import { getSocialFeed } from "@/actions/social";
import { FeedFilters } from "@/types/models/social";
import { useInfiniteQuery } from "@tanstack/react-query";

interface UseSocialFeedProps {
  followingOnly?: boolean;
  limit?: number;
  enabled?: boolean;
}

export function useSocialFeed({
  followingOnly = false,
  limit = 10,
  enabled = true,
}: UseSocialFeedProps = {}) {
  const filters: FeedFilters = {
    ...(followingOnly && { followingOnly: "true" }),
    limit: limit.toString(),
  };

  return useInfiniteQuery({
    queryKey: ["social", "feed", filters],
    queryFn: async ({ pageParam = 1 }) => {
      return getSocialFeed({ ...filters, page: pageParam.toString() });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;
      return (lastPage?.page ?? 1) + 1;
    },
    select: (data) => data.pages.flatMap((item) => item.data),
    enabled,
  });
}
