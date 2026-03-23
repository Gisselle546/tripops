import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useTripStore } from "./trip-store";

interface WorkspaceState {
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string) => void;
  clearActiveWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      setActiveWorkspace: (id) => {
        set({ activeWorkspaceId: id });
        // Clear trip so subpages don't show stale data from previous workspace
        useTripStore.getState().clearActiveTrip();
      },
      clearActiveWorkspace: () => set({ activeWorkspaceId: null }),
    }),
    {
      name: "tripsops-workspace",
    },
  ),
);
