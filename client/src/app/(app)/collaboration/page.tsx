"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  useComments,
  useCreateComment,
  useProposals,
  useVote,
} from "@/hooks/use-collab";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { useAuditLog } from "@/hooks/use-audit";
import type { AuditAction } from "@/types/audit";

const AUDIT_LABELS: Record<AuditAction, string> = {
  WORKSPACE_CREATED: "created a workspace",
  TRIP_CREATED: "created a trip",
  ITINERARY_DAY_CREATED: "added a day to the itinerary",
  ITINERARY_ITEM_CREATED: "added an itinerary item",
  ITINERARY_ITEM_UPDATED: "updated an itinerary item",
  ITINERARY_ITEM_DELETED: "removed an itinerary item",
  COMMENT_CREATED: "posted a comment",
  PROPOSAL_CREATED: "created a proposal",
  PROPOSAL_OPTION_CREATED: "added a proposal option",
  VOTE_TOGGLED: "voted on a proposal",
  RULESET_UPSERTED: "updated a ruleset",
  RULES_EVALUATED: "evaluated rules",
  BOOKING_CREATED: "created a booking",
  BOOKING_UPDATED: "updated a booking",
  BOOKING_ATTACHED_TO_ITEM: "attached a booking to an item",
  TASK_CREATED: "created a task",
  TASK_UPDATED: "updated a task",
  TASK_DELETED: "deleted a task",
  TASK_COMPLETED: "completed a task",
  DOCUMENT_UPLOADED: "uploaded a document",
  DOCUMENT_UPDATED: "updated a document",
  DOCUMENT_DELETED: "deleted a document",
  DISRUPTION_SIMULATED: "simulated a disruption",
  REBOOKING_OPTIONS_GENERATED: "generated rebooking options",
  REBOOKING_DECIDED: "decided on a rebooking",
  REBOOKING_APPLIED: "applied a rebooking",
};

export default function CollaborationPage() {
  const tripId = useActiveTrip();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const router = useRouter();
  const { data: comments, isLoading: commentsLoading } = useComments(
    tripId ?? "",
  );
  const createComment = useCreateComment(tripId ?? "");
  const { data: proposals, isLoading: proposalsLoading } = useProposals(
    tripId ?? "",
  );
  const vote = useVote(tripId ?? "");
  const { data: auditLogs, isLoading: auditLoading } = useAuditLog(
    tripId ?? "",
  );
  const { data: members } = useWorkspaceMembers(activeWorkspaceId ?? "");

  const [newComment, setNewComment] = useState("");

  // Build userId → display name map from workspace members
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
            Select a trip from the dashboard to collaborate.
          </div>
        </div>
      </div>
    );
  }

  function handlePostComment() {
    const body = newComment.trim();
    if (!body) return;
    createComment.mutate({ body }, { onSuccess: () => setNewComment("") });
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Collaboration
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                People Working on the Trip
              </h1>
              <p className="mt-2 text-slate-500">
                Members, activity, discussion, and proposals in one place.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Invite Member
              </button>
              <Link
                href="/collaboration/new"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
              >
                Start Discussion
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.2fr_0.7fr]">
          {/* Left column: Proposals */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Proposals</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Vote &amp; Decide
                  </div>
                </div>
              </div>

              {proposalsLoading && (
                <div className="mt-5 space-y-3 animate-pulse">
                  <div className="h-20 rounded-2xl bg-slate-100" />
                  <div className="h-20 rounded-2xl bg-slate-100" />
                </div>
              )}

              {!proposalsLoading && proposals?.length === 0 && (
                <div className="mt-5 text-sm text-slate-400 text-center py-6">
                  No proposals yet.
                </div>
              )}

              {!proposalsLoading && (
                <div className="mt-5 space-y-4">
                  {proposals?.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900">
                          {proposal.title}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            proposal.status === "OPEN"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {proposal.status}
                        </span>
                      </div>
                      {proposal.description && (
                        <p className="mt-1 text-sm text-slate-500">
                          {proposal.description}
                        </p>
                      )}
                      <div className="mt-3 space-y-2">
                        {proposal.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {option.label}
                              </div>
                              <div className="text-xs text-slate-400">
                                {option.voteCount} vote
                                {option.voteCount !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <button
                              onClick={() => vote.mutate(option.id)}
                              disabled={vote.isPending}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Vote
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Members */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Members</div>
              <div className="text-2xl font-bold tracking-tight">Trip Team</div>
              <div className="mt-5 space-y-3">
                {members && members.length > 0 ? (
                  members.map((m, i) => {
                    const name = m.user?.name ?? m.user?.email ?? m.userId;
                    const initials = m.user?.name
                      ? m.user.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : m.userId.slice(0, 2).toUpperCase();
                    const statusColors = [
                      "bg-emerald-500",
                      "bg-amber-400",
                      "bg-slate-300",
                    ];
                    const statusLabels = ["Online", "Away", "Offline"];
                    const statusIdx = i % 3;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div className="relative">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                            {initials}
                          </div>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${statusColors[statusIdx]}`}
                            title={statusLabels[statusIdx]}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {name}
                          </div>
                          <div className="text-xs text-slate-400">{m.role}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-400 text-center py-6">
                    No members found.
                  </div>
                )}
              </div>
            </div>

            {/* Mentions */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Notifications</div>
              <div className="text-2xl font-bold tracking-tight">Mentions</div>
              <div className="mt-5 space-y-3">
                {comments && comments.length > 0 ? (
                  comments
                    .filter((c) => c.body.includes("@"))
                    .slice(0, 5)
                    .map((c) => (
                      <div
                        key={`mention-${c.id}`}
                        className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                            {userInitials(c.createdByUserId)}
                          </div>
                          <span className="text-xs font-semibold text-blue-800">
                            {userName(c.createdByUserId)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm text-slate-600 line-clamp-2">
                          {c.body}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-slate-400 text-center py-4">
                    No mentions yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle column: Comments */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Comments</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Discussion Thread
                  </div>
                </div>
              </div>

              {commentsLoading && (
                <div className="mt-5 space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-3xl bg-slate-100" />
                  ))}
                </div>
              )}

              {!commentsLoading && comments?.length === 0 && (
                <div className="mt-5 text-sm text-slate-400 text-center py-6">
                  No comments yet. Start the conversation!
                </div>
              )}

              {!commentsLoading && (
                <div className="mt-5 space-y-4">
                  {comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                          {userInitials(comment.createdByUserId)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="font-semibold text-slate-900 text-sm">
                              {userName(comment.createdByUserId)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {comment.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment form */}
              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Add comment</div>
                <textarea
                  className="mt-3 min-h-30 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none"
                  placeholder="Write an update, ask a question, or mention a teammate..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handlePostComment}
                    disabled={createComment.isPending || !newComment.trim()}
                    className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {createComment.isPending ? "Posting…" : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Activity feed */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Activity feed</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Recent Updates
                  </div>
                </div>
                <button className="text-sm text-blue-600">View all</button>
              </div>

              {auditLoading && (
                <div className="mt-5 space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-100" />
                  ))}
                </div>
              )}

              {!auditLoading && auditLogs?.length === 0 && (
                <div className="mt-5 text-sm text-slate-400 text-center py-6">
                  No activity yet.
                </div>
              )}

              {!auditLoading && (
                <div className="mt-5 space-y-4">
                  {auditLogs?.slice(0, 10).map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 text-xs">
                        {userInitials(log.actorUserId)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold text-slate-900">
                            {userName(log.actorUserId)}
                          </span>{" "}
                          {AUDIT_LABELS[log.action] ?? log.action}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">
                Quick collaboration tools
              </div>
              <div className="text-2xl font-bold tracking-tight">Actions</div>
              <div className="mt-5 grid gap-3">
                {[
                  { label: "Invite teammate", href: "/settings" },
                  { label: "Assign owner", href: "/settings" },
                  {
                    label: "Share update",
                    action: () => {
                      /* scroll to comment form */
                    },
                  },
                  {
                    label: "Open mentions",
                    action: () => {
                      /* already visible on page */
                    },
                  },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => {
                      if ("href" in action && action.href)
                        router.push(action.href);
                    }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-medium text-slate-700 hover:bg-white transition"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
