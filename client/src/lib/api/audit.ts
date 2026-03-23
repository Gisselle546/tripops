import { apiClient } from "./client";
import type { AuditLog } from "@/types/audit";
import type { AxiosResponse } from "axios";

export const auditApi = {
  // GET /trips/:tripId/audit
  listForTrip: (tripId: string) =>
    apiClient
      .get<AuditLog[]>(`/trips/${tripId}/audit`)
      .then((r: AxiosResponse<AuditLog[]>) => r.data),
};
