import { apiClient } from "./client";
import type { Itinerary, ItineraryDay, ItineraryItem } from "@/types/itinerary";
import type { AxiosResponse } from "axios";

export const itineraryApi = {
  get: (tripId: string) =>
    apiClient
      .get<Itinerary>(`/trips/${tripId}/itinerary`)
      .then((r: AxiosResponse<Itinerary>) => r.data),

  createDay: (tripId: string, body: { date: string; dayIndex?: number }) =>
    apiClient
      .post<ItineraryDay>(`/trips/${tripId}/itinerary/days`, body)
      .then((r: AxiosResponse<ItineraryDay>) => r.data),

  createItem: (
    tripId: string,
    body: Partial<ItineraryItem> & { type: string; title: string },
  ) =>
    apiClient
      .post<ItineraryItem>(`/trips/${tripId}/itinerary/items`, body)
      .then((r: AxiosResponse<ItineraryItem>) => r.data),

  updateItem: (tripId: string, itemId: string, body: Partial<ItineraryItem>) =>
    apiClient
      .patch<ItineraryItem>(`/trips/${tripId}/itinerary/items/${itemId}`, body)
      .then((r: AxiosResponse<ItineraryItem>) => r.data),

  deleteItem: (tripId: string, itemId: string) =>
    apiClient
      .delete(`/trips/${tripId}/itinerary/items/${itemId}`)
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
