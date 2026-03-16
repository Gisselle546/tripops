import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { DisruptionEvent } from './disruption-event.entity';
import { RebookingOption } from './rebooking-option.entity';

export enum RebookingCaseStatus {
  OPEN = 'OPEN',
  OPTIONS_READY = 'OPTIONS_READY',
  DECIDED = 'DECIDED',
  APPLIED = 'APPLIED',
  CANCELED = 'CANCELED',
}

@Entity('rebooking_cases')
export class RebookingCase extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Index()
  @Column()
  bookingId: string;

  @Index()
  @Column()
  disruptionEventId: string;

  @Column({
    type: 'enum',
    enum: RebookingCaseStatus,
    default: RebookingCaseStatus.OPEN,
  })
  status: RebookingCaseStatus;

  // snapshot of constraints/rules at time of case (optional for MVP)
  @Column({ type: 'jsonb', nullable: true })
  constraintsSnapshot?: Record<string, any>;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @ManyToOne(() => DisruptionEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'disruptionEventId' })
  disruptionEvent: DisruptionEvent;

  @OneToMany(() => RebookingOption, (o) => o.rebookingCase)
  options: RebookingOption[];
}
