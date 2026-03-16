"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { qk } from "@/lib/query-keys";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      qc.invalidateQueries({ queryKey: qk.user.me() });
      router.replace("/workspaces");
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ accessToken, user }) => {
      setAuth(accessToken, user);
      router.replace("/workspaces");
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      qc.clear();
      router.replace("/login");
    },
  });
}
