export type DisruptionType = "DELAY" | "CANCELLATION" | "CHANGE";

export interface DisruptionEvent {
  id: string;
  bookingId: string;
  type: DisruptionType;
  description: string;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
}

export type RebookingCaseStatus =
  | "OPEN"
  | "OPTIONS_READY"
  | "DECIDED"
  | "APPLIED"
  | "CANCELED";

export interface RebookingCase {
  id: string;
  tripId: string;
  bookingId: string;
  disruptionEventId: string;
  status: RebookingCaseStatus;
  constraintsSnapshot?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RebookingOption {
  id: string;
  rebookingCaseId: string;
  label: string;
  startsAt?: string;
  endsAt?: string;
  priceDelta: number;
  score: number;
  notes?: {
    warnings?: string[];
    blocks?: string[];
  };
  details?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RebookingDecision {
  id: string;
  rebookingCaseId: string;
  chosenOptionId: string;
  rationale?: string;
  decidedByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RebookingCaseDetail {
  case: RebookingCase;
  options: RebookingOption[];
  decision: RebookingDecision | null;
}
