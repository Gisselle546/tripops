import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TripState {
  activeTripId: string | null;
  setActiveTrip: (id: string) => void;
  clearActiveTrip: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      activeTripId: null,
      setActiveTrip: (id) => set({ activeTripId: id }),
      clearActiveTrip: () => set({ activeTripId: null }),
    }),
    {
      name: "trips-ops-trip",
    },
  ),
);
