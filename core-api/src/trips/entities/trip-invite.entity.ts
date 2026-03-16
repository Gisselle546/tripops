import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from './trip.entity';

export enum InviteStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

@Entity('trip_invites')
export class TripInvite extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Index()
  @Column({ length: 255 })
  email: string;

  @Index({ unique: true })
  @Column()
  token: string;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  @Index()
  @Column()
  invitedByUserId: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @ManyToOne(() => Trip, (t) => t.invites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;
}
