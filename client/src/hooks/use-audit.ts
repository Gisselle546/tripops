"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api/audit";
import { qk } from "@/lib/query-keys";

export function useAuditLog(tripId: string) {
  return useQuery({
    queryKey: qk.trips.audit(tripId),
    queryFn: () => auditApi.listForTrip(tripId),
    enabled: !!tripId,
  });
}
