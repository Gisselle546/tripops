"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/hooks/use-workspaces";

export default function NewWorkspacePage() {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    createWorkspace.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
      },
      { onSuccess: () => router.push("/workspace") },
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/workspaces")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Workspaces
          </button>
          <h1 className="text-4xl font-bold tracking-tight">New Workspace</h1>
          <p className="mt-2 text-slate-500">
            Create a workspace to organize trips and collaborate with your team.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Workspace Name *
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Europe Ops Team"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="What is this workspace for?"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-200"
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
              Paste a URL to an image for your workspace cover. Leave blank for
              a default gradient.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/workspaces")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkspace.isPending || !name.trim()}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {createWorkspace.isPending ? "Creating…" : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
