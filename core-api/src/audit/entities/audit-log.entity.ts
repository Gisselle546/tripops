import { Entity, Column, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';

export enum AuditAction {
  // Workspace / Trip
  WORKSPACE_CREATED = 'WORKSPACE_CREATED',
  TRIP_CREATED = 'TRIP_CREATED',

  // Itinerary
  ITINERARY_DAY_CREATED = 'ITINERARY_DAY_CREATED',
  ITINERARY_ITEM_CREATED = 'ITINERARY_ITEM_CREATED',
  ITINERARY_ITEM_UPDATED = 'ITINERARY_ITEM_UPDATED',
  ITINERARY_ITEM_DELETED = 'ITINERARY_ITEM_DELETED',

  // Collab
  COMMENT_CREATED = 'COMMENT_CREATED',
  PROPOSAL_CREATED = 'PROPOSAL_CREATED',
  PROPOSAL_OPTION_CREATED = 'PROPOSAL_OPTION_CREATED',
  VOTE_TOGGLED = 'VOTE_TOGGLED',

  // Rules
  RULESET_UPSERTED = 'RULESET_UPSERTED',
  RULES_EVALUATED = 'RULES_EVALUATED',

  // Bookings
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  BOOKING_ATTACHED_TO_ITEM = 'BOOKING_ATTACHED_TO_ITEM',

  // Rebooking
  DISRUPTION_SIMULATED = 'DISRUPTION_SIMULATED',
  REBOOKING_OPTIONS_GENERATED = 'REBOOKING_OPTIONS_GENERATED',
  REBOOKING_DECIDED = 'REBOOKING_DECIDED',
  REBOOKING_APPLIED = 'REBOOKING_APPLIED',
}

@Entity('audit_logs')
export class AuditLog extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  // Optional scope (workspace-level actions can still set tripId = workspaceId or create separate workspace audit later)
  @Index()
  @Column({ nullable: true })
  workspaceId?: string;

  @Index()
  @Column()
  actorUserId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  // What object was touched
  @Column({ nullable: true })
  targetType?: string; // e.g. "Booking", "ItineraryItem"

  @Index()
  @Column({ nullable: true })
  targetId?: string;

  // small JSON payload describing what happened (never store secrets)
  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  // request correlation (optional)
  @Index()
  @Column({ nullable: true })
  correlationId?: string;
}
