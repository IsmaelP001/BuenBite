import {
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { getQueryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/supabase/server";
import { getSocialProfile } from "@/actions/social";
import { getGamificationProfile, getGamificationUserProfile } from "@/actions/gamification";
import ProfileClient from "@/components/social/ProfileClient";
import Loading from "@/components/Loading";

export default async function SocialProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const queryClient = getQueryClient();
  const user = await getUser();
  const currentUserId = user?.id ?? "";
  const isOwnProfile = userId === currentUserId;

  // Prefetch profile + gamification in parallel
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["social", "profile", userId],
      queryFn: async () => getSocialProfile(userId),
    }),
    isOwnProfile
      ? queryClient.prefetchQuery({
          queryKey: ["gamification", "profile"],
          queryFn: async () => getGamificationProfile(),
        })
      : queryClient.prefetchQuery({
          queryKey: ["gamification", "profile", userId],
          queryFn: async () => getGamificationUserProfile(userId),
        }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Loading />}>
        <ProfileClient userId={userId} currentUserId={currentUserId} />
      </Suspense>
    </HydrationBoundary>
  );
}
