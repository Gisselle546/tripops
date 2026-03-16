// ─── Domain Event Types ──────────────────────────────────────────────
// Central registry of all domain events emitted through the outbox.
// Each constant is used as both the outbox `type` column and the
// NestJS EventEmitter event name that handlers subscribe to.

export const DomainEvents = {
  // Trips
  TRIP_CREATED: 'trip.created',

  // Itinerary
  ITINERARY_DAY_CREATED: 'itinerary.day.created',
  ITINERARY_ITEM_CREATED: 'itinerary.item.created',
  ITINERARY_ITEM_UPDATED: 'itinerary.item.updated',
  ITINERARY_ITEM_DELETED: 'itinerary.item.deleted',

  // Bookings
  BOOKING_CREATED: 'booking.created',
  BOOKING_UPDATED: 'booking.updated',
  BOOKING_ATTACHED: 'booking.attached',

  // Collab
  COMMENT_CREATED: 'collab.comment.created',
  PROPOSAL_CREATED: 'collab.proposal.created',
  PROPOSAL_OPTION_CREATED: 'collab.proposal_option.created',
  VOTE_TOGGLED: 'collab.vote.toggled',

  // Rules
  RULESET_UPSERTED: 'rules.ruleset.upserted',
  RULES_EVALUATED: 'rules.evaluated',

  // Rebooking
  DISRUPTION_SIMULATED: 'rebooking.disruption.simulated',
  REBOOKING_OPTIONS_GENERATED: 'rebooking.options.generated',
  REBOOKING_DECIDED: 'rebooking.decided',
  REBOOKING_APPLIED: 'rebooking.applied',
} as const;

export type DomainEventType = (typeof DomainEvents)[keyof typeof DomainEvents];

// ─── Payload Interface ───────────────────────────────────────────────

export interface DomainEventPayload {
  /** The domain event type */
  type: DomainEventType;
  /** The aggregate root id (tripId, bookingId, etc.) */
  aggregateId: string;
  /** The aggregate root type */
  aggregateType: string;
  /** Arbitrary event-specific data */
  data: Record<string, any>;
  /** The user who triggered the action */
  actorUserId: string;
  /** Optional trip context */
  tripId?: string;
  /** Optional workspace context */
  workspaceId?: string;
  /** Optional correlation id */
  correlationId?: string;
}
