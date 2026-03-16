import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { ProposalOption } from './proposal-option.entity';
import { User } from '../../users/entities/user.entity';

@Entity('votes')
@Unique('uq_vote_option_user', ['optionId', 'userId'])
export class Vote extends AppBaseEntity {
  @Index()
  @Column()
  optionId: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => ProposalOption, (o) => o.votes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'optionId' })
  option: ProposalOption;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
