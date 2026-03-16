import { Entity, Column, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';

export enum NotificationType {
  MENTION = 'MENTION',
  COMMENT = 'COMMENT',
  PROPOSAL = 'PROPOSAL',
  VOTE = 'VOTE',
  BOOKING_UPDATED = 'BOOKING_UPDATED',
  REBOOKING_OPTIONS_READY = 'REBOOKING_OPTIONS_READY',
  REBOOKING_DECIDED = 'REBOOKING_DECIDED',
  REBOOKING_APPLIED = 'REBOOKING_APPLIED',
  TRIP_CREATED = 'TRIP_CREATED',
  ITINERARY_UPDATED = 'ITINERARY_UPDATED',
  RULES_VIOLATION = 'RULES_VIOLATION',
  REMINDER = 'REMINDER',
  SYSTEM = 'SYSTEM',
}

export enum NotificationChannel {
  IN_APP = 'IN_APP',
  // EMAIL = 'EMAIL',   — future
  // PUSH = 'PUSH',     — future
}

@Entity('notifications')
export class Notification extends AppBaseEntity {
  @Index()
  @Column()
  recipientUserId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @Column({ length: 300 })
  title: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  /** Deep-link target (e.g., "/trips/<id>/itinerary") */
  @Column({ length: 500, nullable: true })
  link?: string;

  @Index()
  @Column({ nullable: true })
  tripId?: string;

  @Column({ nullable: true })
  actorUserId?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date;
}
