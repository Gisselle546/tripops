import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { RebookingCase } from './rebooking-case.entity';

@Entity('rebooking_options')
export class RebookingOption extends AppBaseEntity {
  @Index()
  @Column()
  rebookingCaseId: string;

  // A human-friendly label for demo purposes
  @Column({ length: 220 })
  label: string;

  // Proposed new times
  @Column({ type: 'timestamptz', nullable: true })
  startsAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt?: Date;

  // Cost delta compared to current booking (can be negative)
  @Column({ type: 'int', default: 0 })
  priceDelta: number;

  // Score from constraints (bigger = better)
  @Column({ type: 'int', default: 0 })
  score: number;

  // Reasons / rule violations
  @Column({ type: 'jsonb', nullable: true })
  notes?: {
    warnings?: string[];
    blocks?: string[];
  };

  // Store option metadata
  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>;

  @ManyToOne(() => RebookingCase, (c) => c.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rebookingCaseId' })
  rebookingCase: RebookingCase;
}
