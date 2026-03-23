"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useCreateTask } from "@/hooks/use-tasks";

export default function NewTaskPage() {
  const router = useRouter();
  const tripId = useActiveTrip();
  const createTask = useCreateTask(tripId ?? "");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <p className="text-slate-500">Select a trip first.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        assigneeUserId: assigneeUserId.trim() || undefined,
      },
      { onSuccess: () => router.push("/tasks") },
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/tasks")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Tasks
          </button>
          <h1 className="text-4xl font-bold tracking-tight">New Task</h1>
          <p className="mt-2 text-slate-500">
            Add a task to track trip preparation work.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Book airport transfer"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add details about this task..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assign To (User ID)
            </label>
            <input
              type="text"
              value={assigneeUserId}
              onChange={(e) => setAssigneeUserId(e.target.value)}
              placeholder="Optional — leave blank for unassigned"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/tasks")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending || !title.trim()}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {createTask.isPending ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
