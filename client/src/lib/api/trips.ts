import { apiClient } from "./client";
import type { Trip } from "@/types/trip";
import type { AxiosResponse } from "axios";

export interface CreateTripBody {
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetTarget?: number;
}

export const tripsApi = {
  create: (workspaceId: string, body: CreateTripBody) =>
    apiClient
      .post<Trip>(`/workspaces/${workspaceId}/trips`, body)
      .then((r: AxiosResponse<Trip>) => r.data),

  list: (workspaceId: string) =>
    apiClient
      .get<Trip[]>(`/workspaces/${workspaceId}/trips`)
      .then((r: AxiosResponse<Trip[]>) => r.data),

  get: (tripId: string) =>
    apiClient
      .get<Trip>(`/trips/${tripId}`)
      .then((r: AxiosResponse<Trip>) => r.data),
};
