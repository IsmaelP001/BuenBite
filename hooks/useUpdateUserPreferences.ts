"use client";
import { UserPreferences } from "@/types/models/user";
import { useOptimisticMutation } from "./useOptimisticMutation";
import { useRouter } from "next/navigation";
import { updateUserPrefenrences } from "@/actions/user";

export default function useUpdateUserPreferences() {
  const router = useRouter();

  return useOptimisticMutation({
    mutationFn: async (data: Partial<UserPreferences>) =>
      updateUserPrefenrences(data),
    queries: {
      queryKey: ["user_preferences"],
      updateCache: (oldData: any, newData: any) => {
        return {
          ...oldData,
          data: {
            ...oldData.data,
            ...newData,
          },
        };
      },
    },
    onError(err) {
      console.log("err creating purchase", err);
      router.push("/purchases");
    },
  });
}
