"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tripsApi, type CreateTripBody } from "@/lib/api/trips";
import { useTripStore } from "@/stores/trip-store";
import { qk } from "@/lib/query-keys";

// List trips in a workspace
export function useTrips(workspaceId: string) {
  return useQuery({
    queryKey: qk.workspaces.trips(workspaceId),
    queryFn: () => tripsApi.list(workspaceId),
    enabled: !!workspaceId,
  });
}

// Get a single trip
export function useTrip(tripId: string) {
  return useQuery({
    queryKey: qk.trips.detail(tripId),
    queryFn: () => tripsApi.get(tripId),
    enabled: !!tripId,
  });
}

// Create a trip, then set it as the active trip
export function useCreateTrip(workspaceId: string) {
  const qc = useQueryClient();
  const { setActiveTrip } = useTripStore();

  return useMutation({
    mutationFn: (body: CreateTripBody) => tripsApi.create(workspaceId, body),
    onSuccess: (trip) => {
      qc.invalidateQueries({ queryKey: qk.workspaces.trips(workspaceId) });
      setActiveTrip(trip.id);
    },
  });
}

export function useTripMembers(tripId: string) {
  return useQuery({
    queryKey: qk.trips.members(tripId),
    queryFn: () => tripsApi.listMembers(tripId),
    enabled: !!tripId,
  });
}
