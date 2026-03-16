import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';
import { ItineraryItem } from '../../itinerary/entities/itinerary-item.entity';

@Entity('comments')
export class Comment extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  // Optional: comment attached to an itinerary item
  @Index()
  @Column({ nullable: true })
  itineraryItemId?: string;

  @Column({ type: 'text' })
  body: string;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => ItineraryItem, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'itineraryItemId' })
  itineraryItem?: ItineraryItem;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;
}
