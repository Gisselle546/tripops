import { apiClient } from "./client";
import type { TripDocument } from "@/types/document";
import type { AxiosResponse } from "axios";

export const documentsApi = {
  upload: (tripId: string, formData: FormData) =>
    apiClient
      .post<TripDocument>(`/trips/${tripId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r: AxiosResponse<TripDocument>) => r.data),

  list: (tripId: string) =>
    apiClient
      .get<TripDocument[]>(`/trips/${tripId}/documents`)
      .then((r: AxiosResponse<TripDocument[]>) => r.data),

  get: (tripId: string, docId: string) =>
    apiClient
      .get<TripDocument>(`/trips/${tripId}/documents/${docId}`)
      .then((r: AxiosResponse<TripDocument>) => r.data),

  download: (tripId: string, docId: string) =>
    apiClient
      .get<{
        url: string;
        name: string;
        mimeType: string | null;
      }>(`/trips/${tripId}/documents/${docId}/download`)
      .then(
        (
          r: AxiosResponse<{
            url: string;
            name: string;
            mimeType: string | null;
          }>,
        ) => r.data,
      ),

  update: (tripId: string, docId: string, body: Partial<TripDocument>) =>
    apiClient
      .patch<TripDocument>(`/trips/${tripId}/documents/${docId}`, body)
      .then((r: AxiosResponse<TripDocument>) => r.data),

  delete: (tripId: string, docId: string) =>
    apiClient
      .delete<{ ok: true }>(`/trips/${tripId}/documents/${docId}`)
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
