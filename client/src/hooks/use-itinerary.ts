"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { itineraryApi } from "@/lib/api/itinerary";
import type { ItineraryItem } from "@/types/itinerary";
import { qk } from "@/lib/query-keys";

export function useItinerary(tripId: string) {
  return useQuery({
    queryKey: qk.trips.itinerary(tripId),
    queryFn: () => itineraryApi.get(tripId),
    enabled: !!tripId,
  });
}

export function useCreateDay(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: { date: string; dayIndex?: number }) =>
      itineraryApi.createDay(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.itinerary(tripId) });
    },
  });
}

export function useCreateItineraryItem(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      body: Partial<ItineraryItem> & { type: string; title: string },
    ) => itineraryApi.createItem(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.itinerary(tripId) });
    },
  });
}

export function useUpdateItineraryItem(tripId: string, itemId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<ItineraryItem>) =>
      itineraryApi.updateItem(tripId, itemId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.itinerary(tripId) });
    },
  });
}

export function useDeleteItineraryItem(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itineraryApi.deleteItem(tripId, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.itinerary(tripId) });
    },
  });
}
