import { apiClient } from "./client";
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/workspace";
import type { AxiosResponse } from "axios";

export const workspacesApi = {
  create: (body: { name: string; description?: string; coverImage?: string }) =>
    apiClient
      .post<Workspace>("/workspaces", body)
      .then((r: AxiosResponse<Workspace>) => r.data),

  list: () =>
    apiClient
      .get<Workspace[]>("/workspaces")
      .then((r: AxiosResponse<Workspace[]>) => r.data),

  get: (workspaceId: string) =>
    apiClient
      .get<Workspace>(`/workspaces/${workspaceId}`)
      .then((r: AxiosResponse<Workspace>) => r.data),

  update: (
    workspaceId: string,
    body: { name?: string; description?: string; coverImage?: string },
  ) =>
    apiClient
      .patch<Workspace>(`/workspaces/${workspaceId}`, body)
      .then((r: AxiosResponse<Workspace>) => r.data),

  listMembers: (workspaceId: string) =>
    apiClient
      .get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`)
      .then((r: AxiosResponse<WorkspaceMember[]>) => r.data),

  inviteMember: (
    workspaceId: string,
    body: { email: string; role?: WorkspaceRole },
  ) =>
    apiClient
      .post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, body)
      .then((r: AxiosResponse<WorkspaceMember>) => r.data),

  updateMemberRole: (
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ) =>
    apiClient
      .patch<WorkspaceMember>(
        `/workspaces/${workspaceId}/members/${memberId}/role`,
        { role },
      )
      .then((r: AxiosResponse<WorkspaceMember>) => r.data),

  removeMember: (workspaceId: string, memberId: string) =>
    apiClient
      .delete<{ ok: true }>(`/workspaces/${workspaceId}/members/${memberId}`)
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
