import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';

export enum BookingType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  TRAIN = 'TRAIN',
  CAR = 'CAR',
  ACTIVITY = 'ACTIVITY',
  RESTAURANT = 'RESTAURANT',
  OTHER = 'OTHER',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
}

@Entity('bookings')
export class Booking extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Column({ type: 'enum', enum: BookingType })
  type: BookingType;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ length: 220 })
  providerName: string; // airline/hotel/vendor, etc.

  @Column({ length: 200, nullable: true })
  confirmationCode?: string;

  @Column({ type: 'timestamptz', nullable: true })
  startsAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt?: Date;

  @Column({ type: 'int', nullable: true })
  totalCost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Store raw structured booking metadata (optional, MVP friendly)
  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;
}
