"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/authContext";
import {
  useGamificationRealtime,
  type RealtimePointsPayload,
  type RealtimeAlertPayload,
} from "@/hooks/gamification/useGamificationRealtime";
import {
  PointsToastContainer,
  type QueuedPointsToast,
} from "@/components/gamification/PointsToast";
import { AchievementModal } from "@/components/gamification/AchievementModal";
import { useDismissAlert } from "@/hooks/gamification/useGamification";
import type { GamificationAlertType } from "@/types/models/gamification";

// ─── Context ────────────────────────────────────────────────────────────────

interface GamificationContextValue {
  /** Forces a manual refetch of gamification profile data */
  refreshProfile: () => void;
}

const GamificationContext = createContext<GamificationContextValue>({
  refreshProfile: () => {},
});

export const useGamificationContext = () => useContext(GamificationContext);

// ─── Alert queue item ───────────────────────────────────────────────────────

interface QueuedAlert {
  id: string;
  alertType: GamificationAlertType;
  title: string;
  message: string;
  icon: string;
  data: Record<string, unknown> | null;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function GamificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dismissAlert = useDismissAlert();

  // Toast queue
  const [pointsToasts, setPointsToasts] = useState<QueuedPointsToast[]>([]);

  // Alert/modal queue — show one at a time
  const [alertQueue, setAlertQueue] = useState<QueuedAlert[]>([]);
  const currentAlert = alertQueue[0] ?? null;

  // ── Callbacks ─────────────────────────────────────────────────────────────

  const refreshProfile = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  }, [queryClient]);

  const handlePointsReceived = useCallback(
    (payload: RealtimePointsPayload) => {
      // Add toast
      setPointsToasts((prev) => [
        ...prev,
        {
          id: payload.id,
          points: payload.totalPoints,
          action: payload.action,
          streakMultiplier: payload.streakMultiplier,
        },
      ]);

      // Refresh both gamification and social profile sources after points are awarded.
      queryClient.invalidateQueries({ queryKey: ["gamification"] });
      queryClient.invalidateQueries({ queryKey: ["social", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["social", "stats"] });
      queryClient.refetchQueries({ queryKey: ["gamification"], type: "active" });
      queryClient.refetchQueries({ queryKey: ["social", "profile"], type: "active" });
    },
    [queryClient]
  );

  const handleAlertReceived = useCallback((payload: RealtimeAlertPayload) => {
    if (payload.seen) return; // already seen, skip

    setAlertQueue((prev) => [
      ...prev,
      {
        id: payload.id,
        alertType: payload.alertType as GamificationAlertType,
        title: payload.title,
        message: payload.message,
        icon: payload.icon,
        data: payload.data,
      },
    ]);

    // Also refetch alerts list
    queryClient.invalidateQueries({ queryKey: ["gamification", "alerts"] });
  }, [queryClient]);

  const handleRemoveToast = useCallback((id: string) => {
    setPointsToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleDismissAlert = useCallback(() => {
    if (!currentAlert) return;

    // Mark as seen on server
    dismissAlert.mutate(currentAlert.id);

    // Remove from queue
    setAlertQueue((prev) => prev.slice(1));
  }, [currentAlert, dismissAlert]);

  // ── Realtime subscription ─────────────────────────────────────────────────

  useGamificationRealtime({
    onPointsReceived: handlePointsReceived,
    onAlertReceived: handleAlertReceived,
  });

  // Don't render gamification UI for unauthenticated users
  if (!user) {
    return (
      <GamificationContext.Provider value={{ refreshProfile }}>
        {children}
      </GamificationContext.Provider>
    );
  }

  return (
    <GamificationContext.Provider value={{ refreshProfile }}>
      {children}

      {/* Floating points toasts */}
      <PointsToastContainer
        toasts={pointsToasts}
        onRemove={handleRemoveToast}
      />

      {/* Achievement modal (one at a time) */}
      {currentAlert && (
        <AchievementModal
          open={true}
          alertType={currentAlert.alertType}
          title={currentAlert.title}
          message={currentAlert.message}
          icon={currentAlert.icon}
          data={currentAlert.data}
          onDismiss={handleDismissAlert}
        />
      )}
    </GamificationContext.Provider>
  );
}
