"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "@/lib/api/tasks";
import type { Task } from "@/types/task";
import { qk } from "@/lib/query-keys";

export function useTasks(tripId: string) {
  return useQuery({
    queryKey: qk.trips.tasks(tripId),
    queryFn: () => tasksApi.list(tripId),
    enabled: !!tripId,
  });
}

export function useCreateTask(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      title: string;
      description?: string;
      dueDate?: string;
      assigneeUserId?: string;
    }) => tasksApi.create(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.tasks(tripId) });
    },
  });
}

export function useUpdateTask(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, ...body }: Partial<Task> & { taskId: string }) =>
      tasksApi.update(tripId, taskId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.tasks(tripId) });
    },
  });
}

export function useDeleteTask(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(tripId, taskId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.tasks(tripId) });
    },
  });
}
