"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collabApi,
  type CreateCommentBody,
  type CreateProposalBody,
  type CreateProposalOptionBody,
} from "@/lib/api/collab";
import { qk } from "@/lib/query-keys";

// Comments
export function useComments(tripId: string) {
  return useQuery({
    queryKey: qk.trips.comments(tripId),
    queryFn: () => collabApi.listComments(tripId),
    enabled: !!tripId,
  });
}

export function useCreateComment(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentBody) =>
      collabApi.createComment(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.comments(tripId) });
    },
  });
}

// Proposals
export function useProposals(tripId: string) {
  return useQuery({
    queryKey: qk.trips.proposals(tripId),
    queryFn: () => collabApi.listProposals(tripId),
    enabled: !!tripId,
  });
}

export function useCreateProposal(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProposalBody) =>
      collabApi.createProposal(tripId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.proposals(tripId) });
    },
  });
}

export function useAddOption(tripId: string, proposalId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProposalOptionBody) =>
      collabApi.addOption(tripId, proposalId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.proposals(tripId) });
    },
  });
}

// Vote (toggle — call again to unvote)
export function useVote(tripId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (optionId: string) => collabApi.vote(tripId, optionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.trips.proposals(tripId) });
    },
  });
}
