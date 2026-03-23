"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rulesApi, type UpsertRuleSetBody } from "@/lib/api/rules";
import { qk } from "@/lib/query-keys";

// Get the rule set for this trip
export function useRuleSet(tripId: string) {
  return useQuery({
    queryKey: qk.trips.rules(tripId),
    queryFn: () => rulesApi.get(tripId),
    enabled: !!tripId,
  });
}

// Replace the rule set (full overwrite)
export function useUpsertRuleSet(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: UpsertRuleSetBody) => rulesApi.upsert(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.rules(tripId) });
    },
  });
}

// Run rules against a single itinerary item
export function useEvaluateItem(tripId: string) {
  return useMutation({
    mutationFn: (itineraryItemId: string) =>
      rulesApi.evaluateItem(tripId, itineraryItemId),
  });
}
