import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { OutboxEvent, OutboxStatus } from './entities/outbox-event.entity';
import { DomainEventPayload } from './domain-events';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
    private readonly emitter: EventEmitter2,
  ) {}

  // ── Publish ────────────────────────────────────────────────────────
  /**
   * Write an event to the outbox table **and** emit it in-process.
   * The outbox guarantees persistence even if async handlers fail;
   * the in-process emit gives us instant fanout to audit / notifications.
   */
  async publish(event: DomainEventPayload): Promise<OutboxEvent> {
    const record = this.outboxRepo.create({
      type: event.type,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType,
      payload: {
        ...event.data,
        actorUserId: event.actorUserId,
        tripId: event.tripId,
        workspaceId: event.workspaceId,
      },
      correlationId: event.correlationId,
      status: OutboxStatus.PENDING,
    });

    const saved = await this.outboxRepo.save(record);

    // Fire-and-forget in-process: handlers should not throw
    this.emitter.emit(event.type, {
      outboxId: saved.id,
      ...event,
    });

    return saved;
  }

  // ── Outbox Processor (polling) ─────────────────────────────────────
  /**
   * Called by the JobsModule on a short interval. Picks up PENDING events,
   * marks PROCESSING, runs handlers, then marks DELIVERED or FAILED.
   * This is the "at-least-once" guarantee layer.
   */
  async processPendingEvents(batchSize = 25): Promise<number> {
    const pending = await this.outboxRepo.find({
      where: { status: OutboxStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: batchSize,
    });

    if (!pending.length) return 0;

    let processed = 0;

    for (const event of pending) {
      event.status = OutboxStatus.PROCESSING;
      await this.outboxRepo.save(event);

      try {
        // Re-emit so any subscriber that missed the synchronous emit
        // gets another chance (idempotent handlers required).
        await this.emitter.emitAsync(`outbox.${event.type}`, {
          outboxId: event.id,
          type: event.type,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          data: event.payload,
          correlationId: event.correlationId,
        });

        event.status = OutboxStatus.DELIVERED;
        event.processedAt = new Date();
        processed++;
      } catch (err) {
        this.logger.error(
          `Outbox processing failed for event ${event.id}: ${err.message}`,
          err.stack,
        );
        event.status = OutboxStatus.FAILED;
        event.retries += 1;
        event.lastError = err.message;
      }

      await this.outboxRepo.save(event);
    }

    return processed;
  }

  // ── Retry failed events ────────────────────────────────────────────
  async retryFailedEvents(maxRetries = 5, batchSize = 10): Promise<number> {
    const failed = await this.outboxRepo
      .createQueryBuilder('e')
      .where('e.status = :status', { status: OutboxStatus.FAILED })
      .andWhere('e.retries < :maxRetries', { maxRetries })
      .orderBy('e.createdAt', 'ASC')
      .take(batchSize)
      .getMany();

    for (const event of failed) {
      event.status = OutboxStatus.PENDING;
      await this.outboxRepo.save(event);
    }

    return failed.length;
  }

  // ── Cleanup old delivered events ───────────────────────────────────
  async cleanupDeliveredEvents(olderThanDays = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const result = await this.outboxRepo
      .createQueryBuilder()
      .delete()
      .from(OutboxEvent)
      .where('status = :status', { status: OutboxStatus.DELIVERED })
      .andWhere('"processedAt" < :cutoff', { cutoff })
      .execute();

    return result.affected ?? 0;
  }
}
