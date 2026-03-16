import { apiClient } from "./client";
import type { NotificationPage } from "@/types/notification";
import type { AxiosResponse } from "axios";

export const notificationsApi = {
  list: (limit = 50, offset = 0) =>
    apiClient
      .get<NotificationPage>("/notifications", { params: { limit, offset } })
      .then((r: AxiosResponse<NotificationPage>) => r.data),

  unreadCount: () =>
    apiClient
      .get<{ count: number }>("/notifications/unread-count")
      .then((r: AxiosResponse<{ count: number }>) => r.data),

  markRead: (ids: string[]) =>
    apiClient
      .patch<{ ok: true }>("/notifications/read", { ids })
      .then((r: AxiosResponse<{ ok: true }>) => r.data),

  markAllRead: () =>
    apiClient
      .patch<{ ok: true }>("/notifications/read-all")
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
