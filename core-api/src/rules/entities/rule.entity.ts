import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { RuleSet } from './rule-set.entity';

export enum RuleType {
  NO_REDEYE = 'NO_REDEYE',
  MAX_LAYOVERS = 'MAX_LAYOVERS',
  VEG_ONLY = 'VEG_ONLY',
  DAILY_WALKING_CAP_KM = 'DAILY_WALKING_CAP_KM',
  BUDGET_MAX_PER_PERSON = 'BUDGET_MAX_PER_PERSON',
}

@Entity('rules')
export class Rule extends AppBaseEntity {
  @Index()
  @Column()
  ruleSetId: string;

  @Column({ type: 'enum', enum: RuleType })
  type: RuleType;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  // Flexible parameters (ex: max layovers = 1, walking cap = 12)
  @Column({ type: 'jsonb', nullable: true })
  params?: Record<string, any>;

  @Column({ length: 300, nullable: true })
  note?: string;

  @ManyToOne(() => RuleSet, (rs) => rs.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruleSetId' })
  ruleSet: RuleSet;
}
