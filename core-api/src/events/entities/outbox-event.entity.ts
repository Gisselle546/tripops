import { Entity, Column, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';

export enum OutboxStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
}

@Entity('outbox_events')
export class OutboxEvent extends AppBaseEntity {
  /** Fully-qualified domain event type, e.g. "trip.created" */
  @Index()
  @Column({ length: 120 })
  type: string;

  /** Aggregate root id (tripId, bookingId, etc.) */
  @Index()
  @Column({ length: 36 })
  aggregateId: string;

  /** Aggregate root type, e.g. "Trip", "Booking" */
  @Column({ length: 60 })
  aggregateType: string;

  /** JSON payload – the event data */
  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: OutboxStatus,
    default: OutboxStatus.PENDING,
  })
  status: OutboxStatus;

  @Column({ type: 'int', default: 0 })
  retries: number;

  @Column({ type: 'text', nullable: true })
  lastError?: string;

  @Column({ type: 'timestamptz', nullable: true })
  processedAt?: Date;

  /** Optional correlation id for tracing a chain of domain events */
  @Index()
  @Column({ nullable: true })
  correlationId?: string;
}
