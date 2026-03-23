"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspacesApi } from "@/lib/api/workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { qk } from "@/lib/query-keys";
import type { WorkspaceRole } from "@/types/workspace";

// List all workspaces the current user belongs to
export function useWorkspaces() {
  return useQuery({
    queryKey: qk.workspaces.all(),
    queryFn: () => workspacesApi.list(),
  });
}

// Get a single workspace by ID
export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: qk.workspaces.detail(workspaceId),
    queryFn: () => workspacesApi.get(workspaceId),
    enabled: !!workspaceId,
  });
}

// Create a new workspace, then set it as active
export function useCreateWorkspace() {
  const qc = useQueryClient();
  const { setActiveWorkspace } = useWorkspaceStore();

  return useMutation({
    mutationFn: workspacesApi.create,
    onSuccess: (workspace) => {
      qc.invalidateQueries({ queryKey: qk.workspaces.all() });
      setActiveWorkspace(workspace.id);
    },
  });
}

// Update a workspace
export function useUpdateWorkspace(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      name?: string;
      description?: string;
      coverImage?: string;
    }) => workspacesApi.update(workspaceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workspaces.detail(workspaceId) });
      qc.invalidateQueries({ queryKey: qk.workspaces.all() });
    },
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: qk.workspaces.members(workspaceId),
    queryFn: () => workspacesApi.listMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

// Invite a member by email
export function useInviteMember(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: { email: string; role?: WorkspaceRole }) =>
      workspacesApi.inviteMember(workspaceId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workspaces.members(workspaceId) });
    },
  });
}

// Update a member's role
export function useUpdateMemberRole(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: WorkspaceRole;
    }) => workspacesApi.updateMemberRole(workspaceId, memberId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workspaces.members(workspaceId) });
    },
  });
}

// Remove a member
export function useRemoveMember(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      workspacesApi.removeMember(workspaceId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.workspaces.members(workspaceId) });
    },
  });
}
