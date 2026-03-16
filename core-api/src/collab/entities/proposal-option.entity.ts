import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Proposal } from './proposal.entity';
import { User } from '../../users/entities/user.entity';
import { Vote } from './vote.entity';

@Entity('proposal_options')
export class ProposalOption extends AppBaseEntity {
  @Index()
  @Column()
  proposalId: string;

  @Column({ length: 220 })
  label: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ type: 'int', nullable: true })
  estimatedCost?: number;

  @Index()
  @Column()
  createdByUserId: string;

  @ManyToOne(() => Proposal, (p) => p.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposalId' })
  proposal: Proposal;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'createdByUserId' })
  createdBy: User;

  @OneToMany(() => Vote, (v) => v.option)
  votes: Vote[];
}
