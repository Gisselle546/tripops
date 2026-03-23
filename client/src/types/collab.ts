export interface Comment {
  id: string;
  tripId: string;
  itineraryItemId?: string | null;
  body: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = "OPEN" | "CLOSED";

export interface ProposalOption {
  id: string;
  proposalId: string;
  label: string;
  details?: string | null;
  url?: string | null;
  estimatedCost?: number | null;
  createdByUserId: string;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  tripId: string;
  title: string;
  description?: string | null;
  status: ProposalStatus;
  createdByUserId: string;
  options: ProposalOption[];
  createdAt: string;
  updatedAt: string;
}
