"use client";

import { useEffect } from "react";
import { useTripStore } from "@/stores/trip-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTrips } from "@/hooks/use-trips";

/**
 * Returns the current activeTripId.
 * If no trip is selected but the workspace has trips, auto-selects the first one.
 */
export function useActiveTrip() {
  const activeTripId = useTripStore((s) => s.activeTripId);
  const setActiveTrip = useTripStore((s) => s.setActiveTrip);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: trips } = useTrips(activeWorkspaceId ?? "");

  useEffect(() => {
    if (!activeTripId && trips && trips.length > 0) {
      setActiveTrip(trips[0].id);
    }
  }, [activeTripId, trips, setActiveTrip]);

  return activeTripId;
}
