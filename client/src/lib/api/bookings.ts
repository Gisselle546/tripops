import { apiClient } from "./client";
import type { Booking } from "@/types/booking";
import type { AxiosResponse } from "axios";

export const bookingsApi = {
  create: (
    tripId: string,
    body: Partial<Booking> & { type: string; providerName: string },
  ) =>
    apiClient
      .post<Booking>(`/trips/${tripId}/bookings`, body)
      .then((r: AxiosResponse<Booking>) => r.data),

  list: (tripId: string) =>
    apiClient
      .get<Booking[]>(`/trips/${tripId}/bookings`)
      .then((r: AxiosResponse<Booking[]>) => r.data),

  get: (tripId: string, bookingId: string) =>
    apiClient
      .get<Booking>(`/trips/${tripId}/bookings/${bookingId}`)
      .then((r: AxiosResponse<Booking>) => r.data),

  update: (tripId: string, bookingId: string, body: Partial<Booking>) =>
    apiClient
      .patch<Booking>(`/trips/${tripId}/bookings/${bookingId}`, body)
      .then((r: AxiosResponse<Booking>) => r.data),

  attachToItem: (
    tripId: string,
    body: { bookingId: string; itineraryItemId: string },
  ) =>
    apiClient
      .post(`/trips/${tripId}/bookings/attach-to-item`, body)
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
