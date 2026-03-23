"use client";

import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useRouter } from "next/navigation";
import { coverStyle } from "@/lib/cover-images";

export default function WorkspacesPage() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const { setActiveWorkspace } = useWorkspaceStore();
  const router = useRouter();

  function handleSelect(id: string) {
    setActiveWorkspace(id);
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Your Workspaces
        </h1>
        <p className="text-slate-500 mb-8">
          Select a workspace to start planning.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[28px] border border-slate-200 bg-white shadow-sm animate-pulse overflow-hidden"
            >
              <div className="h-48 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-40 rounded bg-slate-200" />
                <div className="h-4 w-56 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Your Workspaces
          </h1>
          <p className="mt-1 text-slate-500">
            Select a workspace to start planning trips.
          </p>
        </div>
        <button
          onClick={() => router.push("/workspace/new")}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
        >
          + New Workspace
        </button>
      </div>

      {workspaces?.length === 0 && (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="text-5xl mb-4">🏢</div>
          <div className="text-xl font-semibold text-slate-600">
            No workspaces yet
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Create your first workspace to organize trips and collaborate.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces?.map((ws) => (
          <button
            key={ws.id}
            onClick={() => handleSelect(ws.id)}
            className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm text-left transition-all hover:shadow-md hover:border-blue-300"
          >
            {/* Cover image area */}
            <div
              className="relative h-48 w-full overflow-hidden"
              style={coverStyle(ws.name, ws.coverImage)}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                  {ws.name}
                </h2>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors" />
            </div>
            {/* Info area */}
            <div className="p-5">
              {ws.description && (
                <p className="text-sm text-slate-500 line-clamp-2">
                  {ws.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Created{" "}
                  {new Date(ws.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  Open →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
