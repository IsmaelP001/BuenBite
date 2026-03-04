"use client";

import { useEffect, useRef, useCallback } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/authContext";
import type { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createSupabaseClient();

export interface RealtimePointsPayload {
  id: string;
  userId: string;
  action: string;
  basePoints: number;
  streakMultiplier: number;
  totalPoints: number;
  masteryCategory: string;
  masteryXpGained: number;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface RealtimeAlertPayload {
  id: string;
  userId: string;
  alertType: string;
  title: string;
  message: string;
  icon: string;
  data: Record<string, unknown> | null;
  seen: boolean;
  createdAt: string;
}

/**
 * Maps a snake_case row from Supabase Realtime to our camelCase interfaces.
 */
function mapSnakeToCamelPoints(
  row: Record<string, unknown>,
): RealtimePointsPayload {
  console.log("Mapping Realtime points payload:", row);
  return {
    id: row.id as string,
    userId: row.user_id as string,
    action: row.action as string,
    basePoints: row.base_points as number,
    streakMultiplier: row.streak_multiplier as number,
    totalPoints: row.total_points as number,
    masteryCategory: row.mastery_category as string,
    masteryXpGained: row.mastery_xp_gained as number,
    referenceId: (row.reference_id as string) ?? null,
    referenceType: (row.reference_type as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
    createdAt: row.created_at as string,
  };
}

function mapSnakeToCamelAlert(
  row: Record<string, unknown>,
): RealtimeAlertPayload {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    alertType: row.alert_type as string,
    title: row.title as string,
    message: row.message as string,
    icon: row.icon as string,
    data: (row.data as Record<string, unknown>) ?? null,
    seen: row.seen as boolean,
    createdAt: row.created_at as string,
  };
}

interface UseGamificationRealtimeOptions {
  onPointsReceived?: (payload: RealtimePointsPayload) => void;
  onAlertReceived?: (payload: RealtimeAlertPayload) => void;
}

/**
 * Listens to Supabase Realtime for inserts on `points_log` and `gamification_alerts`
 * filtered by the current user's ID.
 */
export function useGamificationRealtime({
  onPointsReceived,
  onAlertReceived,
}: UseGamificationRealtimeOptions) {
  const { user } = useAuth();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Stable refs for callbacks to avoid re-subscribing
  const onPointsRef = useRef(onPointsReceived);
  const onAlertRef = useRef(onAlertReceived);

  useEffect(() => {
    onPointsRef.current = onPointsReceived;
    onAlertRef.current = onAlertReceived;
  });

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    const userId = user?.id;
    console.log("[Gamification Realtime] Setting up realtime listeners for user:", userId);
    if (!userId) return;

    const channel = supabase
      .channel(`gamification:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "points_log",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            const data = mapSnakeToCamelPoints(
              payload.new as Record<string, unknown>,
            );
            onPointsRef.current?.(data);
            console.error("[Gamification Realtime]  points payload:", payload);
          } catch (err) {
            console.error(
              "[Gamification Realtime] Error mapping points payload:",
              err,
              payload,
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "gamification_alerts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          try {
            const data = mapSnakeToCamelAlert(
              payload.new as Record<string, unknown>,
            );
            onAlertRef.current?.(data);
            console.error("[Gamification Realtime]  alert payload:", payload);
          } catch (err) {
            console.error(
              "[Gamification Realtime] Error mapping alert payload:",
              err,
              payload,
            );
          }
        },
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("[Gamification Realtime] Subscribed successfully");
        } else if (status === "CHANNEL_ERROR") {
          console.error("[Gamification Realtime] Channel error:", err);
        } else if (status === "TIMED_OUT") {
          console.warn("[Gamification Realtime] Subscription timed out");
        } else {
          console.log("[Gamification Realtime] Status:", status);
        }
      });

    channelRef.current = channel;

    return cleanup;
  }, [user?.id, cleanup]);
}
