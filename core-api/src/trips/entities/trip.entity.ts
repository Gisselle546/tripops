import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Workspace } from '../../workspace/entities/workspace.entity';
import { TripMember } from './trip-member.entity';
import { TripInvite } from './trip-invite.entity';
import { User } from '../../users/entities/user.entity';

@Entity('trips')
export class Trip extends AppBaseEntity {
  @Index()
  @Column()
  workspaceId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ length: 200 })
  destination: string;

  // Use "date" (string) for simplicity + timezone safety at date-only granularity
  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'int', nullable: true })
  budgetTarget?: number;

  @Column({ nullable: true })
  coverImage?: string;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @OneToMany(() => TripMember, (m) => m.trip)
  members: TripMember[];

  @OneToMany(() => TripInvite, (i) => i.trip)
  invites: TripInvite[];
}
