"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/lib/api/bookings";
import type { Booking } from "@/types/booking";
import { qk } from "@/lib/query-keys";

export function useBookings(tripId: string) {
  return useQuery({
    queryKey: qk.trips.bookings(tripId),
    queryFn: () => bookingsApi.list(tripId),
    enabled: !!tripId,
  });
}

export function useBooking(tripId: string, bookingId: string) {
  return useQuery({
    queryKey: [...qk.trips.bookings(tripId), bookingId],
    queryFn: () => bookingsApi.get(tripId, bookingId),
    enabled: !!tripId && !!bookingId,
  });
}

export function useCreateBooking(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (
      body: Partial<Booking> & { type: string; providerName: string },
    ) => bookingsApi.create(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.bookings(tripId) });
    },
  });
}

export function useUpdateBooking(tripId: string, bookingId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: Partial<Booking>) =>
      bookingsApi.update(tripId, bookingId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.bookings(tripId) });
    },
  });
}

export function useAttachBookingToItem(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: { bookingId: string; itineraryItemId: string }) =>
      bookingsApi.attachToItem(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.bookings(tripId) });
      qc.invalidateQueries({ queryKey: qk.trips.itinerary(tripId) });
    },
  });
}
