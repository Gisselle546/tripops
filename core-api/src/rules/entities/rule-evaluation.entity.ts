import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { RuleSet } from './rule-set.entity';

@Entity('rule_evaluations')
export class RuleEvaluation extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Index()
  @Column()
  ruleSetId: string;

  // What was evaluated? (we'll start with itinerary items)
  @Index()
  @Column()
  targetType: string; // "ITINERARY_ITEM"

  @Index()
  @Column()
  targetId: string; // itineraryItemId

  @Column({ type: 'jsonb' })
  result: {
    passed: boolean;
    violations: Array<{
      ruleType: string;
      message: string;
      severity?: 'WARN' | 'BLOCK';
    }>;
  };

  @ManyToOne(() => RuleSet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruleSetId' })
  ruleSet: RuleSet;
}
