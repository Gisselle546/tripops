import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';
import { Trip } from '../trips/entities/trip.entity';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,

    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,

    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,

    @InjectRepository(Trip)
    private readonly tripsRepo: Repository<Trip>,
  ) {}

  // ─── Outbox Processor ──────────────────────────────────────────────
  // Poll every 5 seconds for pending outbox events.
  @Cron('*/5 * * * * *', { name: 'outbox-processor' })
  async processOutbox() {
    try {
      const processed = await this.eventsService.processPendingEvents(50);
      if (processed > 0) {
        this.logger.debug(`Outbox: processed ${processed} event(s)`);
      }
    } catch (err) {
      this.logger.error('Outbox processor error', err.stack);
    }
  }

  // ─── Retry Failed Outbox Events ────────────────────────────────────
  // Every 2 minutes, retry events that previously failed (up to 5 retries).
  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'outbox-retry' })
  async retryFailedOutbox() {
    try {
      const retried = await this.eventsService.retryFailedEvents(5, 20);
      if (retried > 0) {
        this.logger.log(`Outbox: re-queued ${retried} failed event(s)`);
      }
    } catch (err) {
      this.logger.error('Outbox retry error', err.stack);
    }
  }

  // ─── Outbox Cleanup ────────────────────────────────────────────────
  // Daily: delete delivered events older than 30 days.
  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: 'outbox-cleanup' })
  async cleanupOutbox() {
    try {
      const deleted = await this.eventsService.cleanupDeliveredEvents(30);
      if (deleted > 0) {
        this.logger.log(`Outbox cleanup: removed ${deleted} old event(s)`);
      }
    } catch (err) {
      this.logger.error('Outbox cleanup error', err.stack);
    }
  }

  // ─── Travel Reminders ──────────────────────────────────────────────
  // Runs every day at 9 AM – notifies trip members of trips starting tomorrow.
  @Cron(CronExpression.EVERY_DAY_AT_9AM, { name: 'travel-reminders' })
  async sendTravelReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

      const trips = await this.tripsRepo
        .createQueryBuilder('t')
        .where('t."startDate" = :dateStr', { dateStr })
        .getMany();

      for (const trip of trips) {
        const members = await this.tripMembersRepo.find({
          where: { tripId: trip.id, status: TripMemberStatus.ACTIVE },
        });

        for (const member of members) {
          await this.notificationsService.create({
            recipientUserId: member.userId,
            type: NotificationType.REMINDER,
            title: `Tomorrow you travel! ✈️ ${trip.title}`,
            body: `Your trip to ${trip.destination} starts tomorrow.`,
            link: `/trips/${trip.id}`,
            tripId: trip.id,
          });
        }

        this.logger.log(
          `Sent travel reminders for trip "${trip.title}" to ${members.length} member(s)`,
        );
      }
    } catch (err) {
      this.logger.error('Travel reminders error', err.stack);
    }
  }

  // ─── Upcoming Booking Reminders ────────────────────────────────────
  // Runs every day at 8 AM – notifies about bookings in the next 24 hours.
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'booking-reminders' })
  async sendBookingReminders() {
    try {
      const now = new Date();
      const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const bookings = await this.bookingsRepo
        .createQueryBuilder('b')
        .where('b.status = :status', { status: BookingStatus.CONFIRMED })
        .andWhere('b."startsAt" >= :now', { now })
        .andWhere('b."startsAt" <= :in24h', { in24h })
        .getMany();

      for (const booking of bookings) {
        const members = await this.tripMembersRepo.find({
          where: { tripId: booking.tripId, status: TripMemberStatus.ACTIVE },
        });

        for (const member of members) {
          await this.notificationsService.create({
            recipientUserId: member.userId,
            type: NotificationType.REMINDER,
            title: `Upcoming: ${booking.providerName}`,
            body: `Your ${booking.type.toLowerCase()} booking starts within 24 hours.`,
            link: `/trips/${booking.tripId}/bookings/${booking.id}`,
            tripId: booking.tripId,
          });
        }
      }

      if (bookings.length > 0) {
        this.logger.log(
          `Sent booking reminders for ${bookings.length} upcoming booking(s)`,
        );
      }
    } catch (err) {
      this.logger.error('Booking reminders error', err.stack);
    }
  }

  // ─── Price Check Polling (Stub) ────────────────────────────────────
  // Every 6 hours: placeholder for future external API integration.
  @Cron(CronExpression.EVERY_6_HOURS, { name: 'price-check' })
  async pollPriceChanges() {
    try {
      // Future: query external APIs for price changes on confirmed bookings.
      // For now, just log that the job ran.
      this.logger.debug(
        'Price check polling ran (no-op until external APIs are integrated)',
      );
    } catch (err) {
      this.logger.error('Price check polling error', err.stack);
    }
  }

  // ─── Stale Notification Cleanup ────────────────────────────────────
  // Weekly: remove read notifications older than 90 days.
  @Cron(CronExpression.EVERY_WEEK, { name: 'notification-cleanup' })
  async cleanupOldNotifications() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);

      const { affected } = await this.notificationsService['notificationsRepo']
        .createQueryBuilder()
        .delete()
        .where('"read" = true')
        .andWhere('"readAt" < :cutoff', { cutoff })
        .execute();

      if (affected && affected > 0) {
        this.logger.log(
          `Notification cleanup: removed ${affected} old notification(s)`,
        );
      }
    } catch (err) {
      this.logger.error('Notification cleanup error', err.stack);
    }
  }
}
