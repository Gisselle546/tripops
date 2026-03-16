import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth-store";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // ← sends/receives the HttpOnly refresh cookie
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach access token ──────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor — transparent token refresh ──────────────────────
let refreshPromise: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // Deduplicate concurrent refresh calls
      if (!refreshPromise) {
        refreshPromise = apiClient
          .post<{ accessToken: string }>("/auth/refresh")
          .then((res) => {
            const { accessToken } = res.data;
            useAuthStore.getState().setAccessToken(accessToken);
            return accessToken;
          })
          .catch((refreshError) => {
            // Refresh itself failed — session is dead
            useAuthStore.getState().clearAuth();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    }

    return Promise.reject(error);
  },
);
