import { apiClient } from "./client";
import type { AuthResponse, RefreshResponse } from "@/types/auth";
import type { AxiosResponse } from "axios";

export const authApi = {
  register: (body: { email: string; password: string; fullName?: string }) =>
    apiClient
      .post<AuthResponse>("/auth/register", body)
      .then((r: AxiosResponse<AuthResponse>) => r.data),

  login: (body: { email: string; password: string }) =>
    apiClient
      .post<AuthResponse>("/auth/login", body)
      .then((r: AxiosResponse<AuthResponse>) => r.data),

  refresh: () =>
    apiClient
      .post<RefreshResponse>("/auth/refresh")
      .then((r: AxiosResponse<RefreshResponse>) => r.data),

  logout: () =>
    apiClient
      .post<{ ok: true }>("/auth/logout")
      .then((r: AxiosResponse<{ ok: true }>) => r.data),

  me: () =>
    apiClient
      .get<{ userId: string; email: string }>("/auth/me")
      .then((r: AxiosResponse<{ userId: string; email: string }>) => r.data),
};
