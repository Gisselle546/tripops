"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useCreateTrip } from "@/hooks/use-trips";

export default function NewTripPage() {
  const router = useRouter();
  const workspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const createTrip = useCreateTrip(workspaceId ?? "");

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetTarget, setBudgetTarget] = useState("");
  const [coverImage, setCoverImage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId) return;
    if (!title.trim() || !destination.trim() || !startDate || !endDate) return;

    createTrip.mutate(
      {
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        budgetTarget: budgetTarget
          ? Math.round(Number(budgetTarget) * 100)
          : undefined,
        coverImage: coverImage.trim() || undefined,
      },
      {
        onSuccess: () => router.push("/workspace"),
      },
    );
  }

  if (!workspaceId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-slate-500 space-y-2">
          <p>Select a workspace first.</p>
          <button
            onClick={() => router.push("/workspaces")}
            className="text-blue-600 text-sm"
          >
            Go to workspaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/workspace")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Workspace
          </button>
          <h1 className="text-4xl font-bold tracking-tight">New Trip</h1>
          <p className="mt-2 text-slate-500">
            Create a new trip inside your active workspace.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Trip Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Barcelona Team Offsite"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Destination *
            </label>
            <input
              required
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Barcelona, Spain"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date *
              </label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Budget Target (USD)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetTarget}
              onChange={(e) => setBudgetTarget(e.target.value)}
              placeholder="e.g. 3000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/photo-… (optional)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
            {coverImage.trim() && (
              <div
                className="mt-2 h-32 w-full rounded-xl overflow-hidden bg-slate-100"
                style={{
                  backgroundImage: `url(${coverImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}
            <p className="mt-1 text-xs text-slate-400">
              Paste a URL to an image for your trip cover. Leave blank for a
              default gradient.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/workspace")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createTrip.isPending ||
                !title.trim() ||
                !destination.trim() ||
                !startDate ||
                !endDate
              }
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {createTrip.isPending ? "Creating…" : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
