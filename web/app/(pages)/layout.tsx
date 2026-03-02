"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getQueryClient } from "@/lib/queryClient";
import { ApiClient } from "@/services/apiClient";
import { dehydrate, HydrationBoundary, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { ReactNode, useEffect } from "react";

const SKIP_KEY = "onboarding_skipped_until";

export default function Layout({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const apiClient = new ApiClient();
  const router = useRouter();

  queryClient.prefetchQuery({
    queryKey: ["user_favorites_recepies_entries"],
    queryFn: async () => apiClient.userService.getUserSavedRecipeEntries(),
    staleTime: 6 * 60 * 60 * 1000,
  });

  const { data: userPreferences, isPending, status } = useQuery({
    queryKey: ["user_preferences"],
    queryFn: async () => apiClient.userService.getUserPreferences(),
    staleTime: 6 * 60 * 60 * 1000,
  });

  useEffect(() => {
    if (status === "success" && !userPreferences && !isPending) {
      const skippedUntil = localStorage.getItem(SKIP_KEY);
      
      if (skippedUntil) {
        const skippedDate = new Date(skippedUntil);
        const now = new Date();
        
        if (now >= skippedDate) {
          localStorage.removeItem(SKIP_KEY);
          router.push("/onboarding");
        }
      } else {
        router.push("/onboarding");
      }
    }
  }, [userPreferences, isPending, status, router]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>
        <Navbar />
        {children}
        <Footer />
      </main>
    </HydrationBoundary>
  );
}