import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';
import { ProposalOption } from './proposal-option.entity';

export enum ProposalStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

@Entity('proposals')
export class Proposal extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ProposalStatus, default: ProposalStatus.OPEN })
  status: ProposalStatus;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @OneToMany(() => ProposalOption, (o) => o.proposal)
  options: ProposalOption[];
}
