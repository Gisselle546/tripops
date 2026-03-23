"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { authApi } from "@/lib/api/auth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function ensureSession() {
      if (accessToken) {
        if (isMounted) setIsCheckingSession(false);
        return;
      }

      try {
        const { accessToken: refreshedToken } = await authApi.refresh();
        useAuthStore.getState().setAccessToken(refreshedToken);
      } catch {
        useAuthStore.getState().clearAuth();
        router.replace("/login");
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    }

    void ensureSession();

    return () => {
      isMounted = false;
    };
  }, [accessToken, router]);

  if (isCheckingSession || !accessToken) {
    return null;
  }

  return <>{children}</>;
}
