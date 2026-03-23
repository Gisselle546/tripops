"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  rebookingApi,
  type SimulateDisruptionBody,
  type GenerateOptionsBody,
  type DecideBody,
} from "@/lib/api/rebooking";
import { qk } from "@/lib/query-keys";

// List all rebooking cases for a trip
export function useRebookingCases(tripId: string) {
  return useQuery({
    queryKey: qk.trips.rebooking.cases(tripId),
    queryFn: () => rebookingApi.listCases(tripId),
    enabled: !!tripId,
  });
}

// Get one rebooking case with its options and decision
export function useRebookingCase(tripId: string, caseId: string) {
  return useQuery({
    queryKey: qk.trips.rebooking.case(tripId, caseId),
    queryFn: () => rebookingApi.getCase(tripId, caseId),
    enabled: !!tripId && !!caseId,
  });
}

// Simulate a disruption (creates a new rebooking case)
export function useSimulateDisruption(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: SimulateDisruptionBody) =>
      rebookingApi.simulateDisruption(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.rebooking.cases(tripId) });
    },
  });
}

// Generate AI options for a case
export function useGenerateOptions(tripId: string, caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body?: GenerateOptionsBody) =>
      rebookingApi.generateOptions(tripId, caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.trips.rebooking.case(tripId, caseId),
      });
    },
  });
}

// Record a decision (choose an option)
export function useDecideRebooking(tripId: string, caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: DecideBody) => rebookingApi.decide(tripId, caseId, body),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.trips.rebooking.case(tripId, caseId),
      });
      qc.invalidateQueries({ queryKey: qk.trips.rebooking.cases(tripId) });
    },
  });
}

// Apply the decision (updates the booking)
export function useApplyRebooking(tripId: string, caseId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => rebookingApi.apply(tripId, caseId),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: qk.trips.rebooking.case(tripId, caseId),
      });
      qc.invalidateQueries({ queryKey: qk.trips.rebooking.cases(tripId) });
      qc.invalidateQueries({ queryKey: qk.trips.bookings(tripId) });
    },
  });
}
