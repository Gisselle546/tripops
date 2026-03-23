export type AuditAction =
  | "WORKSPACE_CREATED"
  | "TRIP_CREATED"
  | "ITINERARY_DAY_CREATED"
  | "ITINERARY_ITEM_CREATED"
  | "ITINERARY_ITEM_UPDATED"
  | "ITINERARY_ITEM_DELETED"
  | "COMMENT_CREATED"
  | "PROPOSAL_CREATED"
  | "PROPOSAL_OPTION_CREATED"
  | "VOTE_TOGGLED"
  | "RULESET_UPSERTED"
  | "RULES_EVALUATED"
  | "BOOKING_CREATED"
  | "BOOKING_UPDATED"
  | "BOOKING_ATTACHED_TO_ITEM"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "TASK_COMPLETED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_UPDATED"
  | "DOCUMENT_DELETED"
  | "DISRUPTION_SIMULATED"
  | "REBOOKING_OPTIONS_GENERATED"
  | "REBOOKING_DECIDED"
  | "REBOOKING_APPLIED";

export interface AuditLog {
  id: string;
  tripId: string;
  workspaceId?: string;
  actorUserId: string;
  action: AuditAction; // FIX: was "action: string"
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  correlationId?: string; // FIX: was missing
  createdAt: string;
}
