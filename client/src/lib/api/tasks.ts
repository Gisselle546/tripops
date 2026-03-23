import { apiClient } from "./client";
import type { Task } from "@/types/task";
import type { AxiosResponse } from "axios";

export const tasksApi = {
  create: (
    tripId: string,
    body: {
      title: string;
      description?: string;
      dueDate?: string;
      assigneeUserId?: string;
    },
  ) =>
    apiClient
      .post<Task>(`/trips/${tripId}/tasks`, body)
      .then((r: AxiosResponse<Task>) => r.data),

  list: (tripId: string) =>
    apiClient
      .get<Task[]>(`/trips/${tripId}/tasks`)
      .then((r: AxiosResponse<Task[]>) => r.data),

  get: (tripId: string, taskId: string) =>
    apiClient
      .get<Task>(`/trips/${tripId}/tasks/${taskId}`)
      .then((r: AxiosResponse<Task>) => r.data),

  update: (tripId: string, taskId: string, body: Partial<Task>) =>
    apiClient
      .patch<Task>(`/trips/${tripId}/tasks/${taskId}`, body)
      .then((r: AxiosResponse<Task>) => r.data),

  delete: (tripId: string, taskId: string) =>
    apiClient
      .delete<{ ok: true }>(`/trips/${tripId}/tasks/${taskId}`)
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
