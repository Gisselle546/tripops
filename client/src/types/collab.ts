export interface Comment {
  id: string;
  tripId: string;
  body: string;
  authorUserId: string;
  itineraryItemId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = "OPEN" | "DECIDED";

export interface ProposalOption {
  id: string;
  proposalId: string;
  label: string;
  details?: string | null;
  url?: string | null;
  estimatedCost?: number | null;
  voteCount: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  tripId: string;
  title: string;
  description?: string | null;
  status: ProposalStatus;
  winnerId?: string | null;
  options: ProposalOption[];
  createdAt: string;
  updatedAt: string;
}
