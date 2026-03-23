"use client";

import { useState } from "react";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from "@/hooks/use-tasks";
import type { Task, TaskStatus } from "@/types/task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const statusTone: Record<TaskStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

export default function TasksPage() {
  const tripId = useActiveTrip();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: tasks, isLoading } = useTasks(tripId ?? "");
  const createTask = useCreateTask(tripId ?? "");
  const updateTask = useUpdateTask(tripId ?? "");
  const deleteTask = useDeleteTask(tripId ?? "");
  const { data: members } = useWorkspaceMembers(activeWorkspaceId ?? "");

  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");

  // Build userId → display name map
  const nameMap = new Map<string, string>();
  members?.forEach((m) => {
    if (m.user?.name) nameMap.set(m.userId, m.user.name);
    else if (m.user?.email) nameMap.set(m.userId, m.user.email);
  });
  function userName(userId: string): string {
    return nameMap.get(userId) ?? `User ${userId.slice(0, 8)}`;
  }
  function userInitials(userId: string): string {
    const name = nameMap.get(userId);
    if (name)
      return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    return userId.slice(0, 2).toUpperCase();
  }

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-xl font-semibold text-slate-600">
            No trip selected
          </div>
          <div className="mt-2 text-sm">
            Select a trip from the dashboard to manage tasks.
          </div>
        </div>
      </div>
    );
  }

  function handleAddTask() {
    const title = newTitle.trim();
    if (!title) return;
    createTask.mutate(
      { title, dueDate: newDue || undefined },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewDue("");
        },
      },
    );
  }

  function handleToggleComplete(task: Task) {
    const nextStatus: TaskStatus =
      task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    updateTask.mutate({ taskId: task.id, status: nextStatus });
  }

  const kanban: Record<TaskStatus, Task[]> = {
    PENDING: (tasks ?? []).filter((t) => t.status === "PENDING"),
    IN_PROGRESS: (tasks ?? []).filter((t) => t.status === "IN_PROGRESS"),
    COMPLETED: (tasks ?? []).filter((t) => t.status === "COMPLETED"),
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Tasks
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Trip Preparation Checklist
              </h1>
              <p className="mt-2 text-slate-500">
                Tasks that need to be completed before the trip.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Task title…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none w-48"
              />
              <input
                type="date"
                value={newDue}
                onChange={(e) => setNewDue(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none"
              />
              <button
                onClick={handleAddTask}
                disabled={createTask.isPending || !newTitle.trim()}
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {createTask.isPending ? "Adding…" : "+ Add Task"}
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6 animate-pulse">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && tasks?.length === 0 && (
          <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-xl font-semibold text-slate-600">
              No tasks yet
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Add your first task to start your trip preparation checklist.
            </p>
          </div>
        )}

        {/* Task List */}
        {!isLoading && tasks && tasks.length > 0 && (
          <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="text-2xl font-bold">Task List</div>
              <div className="flex gap-3">
                <button className="rounded-xl border px-3 py-2 text-sm bg-white">
                  List
                </button>
                <button className="rounded-xl border px-3 py-2 text-sm bg-white">
                  Kanban
                </button>
                <button className="rounded-xl border px-3 py-2 text-sm bg-white">
                  Completed
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={task.status === "COMPLETED"}
                      onChange={() => handleToggleComplete(task)}
                    />

                    <div>
                      <div
                        className={`font-medium text-slate-900 ${task.status === "COMPLETED" ? "line-through opacity-60" : ""}`}
                      >
                        {task.title}
                      </div>
                      <div className="text-sm text-slate-500">
                        {task.dueDate
                          ? `Due: ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : "No due date"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                        {userInitials(
                          task.assigneeUserId ?? task.createdByUserId,
                        )}
                      </div>
                      <div className="text-sm text-slate-600">
                        {userName(task.assigneeUserId ?? task.createdByUserId)}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[task.status]}`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>

                    <button
                      onClick={() => deleteTask.mutate(task.id)}
                      disabled={deleteTask.isPending}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && tasks && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(Object.keys(kanban) as TaskStatus[]).map((column) => (
              <div
                key={column}
                className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-lg font-bold mb-4">
                  {STATUS_LABELS[column]}
                </div>

                <div className="space-y-3">
                  {kanban[column].length === 0 && (
                    <div className="text-sm text-slate-400 text-center py-4">
                      No tasks
                    </div>
                  )}
                  {kanban[column].map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="font-medium text-slate-900">
                        {task.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {task.dueDate
                          ? `Due: ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                          : "No due date"}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                            {userInitials(
                              task.assigneeUserId ?? task.createdByUserId,
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {userName(
                              task.assigneeUserId ?? task.createdByUserId,
                            )}
                          </div>
                        </div>

                        {column !== "COMPLETED" && (
                          <button
                            onClick={() =>
                              updateTask.mutate({
                                taskId: task.id,
                                status:
                                  column === "PENDING"
                                    ? "IN_PROGRESS"
                                    : "COMPLETED",
                              })
                            }
                            className="rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white"
                          >
                            {column === "PENDING" ? "Start" : "Complete"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
