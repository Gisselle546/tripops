import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { DomainEvents } from '../events/domain-events';
import type { DomainEventPayload } from '../events/domain-events';
import { NotificationsService } from './notifications.service';
import { NotificationType } from './entities/notification.entity';

/**
 * Subscribes to domain events and creates the appropriate in-app
 * notifications.  Each handler is fire-and-forget – failures are
 * logged but never block the request path.
 */
@Injectable()
export class NotificationEventsHandler {
  private readonly logger = new Logger(NotificationEventsHandler.name);

  constructor(private readonly notifications: NotificationsService) {}

  // ── Trip Created ───────────────────────────────────────────────────
  @OnEvent(DomainEvents.TRIP_CREATED)
  async onTripCreated(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.TRIP_CREATED,
          title: `New trip created: ${event.data.title ?? 'Untitled'}`,
          link: `/trips/${event.aggregateId}`,
        },
      );
    } catch (err) {
      this.logger.error('onTripCreated notification failed', err.stack);
    }
  }

  // ── Comment Created (+ @mention detection) ────────────────────────
  @OnEvent(DomainEvents.COMMENT_CREATED)
  async onCommentCreated(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.COMMENT,
          title: 'New comment on your trip',
          body: this.truncate(event.data.body, 120),
          link: `/trips/${event.tripId}/comments`,
        },
      );

      // Mention detection: look for @<userId> patterns
      const mentions = this.extractMentions(event.data.body);
      for (const mentionedUserId of mentions) {
        if (mentionedUserId === event.actorUserId) continue;
        await this.notifications.create({
          recipientUserId: mentionedUserId,
          type: NotificationType.MENTION,
          title: 'You were mentioned in a comment',
          body: this.truncate(event.data.body, 120),
          link: `/trips/${event.tripId}/comments`,
          tripId: event.tripId,
          actorUserId: event.actorUserId,
        });
      }
    } catch (err) {
      this.logger.error('onCommentCreated notification failed', err.stack);
    }
  }

  // ── Proposal Created ──────────────────────────────────────────────
  @OnEvent(DomainEvents.PROPOSAL_CREATED)
  async onProposalCreated(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.PROPOSAL,
          title: `New proposal: ${event.data.title ?? 'Untitled'}`,
          link: `/trips/${event.tripId}/proposals`,
        },
      );
    } catch (err) {
      this.logger.error('onProposalCreated notification failed', err.stack);
    }
  }

  // ── Vote Toggled ──────────────────────────────────────────────────
  @OnEvent(DomainEvents.VOTE_TOGGLED)
  async onVoteToggled(event: DomainEventPayload) {
    try {
      if (event.data.action === 'removed') return; // only notify on cast
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.VOTE,
          title: 'Someone voted on a proposal',
          link: `/trips/${event.tripId}/proposals`,
        },
      );
    } catch (err) {
      this.logger.error('onVoteToggled notification failed', err.stack);
    }
  }

  // ── Booking Updated ───────────────────────────────────────────────
  @OnEvent(DomainEvents.BOOKING_UPDATED)
  async onBookingUpdated(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.BOOKING_UPDATED,
          title: 'A booking was updated',
          link: `/trips/${event.tripId}/bookings/${event.aggregateId}`,
        },
      );
    } catch (err) {
      this.logger.error('onBookingUpdated notification failed', err.stack);
    }
  }

  // ── Rebooking Options Ready ───────────────────────────────────────
  @OnEvent(DomainEvents.REBOOKING_OPTIONS_GENERATED)
  async onRebookingOptionsReady(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.REBOOKING_OPTIONS_READY,
          title: 'Rebooking options are ready for review',
          link: `/trips/${event.tripId}/rebooking/cases/${event.data.caseId}`,
        },
      );
    } catch (err) {
      this.logger.error(
        'onRebookingOptionsReady notification failed',
        err.stack,
      );
    }
  }

  // ── Rebooking Decided ─────────────────────────────────────────────
  @OnEvent(DomainEvents.REBOOKING_DECIDED)
  async onRebookingDecided(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.REBOOKING_DECIDED,
          title: 'A rebooking decision has been made',
          link: `/trips/${event.tripId}/rebooking/cases/${event.data.caseId}`,
        },
      );
    } catch (err) {
      this.logger.error('onRebookingDecided notification failed', err.stack);
    }
  }

  // ── Rebooking Applied ─────────────────────────────────────────────
  @OnEvent(DomainEvents.REBOOKING_APPLIED)
  async onRebookingApplied(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.REBOOKING_APPLIED,
          title: 'Rebooking has been applied to your booking',
          link: `/trips/${event.tripId}/rebooking/cases/${event.data.caseId}`,
        },
      );
    } catch (err) {
      this.logger.error('onRebookingApplied notification failed', err.stack);
    }
  }

  // ── Itinerary Changes ─────────────────────────────────────────────
  @OnEvent(DomainEvents.ITINERARY_ITEM_CREATED)
  async onItineraryItemCreated(event: DomainEventPayload) {
    try {
      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.ITINERARY_UPDATED,
          title: `New itinerary item: ${event.data.title ?? 'Untitled'}`,
          link: `/trips/${event.tripId}/itinerary`,
        },
      );
    } catch (err) {
      this.logger.error(
        'onItineraryItemCreated notification failed',
        err.stack,
      );
    }
  }

  // ── Rules violation ────────────────────────────────────────────────
  @OnEvent(DomainEvents.RULES_EVALUATED)
  async onRulesEvaluated(event: DomainEventPayload) {
    try {
      const violations = event.data.results?.filter(
        (r: any) => r.passed === false,
      );
      if (!violations?.length) return;

      await this.notifications.notifyTripMembers(
        event.tripId!,
        event.actorUserId,
        {
          type: NotificationType.RULES_VIOLATION,
          title: `${violations.length} rule violation(s) detected`,
          body: violations.map((v: any) => v.message).join('; '),
          link: `/trips/${event.tripId}/rules`,
          meta: { violations },
        },
      );
    } catch (err) {
      this.logger.error('onRulesEvaluated notification failed', err.stack);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────
  private truncate(text: string | undefined, max: number): string {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  /** Extract @<uuid> mentions from a comment body */
  private extractMentions(body?: string): string[] {
    if (!body) return [];
    const regex =
      /@([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
    const matches = body.matchAll(regex);
    return [...new Set([...matches].map((m) => m[1]))];
  }
}
