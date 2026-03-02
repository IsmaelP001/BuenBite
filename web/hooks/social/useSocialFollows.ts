"use client";
import { useAppMutation } from "@/hooks/useAppMutation";
import {
  followSocialUser,
  unfollowSocialUser,
  getSocialFollowers,
  getSocialFollowing,
} from "@/actions/social";
import { useQuery } from "@tanstack/react-query";

export function useFollowUser() {
  return useAppMutation(
    async (userId: string) => followSocialUser(userId),
    {
      invalidateQueries: ["social"],
      toastConfig: { success: "¡Ahora sigues a este usuario!", error: "Error al seguir" },
    }
  );
}

export function useUnfollowUser() {
  return useAppMutation(
    async (userId: string) => unfollowSocialUser(userId),
    {
      invalidateQueries: ["social"],
      toastConfig: { success: "Dejaste de seguir", error: "Error al dejar de seguir" },
    }
  );
}

export function useGetFollowers(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["social", "followers", userId],
    queryFn: async () => getSocialFollowers(userId),
    enabled,
    select: (data) => data.data,
  });
}

interface UseGetFollowingOptions {
  enabled?: boolean;
  page?: string;
  limit?: string;
}

export function useGetFollowing(
  userId: string,
  { enabled = true, page, limit }: UseGetFollowingOptions = {}
) {
  return useQuery({
    queryKey: ["social", "following", userId, page, limit],
    queryFn: async () => getSocialFollowing(userId, page, limit),
    enabled,
    select: (data) => data.data,
  });
}
