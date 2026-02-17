"use client";
import { getSocialProfile, getSocialStats, updateSocialBio } from "@/actions/social";
import { useAppMutation } from "@/hooks/useAppMutation";
import { useQuery } from "@tanstack/react-query";

export function useGetProfile(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["social", "profile", userId],
    queryFn: async () => getSocialProfile(userId),
    enabled,
    select: (data) => data.data,
  });
}

export function useGetStats(userId: string, enabled = true) {
  return useQuery({
    queryKey: ["social", "stats", userId],
    queryFn: async () => getSocialStats(userId),
    enabled,
    select: (data) => data.data,
  });
}

export function useUpdateBio() {
  return useAppMutation(
    async (bio: string) => updateSocialBio(bio),
    {
      invalidateQueries: ["social"],
      toastConfig: { success: "Bio actualizada", error: "Error al actualizar bio" },
    }
  );
}
