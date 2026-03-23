import { apiClient } from "./client";
import type { Comment, Proposal, ProposalOption } from "@/types/collab";
import type { AxiosResponse } from "axios";

export interface CreateCommentBody {
  body: string;
  itineraryItemId?: string;
}

export interface CreateProposalBody {
  title: string;
  description?: string;
}

export interface CreateProposalOptionBody {
  label: string;
  details?: string;
  url?: string;
  estimatedCost?: number;
}

export const collabApi = {
  // Comments — GET /trips/:tripId/comments
  listComments: (tripId: string) =>
    apiClient
      .get<Comment[]>(`/trips/${tripId}/comments`)
      .then((r: AxiosResponse<Comment[]>) => r.data),

  // POST /trips/:tripId/comments
  createComment: (tripId: string, body: CreateCommentBody) =>
    apiClient
      .post<Comment>(`/trips/${tripId}/comments`, body)
      .then((r: AxiosResponse<Comment>) => r.data),

  // Proposals — GET /trips/:tripId/proposals
  listProposals: (tripId: string) =>
    apiClient
      .get<Proposal[]>(`/trips/${tripId}/proposals`)
      .then((r: AxiosResponse<Proposal[]>) => r.data),

  // POST /trips/:tripId/proposals
  createProposal: (tripId: string, body: CreateProposalBody) =>
    apiClient
      .post<Proposal>(`/trips/${tripId}/proposals`, body)
      .then((r: AxiosResponse<Proposal>) => r.data),

  // POST /trips/:tripId/proposals/:proposalId/options
  addOption: (
    tripId: string,
    proposalId: string,
    body: CreateProposalOptionBody,
  ) =>
    apiClient
      .post<ProposalOption>(
        `/trips/${tripId}/proposals/${proposalId}/options`,
        body,
      )
      .then((r: AxiosResponse<ProposalOption>) => r.data),

  // POST /trips/:tripId/options/:optionId/vote  (toggle)
  vote: (tripId: string, optionId: string) =>
    apiClient
      .post<{ ok: true }>(`/trips/${tripId}/options/${optionId}/vote`)
      .then((r: AxiosResponse<{ ok: true }>) => r.data),
};
