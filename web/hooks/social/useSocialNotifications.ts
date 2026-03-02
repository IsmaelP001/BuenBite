"use client";
import {
  getSocialNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationsCount,
} from "@/actions/social";
import { useAppMutation } from "@/hooks/useAppMutation";
import { NotificationFilters } from "@/types/models/social";
import { useQuery } from "@tanstack/react-query";

export function useGetNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: ["social", "notifications", filters],
    queryFn: async () => getSocialNotifications(filters),
    select: (data) => data.data,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["social", "notifications", "unread-count"],
    queryFn: async () => getUnreadNotificationsCount(),
    select: (data) => data.data.count,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  return useAppMutation(
    async (notificationId: string) => markNotificationRead(notificationId),
    {
      invalidateQueries: ["social"],
      toastVisibility: { showSuccess: false, showLoading: false },
    }
  );
}

export function useMarkAllNotificationsRead() {
  return useAppMutation(
    async () => markAllNotificationsRead(),
    {
      invalidateQueries: ["social"],
      toastConfig: { success: "Todas las notificaciones marcadas como leídas" },
    }
  );
}
