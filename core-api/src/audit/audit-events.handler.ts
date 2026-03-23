import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DomainEvents } from '../events/domain-events';
import type { DomainEventPayload } from '../events/domain-events';
import { AuditService } from './audit.service';
import { AuditAction } from './entities/audit-log.entity';

/**
 * Maps domain events → audit log entries.
 * Only critical / "write" actions are logged. Read-only queries are skipped.
 */
@Injectable()
export class AuditEventsHandler {
  private readonly logger = new Logger(AuditEventsHandler.name);

  constructor(private readonly audit: AuditService) {}

  // ── Mapping table: domain event type → AuditAction ─────────────────
  private static readonly EVENT_TO_ACTION: Partial<
    Record<string, AuditAction>
  > = {
    [DomainEvents.TRIP_CREATED]: AuditAction.TRIP_CREATED,

    [DomainEvents.ITINERARY_DAY_CREATED]: AuditAction.ITINERARY_DAY_CREATED,
    [DomainEvents.ITINERARY_ITEM_CREATED]: AuditAction.ITINERARY_ITEM_CREATED,
    [DomainEvents.ITINERARY_ITEM_UPDATED]: AuditAction.ITINERARY_ITEM_UPDATED,
    [DomainEvents.ITINERARY_ITEM_DELETED]: AuditAction.ITINERARY_ITEM_DELETED,

    [DomainEvents.BOOKING_CREATED]: AuditAction.BOOKING_CREATED,
    [DomainEvents.BOOKING_UPDATED]: AuditAction.BOOKING_UPDATED,
    [DomainEvents.BOOKING_ATTACHED]: AuditAction.BOOKING_ATTACHED_TO_ITEM,

    [DomainEvents.COMMENT_CREATED]: AuditAction.COMMENT_CREATED,
    [DomainEvents.PROPOSAL_CREATED]: AuditAction.PROPOSAL_CREATED,
    [DomainEvents.PROPOSAL_OPTION_CREATED]: AuditAction.PROPOSAL_OPTION_CREATED,
    [DomainEvents.VOTE_TOGGLED]: AuditAction.VOTE_TOGGLED,

    [DomainEvents.RULESET_UPSERTED]: AuditAction.RULESET_UPSERTED,
    [DomainEvents.RULES_EVALUATED]: AuditAction.RULES_EVALUATED,

    [DomainEvents.TASK_CREATED]: AuditAction.TASK_CREATED,
    [DomainEvents.TASK_UPDATED]: AuditAction.TASK_UPDATED,
    [DomainEvents.TASK_DELETED]: AuditAction.TASK_DELETED,
    [DomainEvents.TASK_COMPLETED]: AuditAction.TASK_COMPLETED,

    [DomainEvents.DOCUMENT_UPLOADED]: AuditAction.DOCUMENT_UPLOADED,
    [DomainEvents.DOCUMENT_UPDATED]: AuditAction.DOCUMENT_UPDATED,
    [DomainEvents.DOCUMENT_DELETED]: AuditAction.DOCUMENT_DELETED,

    [DomainEvents.DISRUPTION_SIMULATED]: AuditAction.DISRUPTION_SIMULATED,
    [DomainEvents.REBOOKING_OPTIONS_GENERATED]:
      AuditAction.REBOOKING_OPTIONS_GENERATED,
    [DomainEvents.REBOOKING_DECIDED]: AuditAction.REBOOKING_DECIDED,
    [DomainEvents.REBOOKING_APPLIED]: AuditAction.REBOOKING_APPLIED,
  };

  // ── Generic handler ────────────────────────────────────────────────
  // We listen to all domain events via a wildcard-like approach. Each
  // individual @OnEvent below calls this shared method.

  private async writeAuditLog(event: DomainEventPayload) {
    const action = AuditEventsHandler.EVENT_TO_ACTION[event.type];
    if (!action) return; // unmapped event – skip

    try {
      await this.audit.write({
        tripId: event.tripId ?? event.aggregateId,
        workspaceId: event.workspaceId,
        actorUserId: event.actorUserId,
        action,
        targetType: event.aggregateType,
        targetId: event.aggregateId,
        meta: event.data,
        correlationId: event.correlationId,
      });
    } catch (err) {
      this.logger.error(
        `Failed to write audit log for ${event.type}: ${err.message}`,
        err.stack,
      );
    }
  }

  // ── Individual subscriptions ───────────────────────────────────────
  @OnEvent(DomainEvents.TRIP_CREATED)
  async onTripCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.ITINERARY_DAY_CREATED)
  async onItineraryDayCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.ITINERARY_ITEM_CREATED)
  async onItineraryItemCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.ITINERARY_ITEM_UPDATED)
  async onItineraryItemUpdated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.ITINERARY_ITEM_DELETED)
  async onItineraryItemDeleted(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.BOOKING_CREATED)
  async onBookingCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.BOOKING_UPDATED)
  async onBookingUpdated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.BOOKING_ATTACHED)
  async onBookingAttached(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.COMMENT_CREATED)
  async onCommentCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.PROPOSAL_CREATED)
  async onProposalCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.PROPOSAL_OPTION_CREATED)
  async onProposalOptionCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.VOTE_TOGGLED)
  async onVoteToggled(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.RULESET_UPSERTED)
  async onRulesetUpserted(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.RULES_EVALUATED)
  async onRulesEvaluated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.TASK_CREATED)
  async onTaskCreated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.TASK_UPDATED)
  async onTaskUpdated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.TASK_DELETED)
  async onTaskDeleted(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.TASK_COMPLETED)
  async onTaskCompleted(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.DOCUMENT_UPLOADED)
  async onDocumentUploaded(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.DOCUMENT_UPDATED)
  async onDocumentUpdated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.DOCUMENT_DELETED)
  async onDocumentDeleted(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.DISRUPTION_SIMULATED)
  async onDisruptionSimulated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.REBOOKING_OPTIONS_GENERATED)
  async onRebookingOptionsGenerated(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.REBOOKING_DECIDED)
  async onRebookingDecided(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }

  @OnEvent(DomainEvents.REBOOKING_APPLIED)
  async onRebookingApplied(e: DomainEventPayload) {
    await this.writeAuditLog(e);
  }
}
