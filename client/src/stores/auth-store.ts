import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,

      setAuth: (accessToken, user) => set({ accessToken, user }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "tripops-auth",
      // Only persist the user object, NOT the token (security)
      // The refresh cookie keeps the session alive instead
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
