import { apiClient } from "./client";
import type { Workspace } from "@/types/workspace";
import type { AxiosResponse } from "axios";

export const workspacesApi = {
  create: (body: { name: string; description?: string }) =>
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
};
