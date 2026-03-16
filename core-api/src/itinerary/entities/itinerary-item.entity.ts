import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { ItineraryDay } from './itinerary-day.entity';
import { User } from '../../users/entities/user.entity';

export enum ItineraryItemType {
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  ACTIVITY = 'ACTIVITY',
  RESTAURANT = 'RESTAURANT',
  TRANSPORT = 'TRANSPORT',
  NOTE = 'NOTE',
}

export enum ItineraryItemStatus {
  IDEA = 'IDEA',
  PLANNED = 'PLANNED',
  BOOKED = 'BOOKED',
  CANCELED = 'CANCELED',
}

@Entity('itinerary_items')
export class ItineraryItem extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  // optional: item can be unassigned
  @Index()
  @Column({ nullable: true })
  dayId?: string;

  @Column({ type: 'enum', enum: ItineraryItemType })
  type: ItineraryItemType;

  @Column({
    type: 'enum',
    enum: ItineraryItemStatus,
    default: ItineraryItemStatus.IDEA,
  })
  status: ItineraryItemStatus;

  @Column({ length: 220 })
  title: string;

  @Column({ type: 'timestamptz', nullable: true })
  startsAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt?: Date;

  @Column({ length: 220, nullable: true })
  locationName?: string;

  @Column({ length: 400, nullable: true })
  address?: string;

  @Column({ type: 'double precision', nullable: true })
  lat?: number;

  @Column({ type: 'double precision', nullable: true })
  lng?: number;

  @Column({ type: 'int', nullable: true })
  estimatedCost?: number;

  // We'll use this later when BookingsModule exists
  @Index()
  @Column({ nullable: true })
  bookingId?: string;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => ItineraryDay, (d) => d.items, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'dayId' })
  day?: ItineraryDay;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;
}
