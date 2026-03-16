import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { RebookingCase } from './rebooking-case.entity';

@Entity('rebooking_decisions')
@Unique('uq_rebooking_decision_case', ['rebookingCaseId'])
export class RebookingDecision extends AppBaseEntity {
  @Index()
  @Column()
  rebookingCaseId: string;

  @Index()
  @Column()
  chosenOptionId: string;

  @Column({ type: 'text', nullable: true })
  rationale?: string;

  @Index()
  @Column()
  decidedByUserId: string;

  @ManyToOne(() => RebookingCase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rebookingCaseId' })
  rebookingCase: RebookingCase;
}
