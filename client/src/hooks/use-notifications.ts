"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api/notifications";
import { qk } from "@/lib/query-keys";

export function useNotifications(limit = 50) {
  return useQuery({
    queryKey: qk.notifications.all(),
    queryFn: () => notificationsApi.list(limit),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: qk.notifications.unread(),
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30_000, // poll every 30s for badge updates
  });
}

export function useMarkRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => notificationsApi.markRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.notifications.all() });
      qc.invalidateQueries({ queryKey: qk.notifications.unread() });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.notifications.all() });
      qc.invalidateQueries({ queryKey: qk.notifications.unread() });
    },
  });
}
