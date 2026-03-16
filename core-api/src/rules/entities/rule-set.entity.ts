import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { Rule } from './rule.entity';

@Entity('rule_sets')
@Unique('uq_rule_set_trip', ['tripId'])
export class RuleSet extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Column({ length: 200, default: 'Default Rules' })
  name: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @OneToMany(() => Rule, (r) => r.ruleSet)
  rules: Rule[];
}
