"use client";

import { useState } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTripStore } from "@/stores/trip-store";
import {
  useWorkspace,
  useWorkspaceMembers,
  useUpdateWorkspace,
  useInviteMember,
  useUpdateMemberRole,
  useRemoveMember,
} from "@/hooks/use-workspaces";
import { useTrips } from "@/hooks/use-trips";
import { useRuleSet, useUpsertRuleSet } from "@/hooks/use-rules";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useRouter } from "next/navigation";
import { coverStyle } from "@/lib/cover-images";
import type { Trip } from "@/types/trip";
import type { WorkspaceRole } from "@/types/workspace";

export default function WorkspacePage() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { setActiveTrip } = useTripStore();
  const activeTripId = useActiveTrip();
  const router = useRouter();

  const { data: workspace, isLoading: wsLoading } = useWorkspace(
    activeWorkspaceId ?? "",
  );
  const { data: trips, isLoading: tripsLoading } = useTrips(
    activeWorkspaceId ?? "",
  );
  const { data: members } = useWorkspaceMembers(activeWorkspaceId ?? "");
  const updateWorkspace = useUpdateWorkspace(activeWorkspaceId ?? "");
  const inviteMember = useInviteMember(activeWorkspaceId ?? "");
  const updateMemberRole = useUpdateMemberRole(activeWorkspaceId ?? "");
  const removeMember = useRemoveMember(activeWorkspaceId ?? "");

  // Rules for the active trip
  const { data: ruleSet } = useRuleSet(activeTripId ?? "");
  const upsertRules = useUpsertRuleSet(activeTripId ?? "");

  // Local state for modals/forms
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "permissions" | "settings"
  >("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("MEMBER");
  const [inviteError, setInviteError] = useState("");

  // Workspace settings form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);

  const isLoading = wsLoading || tripsLoading;

  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-xl font-semibold text-slate-600">
            No workspace selected
          </div>
          <div className="mt-2 text-sm">
            <button
              onClick={() => router.push("/workspaces")}
              className="text-blue-600 underline"
            >
              Select a workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleTripClick(trip: Trip) {
    setActiveTrip(trip.id);
    router.push("/itinerary");
  }

  function getTripStatus(trip: Trip): string {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (now > end) return "Completed";
    if (now >= start && now <= end) return "Confirmed";
    return "Planning";
  }

  const statusTone: Record<string, string> = {
    Planning: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  function handleInvite() {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setInviteError("");
    inviteMember.mutate(
      { email, role: inviteRole },
      {
        onSuccess: () => {
          setInviteEmail("");
          setInviteRole("MEMBER");
        },
        onError: (err: unknown) => {
          const msg =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { message?: string } } }).response
                  ?.data?.message
              : "Failed to invite member";
          setInviteError(msg ?? "Failed to invite member");
        },
      },
    );
  }

  function handleSaveSettings() {
    const body: { name?: string; description?: string } = {};
    const newName = editName.trim();
    const newDesc = editDesc.trim();
    if (newName && newName !== workspace?.name) body.name = newName;
    if (newDesc !== (workspace?.description ?? "")) body.description = newDesc;
    if (Object.keys(body).length === 0) return;
    updateWorkspace.mutate(body, {
      onSuccess: () => {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      },
    });
  }

  // Populate settings form when workspace loads
  if (workspace && !editName && !editDesc) {
    if (workspace.name && editName !== workspace.name)
      setEditName(workspace.name);
    if (workspace.description && editDesc !== workspace.description)
      setEditDesc(workspace.description ?? "");
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: "🏝️" },
    { id: "members" as const, label: "Members", icon: "👥" },
    { id: "permissions" as const, label: "Permissions", icon: "🔒" },
    { id: "settings" as const, label: "Settings", icon: "⚙️" },
  ];

  const ROLE_OPTIONS: WorkspaceRole[] = ["ADMIN", "MEMBER", "GUEST"];
  const roleBadge: Record<string, string> = {
    OWNER: "bg-amber-100 text-amber-800",
    ADMIN: "bg-blue-100 text-blue-800",
    MEMBER: "bg-slate-100 text-slate-700",
    GUEST: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <section className="space-y-6">
        {/* Workspace hero */}
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div
            className="relative h-56 overflow-hidden"
            style={coverStyle(
              workspace?.name ?? "Workspace",
              workspace?.coverImage,
            )}
          >
            <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="text-white">
                  <div className="text-sm uppercase tracking-[0.2em] text-white/75">
                    Workspace
                  </div>
                  {isLoading ? (
                    <div className="mt-2 h-12 w-64 rounded bg-white/20 animate-pulse" />
                  ) : (
                    <>
                      <h1 className="mt-2 text-5xl font-bold tracking-tight">
                        {workspace?.name ?? "Workspace"}
                      </h1>
                      {workspace?.description && (
                        <p className="mt-2 max-w-2xl text-white/85">
                          {workspace.description}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white backdrop-blur">
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      Active Trips
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {trips?.length ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white backdrop-blur">
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      Members
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {members?.length ?? "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white backdrop-blur">
                    <div className="text-xs uppercase tracking-wide text-white/70">
                      Rules
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      {ruleSet?.ruleSet?.rules?.filter(
                        (r: { enabled: boolean }) => r.enabled,
                      ).length ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 border-t border-slate-100 px-6 pt-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "px-5 py-3 text-sm font-medium rounded-t-xl transition",
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            {/* Trip list */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Trips in this workspace
                  </h2>
                  <p className="mt-1 text-slate-500">
                    Shared trips that belong to{" "}
                    {workspace?.name ?? "this workspace"}.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/trips/new")}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
                >
                  + New Trip
                </button>
              </div>

              {tripsLoading && (
                <div className="space-y-5">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm animate-pulse"
                    >
                      <div className="h-64 bg-slate-200" />
                    </div>
                  ))}
                </div>
              )}

              {!tripsLoading && trips?.length === 0 && (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
                  <div className="text-5xl mb-4">🌍</div>
                  <div className="text-xl font-semibold text-slate-600">
                    No trips yet
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Create your first workspace trip to get started.
                  </p>
                </div>
              )}

              {!tripsLoading && (
                <div className="grid grid-cols-1 gap-5">
                  {trips?.map((trip) => {
                    const status = getTripStatus(trip);
                    const startFormatted = new Date(
                      trip.startDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const endFormatted = new Date(
                      trip.endDate,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const dateRange = `${startFormatted} – ${endFormatted}`;

                    return (
                      <div
                        key={trip.id}
                        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
                          <div
                            className="relative h-64 md:h-full min-h-64"
                            style={coverStyle(trip.title, trip.coverImage)}
                          >
                            <div className="absolute left-5 top-5">
                              <span
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${statusTone[status]}`}
                              >
                                {status}
                              </span>
                            </div>
                            <div className="absolute bottom-5 left-5 text-white">
                              <h3 className="text-3xl font-bold tracking-tight">
                                {trip.title}
                              </h3>
                              <p className="mt-1 text-white/85">{dateRange}</p>
                            </div>
                          </div>

                          <div className="p-5 lg:p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="text-sm text-slate-500">
                                  Workspace trip
                                </div>
                                <div className="mt-1 text-xl font-semibold text-slate-900">
                                  {trip.destination}
                                </div>
                              </div>
                              <button
                                onClick={() => handleTripClick(trip)}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                              >
                                Open Trip
                              </button>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-400">
                                  Status
                                </div>
                                <div className="mt-1 font-semibold">
                                  {status}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-400">
                                  Dates
                                </div>
                                <div className="mt-1 font-semibold">
                                  {dateRange}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="text-xs uppercase tracking-wide text-slate-400">
                                  Budget
                                </div>
                                <div className="mt-1 font-semibold">
                                  {trip.budgetTarget
                                    ? `$${(trip.budgetTarget / 100).toLocaleString()}`
                                    : "—"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right sidebar — members quick view */}
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Team</div>
                    <div className="text-2xl font-bold tracking-tight">
                      Workspace Members
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("members")}
                    className="text-sm text-blue-600"
                  >
                    Manage
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {members && members.length > 0 ? (
                    members.slice(0, 5).map((m) => {
                      const displayName =
                        m.user?.name ?? m.user?.email ?? "Unknown";
                      const initials = displayName
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {displayName}
                            </div>
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${roleBadge[m.role] ?? roleBadge.MEMBER}`}
                            >
                              {m.role}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-400 text-center py-6">
                      No members found.
                    </div>
                  )}
                  {members && members.length > 5 && (
                    <button
                      onClick={() => setActiveTab("members")}
                      className="w-full text-center text-sm text-blue-600 py-2"
                    >
                      View all {members.length} members
                    </button>
                  )}
                </div>
              </div>

              {/* Quick actions */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Quick actions</div>
                <div className="mt-1 text-2xl font-bold tracking-tight">
                  Manage workspace
                </div>
                <div className="mt-5 space-y-3">
                  <button
                    onClick={() => setActiveTab("members")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
                  >
                    <div className="font-semibold text-slate-900">
                      👥 Invite Member
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Add teammates or guests to this workspace.
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("permissions")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
                  >
                    <div className="font-semibold text-slate-900">
                      🔒 Permissions
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Manage who can edit trips, bookings, and docs.
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
                  >
                    <div className="font-semibold text-slate-900">
                      ⚙️ Workspace Settings
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Update branding, defaults, and workspace rules.
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== MEMBERS TAB ===== */}
        {activeTab === "members" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.6fr]">
            {/* Member list */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm text-slate-500">Team</div>
                  <div className="text-2xl font-bold tracking-tight">
                    All Members ({members?.length ?? 0})
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {members?.map((m) => {
                  const displayName =
                    m.user?.name ?? m.user?.email ?? "Unknown";
                  const initials = displayName
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  const isOwner = m.role === "OWNER";
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">
                          {displayName}
                        </div>
                        {m.user?.email && displayName !== m.user.email && (
                          <div className="text-xs text-slate-400">
                            {m.user.email}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {isOwner ? (
                          <span className="rounded-full px-3 py-1 text-xs font-semibold bg-amber-100 text-amber-800">
                            Owner
                          </span>
                        ) : (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              updateMemberRole.mutate({
                                memberId: m.id,
                                role: e.target.value as WorkspaceRole,
                              })
                            }
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        )}

                        {!isOwner && (
                          <button
                            onClick={() => removeMember.mutate(m.id)}
                            className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invite form */}
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Invite</div>
                <div className="text-2xl font-bold tracking-tight">
                  Add a Teammate
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Invite by email. They must have a TripOps account.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@company.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Role
                    </label>
                    <select
                      value={inviteRole}
                      onChange={(e) =>
                        setInviteRole(e.target.value as WorkspaceRole)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MEMBER">Member</option>
                      <option value="GUEST">Guest</option>
                    </select>
                  </div>

                  {inviteError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                      {inviteError}
                    </div>
                  )}

                  {inviteMember.isSuccess && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                      Member invited successfully!
                    </div>
                  )}

                  <button
                    onClick={handleInvite}
                    disabled={inviteMember.isPending || !inviteEmail.trim()}
                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {inviteMember.isPending ? "Inviting…" : "Send Invitation"}
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Role descriptions</div>
                <div className="mt-3 space-y-3">
                  {[
                    {
                      role: "Admin",
                      desc: "Can manage trips, bookings, members, and workspace settings.",
                    },
                    {
                      role: "Member",
                      desc: "Can create and edit trips and bookings.",
                    },
                    {
                      role: "Guest",
                      desc: "Can view trips and bookings. Read-only access.",
                    },
                  ].map((r) => (
                    <div
                      key={r.role}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="font-semibold text-sm text-slate-900">
                        {r.role}
                      </div>
                      <div className="text-xs text-slate-500">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PERMISSIONS TAB ===== */}
        {activeTab === "permissions" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm text-slate-500">Access Matrix</div>
              <div className="text-2xl font-bold tracking-tight">
                Permission Levels
              </div>
              <p className="mt-2 text-sm text-slate-500">
                What each role can do in this workspace.
              </p>

              <div className="mt-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left text-slate-500 font-medium">
                        Action
                      </th>
                      <th className="pb-3 text-center text-slate-500 font-medium">
                        Owner
                      </th>
                      <th className="pb-3 text-center text-slate-500 font-medium">
                        Admin
                      </th>
                      <th className="pb-3 text-center text-slate-500 font-medium">
                        Member
                      </th>
                      <th className="pb-3 text-center text-slate-500 font-medium">
                        Guest
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      {
                        action: "Manage workspace settings",
                        perms: [true, true, false, false],
                      },
                      {
                        action: "Invite / remove members",
                        perms: [true, true, false, false],
                      },
                      {
                        action: "Change member roles",
                        perms: [true, false, false, false],
                      },
                      {
                        action: "Create & edit trips",
                        perms: [true, true, true, false],
                      },
                      {
                        action: "Manage bookings",
                        perms: [true, true, true, false],
                      },
                      {
                        action: "Upload documents",
                        perms: [true, true, true, false],
                      },
                      {
                        action: "Delete documents",
                        perms: [true, true, false, false],
                      },
                      {
                        action: "View trips & bookings",
                        perms: [true, true, true, true],
                      },
                      {
                        action: "Post comments",
                        perms: [true, true, true, true],
                      },
                    ].map((row) => (
                      <tr key={row.action}>
                        <td className="py-3 text-slate-700">{row.action}</td>
                        {row.perms.map((allowed, i) => (
                          <td key={i} className="py-3 text-center">
                            {allowed ? (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs">
                                —
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Current members by role */}
            <div className="space-y-5">
              {(["OWNER", "ADMIN", "MEMBER", "GUEST"] as const).map((role) => {
                const roleMembers = members?.filter((m) => m.role === role);
                if (!roleMembers || roleMembers.length === 0) return null;
                return (
                  <div
                    key={role}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadge[role]}`}
                      >
                        {role}
                      </span>
                      <span className="text-sm text-slate-400">
                        {roleMembers.length} member
                        {roleMembers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {roleMembers.map((m) => {
                        const name = m.user?.name ?? m.user?.email ?? "Unknown";
                        return (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                              {name
                                .split(" ")
                                .map((w) => w[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-slate-900">
                              {name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.8fr]">
            {/* Workspace branding */}
            <div className="space-y-6">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Branding</div>
                <div className="text-2xl font-bold tracking-tight">
                  Workspace Details
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Update the display name and description for this workspace.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Workspace name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {settingsSaved && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                      Workspace updated successfully!
                    </div>
                  )}

                  <button
                    onClick={handleSaveSettings}
                    disabled={updateWorkspace.isPending}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
                  >
                    {updateWorkspace.isPending ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Trip rules */}
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Trip Rules</div>
                <div className="text-2xl font-bold tracking-tight">
                  Active Rules
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Rules configured for the active trip. Toggle rules on/off.
                </p>

                <div className="mt-5 space-y-3">
                  {!ruleSet?.ruleSet?.rules?.length && (
                    <div className="text-sm text-slate-400 text-center py-6 rounded-2xl border border-dashed border-slate-200">
                      No rules configured for this trip yet.
                    </div>
                  )}
                  {ruleSet?.ruleSet?.rules?.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {rule.type.replace(/_/g, " ")}
                        </div>
                        {rule.note && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {rule.note}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!ruleSet) return;
                          const rs = ruleSet.ruleSet;
                          const updatedRules = rs.rules.map((r) =>
                            r.id === rule.id
                              ? { ...r, enabled: !r.enabled }
                              : r,
                          );
                          upsertRules.mutate({
                            name: rs.name,
                            isActive: rs.isActive,
                            rules: updatedRules.map((r) => ({
                              type: r.type,
                              enabled: r.enabled,
                              params: r.params,
                              note: r.note,
                            })),
                          });
                        }}
                        className={[
                          "h-7 w-12 rounded-full p-1 transition",
                          rule.enabled ? "bg-blue-600" : "bg-slate-300",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "h-5 w-5 rounded-full bg-white transition",
                            rule.enabled ? "translate-x-5" : "translate-x-0",
                          ].join(" ")}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Defaults & info */}
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-sm text-slate-500">Defaults</div>
                <div className="text-2xl font-bold tracking-tight">
                  Workspace Info
                </div>
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      Created
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {workspace?.createdAt
                        ? new Date(workspace.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "—"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      Total Trips
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {trips?.length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      Total Members
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {members?.length ?? 0}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      Owner
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {members?.find((m) => m.role === "OWNER")?.user?.name ??
                        "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
