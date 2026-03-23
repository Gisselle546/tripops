"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateWorkspace,
  useRemoveMember,
} from "@/hooks/use-workspaces";

type NotificationPref = {
  label: string;
  key: string;
  enabled: boolean;
};

type Integration = {
  name: string;
  status: "Connected" | "Pending" | "Disconnected";
  description: string;
};

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: workspace } = useWorkspace(activeWorkspaceId ?? "");
  const { data: members } = useWorkspaceMembers(activeWorkspaceId ?? "");
  const updateWorkspace = useUpdateWorkspace(activeWorkspaceId ?? "");
  const removeMember = useRemoveMember(activeWorkspaceId ?? "");

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.fullName ?? "");

  // Workspace name editing
  const [editingWorkspace, setEditingWorkspace] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [wsSaved, setWsSaved] = useState(false);

  // Notification toggles (local state — no backend endpoint for user prefs yet)
  const [notifPrefs, setNotifPrefs] = useState<NotificationPref[]>([
    { label: "Trip updates", key: "trip", enabled: true },
    { label: "Booking alerts", key: "booking", enabled: true },
    { label: "Collaboration mentions", key: "collab", enabled: false },
    { label: "Document activity", key: "docs", enabled: true },
  ]);

  function toggleNotif(key: string) {
    setNotifPrefs((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n)),
    );
  }

  // Integrations (local toggle)
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      name: "Google Calendar",
      status: "Connected",
      description: "Sync trip dates and itinerary events.",
    },
    {
      name: "Airline APIs",
      status: "Pending",
      description: "Track live flight details and booking changes.",
    },
    {
      name: "Maps",
      status: "Connected",
      description: "Show routes, places, and pinned trip locations.",
    },
  ]);

  function toggleIntegration(name: string) {
    setIntegrations((prev) =>
      prev.map((i) =>
        i.name === name
          ? {
              ...i,
              status: i.status === "Connected" ? "Disconnected" : "Connected",
            }
          : i,
      ),
    );
  }

  // Permission matrix
  const permissions = [
    { label: "Manage trips", value: "Owner, Admin" },
    { label: "Edit bookings", value: "Owner, Admin, Member" },
    { label: "Invite members", value: "Owner, Admin" },
    { label: "Delete workspace docs", value: "Owner only" },
  ];

  const statusTone: Record<string, string> = {
    Connected: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Disconnected: "bg-slate-100 text-slate-500",
  };

  function handleSaveWorkspace() {
    const body: { name?: string; description?: string } = {};
    const newName = wsName.trim();
    const newDesc = wsDesc.trim();
    if (newName && newName !== workspace?.name) body.name = newName;
    if (newDesc !== (workspace?.description ?? "")) body.description = newDesc;
    if (Object.keys(body).length === 0) {
      setEditingWorkspace(false);
      return;
    }
    updateWorkspace.mutate(body, {
      onSuccess: () => {
        setEditingWorkspace(false);
        setWsSaved(true);
        setTimeout(() => setWsSaved(false), 3000);
      },
    });
  }

  // Populate workspace form when entering edit mode
  function startEditWorkspace() {
    setWsName(workspace?.name ?? "");
    setWsDesc(workspace?.description ?? "");
    setEditingWorkspace(true);
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Page header */}
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Settings
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Account &amp; Workspace Configuration
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your profile, notifications, permissions, and integrations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Profile */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Profile</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Your Account
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                  {initials}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {user?.fullName ?? "Unknown User"}
                  </div>
                  <div className="text-sm text-slate-500">
                    {user?.email ?? "No email"}
                  </div>
                </div>
              </div>

              {editingProfile ? (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Display name
                    </label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-3">
                  <button
                    onClick={() => {
                      setProfileName(user?.fullName ?? "");
                      setEditingProfile(true);
                    }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-white transition"
                  >
                    Edit profile
                  </button>
                </div>
              )}
            </section>

            {/* Notifications — interactive local toggles */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Notifications</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Alerts &amp; Updates
              </div>
              <div className="mt-5 space-y-3">
                {notifPrefs.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-slate-500">
                        Email and in-app notification
                      </div>
                    </div>
                    <button
                      onClick={() => toggleNotif(item.key)}
                      className={[
                        "h-7 w-12 rounded-full p-1 transition",
                        item.enabled ? "bg-blue-600" : "bg-slate-300",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "h-5 w-5 rounded-full bg-white transition",
                          item.enabled ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Workspace settings */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">
                    Workspace settings
                  </div>
                  <div className="mt-1 text-2xl font-bold tracking-tight">
                    {workspace?.name ?? "Workspace"} — Members &amp; Permissions
                  </div>
                </div>
                {!editingWorkspace && (
                  <button
                    onClick={startEditWorkspace}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:bg-white transition"
                  >
                    Edit
                  </button>
                )}
              </div>

              {/* Workspace name/desc editing */}
              {editingWorkspace && (
                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Workspace name
                    </label>
                    <input
                      type="text"
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={wsDesc}
                      onChange={(e) => setWsDesc(e.target.value)}
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none resize-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingWorkspace(false)}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveWorkspace}
                      disabled={updateWorkspace.isPending}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {updateWorkspace.isPending ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              )}

              {wsSaved && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                  Workspace updated successfully!
                </div>
              )}

              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                {/* Members — live data */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-600">
                    Members ({members?.length ?? 0})
                  </div>
                  {members && members.length > 0 ? (
                    members.map((m) => {
                      const displayName =
                        m.user?.name ?? m.user?.email ?? "Unknown";
                      const mInitials = displayName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      const isOwner = m.role === "OWNER";
                      const roleBadge: Record<string, string> = {
                        OWNER: "bg-amber-100 text-amber-800",
                        ADMIN: "bg-blue-100 text-blue-800",
                        MEMBER: "bg-slate-100 text-slate-700",
                        GUEST: "bg-slate-100 text-slate-500",
                      };
                      return (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                            {mInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {displayName}
                            </div>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadge[m.role] ?? roleBadge.MEMBER}`}
                            >
                              {m.role}
                            </span>
                          </div>
                          {!isOwner && (
                            <button
                              onClick={() => removeMember.mutate(m.id)}
                              className="text-xs text-red-500 hover:text-red-700"
                              title="Remove member"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-400 text-center py-6 rounded-2xl border border-dashed border-slate-200">
                      No members found.
                    </div>
                  )}
                </div>

                {/* Permissions */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-slate-600">
                    Permission Levels
                  </div>
                  {permissions.map((permission) => (
                    <div
                      key={permission.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="text-sm text-slate-500">
                        {permission.label}
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {permission.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Integrations — toggle connect/disconnect */}
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Integrations</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Connected Services
              </div>
              <div className="mt-5 space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {integration.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {integration.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[integration.status]}`}
                      >
                        {integration.status}
                      </span>
                      <button
                        onClick={() => toggleIntegration(integration.name)}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm transition",
                          integration.status === "Connected"
                            ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                            : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50",
                        ].join(" ")}
                      >
                        {integration.status === "Connected"
                          ? "Disconnect"
                          : "Connect"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
