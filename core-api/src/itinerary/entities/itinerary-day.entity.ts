import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { ItineraryItem } from './itinerary-item.entity';

@Entity('itinerary_days')
@Unique('uq_itinerary_day_trip_date', ['tripId', 'date'])
export class ItineraryDay extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  // YYYY-MM-DD (date-only)
  @Column({ type: 'date' })
  date: string;

  // ordering in UI (0,1,2...)
  @Column({ type: 'int', default: 0 })
  dayIndex: number;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @OneToMany(() => ItineraryItem, (i) => i.day)
  items: ItineraryItem[];
}
