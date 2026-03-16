import { Entity, Column, ManyToOne, Unique, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from './trip.entity';
import { User } from '../../users/entities/user.entity';

export enum TripRole {
  OWNER = 'OWNER',
  COLLABORATOR = 'COLLABORATOR',
  VIEWER = 'VIEWER',
}

export enum TripMemberStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  LEFT = 'LEFT',
}

@Entity('trip_members')
@Unique('uq_trip_member', ['tripId', 'userId'])
export class TripMember extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Index()
  @Column()
  userId: string;

  @Column({ type: 'enum', enum: TripRole, default: TripRole.COLLABORATOR })
  role: TripRole;

  @Column({
    type: 'enum',
    enum: TripMemberStatus,
    default: TripMemberStatus.INVITED,
  })
  status: TripMemberStatus;

  @ManyToOne(() => Trip, (t) => t.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
