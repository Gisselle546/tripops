import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 s — data stays fresh briefly
      retry: (count, error: any) => {
        if (error?.response?.status === 401) return false; // never retry auth errors
        if (error?.response?.status === 404) return false;
        return count < 2;
      },
    },
    mutations: {
      onError: (error: any) => {
        // Global mutation error handler — surfaces API message as toast
        const message =
          error?.response?.data?.message ?? "Something went wrong.";
        console.error("[mutation error]", message);
        // Call your toast.error(message) here
      },
    },
  },
});
