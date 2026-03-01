import {
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/supabase/server";
import { getSocialFeed, getSocialExplore, getSocialInsights, getSocialFollowers, getSocialProfile } from "@/actions/social";
import SocialFeedClient from "@/components/social/SocialFeedClient";
import Loading from "@/components/Loading";

export default async function SocialPage() {
  const queryClient = getQueryClient();
  const user = await getUser();
  const userId = user?.id ?? "";

  const prefetches = [
    queryClient.prefetchInfiniteQuery({
      queryKey: ["social", "feed", { limit: "20" }],
      queryFn: async () => getSocialFeed({ limit: "20", page: "1" }),
      initialPageParam: 1,
    }),
    queryClient.prefetchQuery({
      queryKey: ["social", "explore", undefined],
      queryFn: async () => getSocialExplore(),
    }),
    queryClient.prefetchQuery({
      queryKey: ["social", "insights"],
      queryFn: async () => getSocialInsights(),
    }),
  ];

  if (userId) {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: ["social", "profile", userId],
        queryFn: async () => getSocialProfile(userId),
      }),
      queryClient.prefetchQuery({
        queryKey: ["social", "followers", userId],
        queryFn: async () => getSocialFollowers(userId),
      }),
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <SocialFeedClient currentUserId={userId} />
      </Suspense>
    </HydrationBoundary>
  );
}
