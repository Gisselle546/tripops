export type DisruptionType = "DELAY" | "CANCELLATION" | "CHANGE";
export type RebookingCaseStatus = "OPEN" | "DECIDED" | "APPLIED";

export interface RebookingCase {
  id: string;
  tripId: string;
  bookingId: string;
  disruptionEventId: string;
  status: RebookingCaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RebookingOption {
  id: string;
  rebookingCaseId: string;
  description: string;
  estimatedCost?: number | null;
  score: number;
  createdAt: string;
}

export interface RebookingDecision {
  chosenOptionId?: string | null;
  notes?: string | null;
  decidedAt: string;
}

export interface RebookingCaseDetail {
  case: RebookingCase;
  options: RebookingOption[];
  decision: RebookingDecision | null;
}
