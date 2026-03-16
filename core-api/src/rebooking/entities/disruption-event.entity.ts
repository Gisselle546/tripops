import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

export enum DisruptionType {
  DELAY = 'DELAY',
  CANCELLATION = 'CANCELLATION',
  CHANGE = 'CHANGE',
}

@Entity('disruption_events')
export class DisruptionEvent extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Index()
  @Column()
  bookingId: string;

  @Column({ type: 'enum', enum: DisruptionType })
  type: DisruptionType;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'jsonb', nullable: true })
  payload?: Record<string, any>;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;
}
