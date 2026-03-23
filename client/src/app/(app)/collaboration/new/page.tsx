"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useCreateProposal } from "@/hooks/use-collab";
import { collabApi } from "@/lib/api/collab";

export default function NewProposalPage() {
  const router = useRouter();
  const tripId = useActiveTrip();
  const createProposal = useCreateProposal(tripId ?? "");
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([
    { label: "", details: "" },
    { label: "", details: "" },
  ]);

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <p className="text-slate-500">Select a trip first.</p>
      </div>
    );
  }

  function handleAddOption() {
    setOptions((prev) => [...prev, { label: "", details: "" }]);
  }

  function handleRemoveOption(idx: number) {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateOption(
    idx: number,
    field: "label" | "details",
    value: string,
  ) {
    setOptions((prev) =>
      prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !tripId) return;

    setSubmitting(true);
    try {
      const proposal = await new Promise<{ id: string }>((resolve, reject) => {
        createProposal.mutate(
          {
            title: title.trim(),
            description: description.trim() || undefined,
          },
          { onSuccess: resolve, onError: reject },
        );
      });

      const validOptions = options.filter((o) => o.label.trim());
      for (const opt of validOptions) {
        await collabApi.addOption(tripId, proposal.id, {
          label: opt.label.trim(),
          details: opt.details.trim() || undefined,
        });
      }

      router.push("/collaboration");
    } finally {
      setSubmitting(false);
    }
  }

  const isPending = submitting || createProposal.isPending;

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/collaboration")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Collaboration
          </button>
          <h1 className="text-4xl font-bold tracking-tight">New Proposal</h1>
          <p className="mt-2 text-slate-500">
            Create a proposal for the team to vote on — pick a hotel, choose an
            activity, decide on a restaurant.
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
              Proposal Title *
            </label>
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Which hotel should we book?"
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
              rows={3}
              placeholder="Add context for the team..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Voting Options
            </label>
            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Option {idx + 1}
                    </span>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => updateOption(idx, "label", e.target.value)}
                    placeholder="Option label (e.g. Hotel Marais)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  <input
                    type="text"
                    value={opt.details}
                    onChange={(e) =>
                      updateOption(idx, "details", e.target.value)
                    }
                    placeholder="Details (optional)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-2.5 text-sm text-blue-600 font-medium w-full hover:bg-blue-50/30 transition"
            >
              + Add Another Option
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/collaboration")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {isPending ? "Creating…" : "Create Proposal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
