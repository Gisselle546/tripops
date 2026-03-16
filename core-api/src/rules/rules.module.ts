import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';

import { TripMember } from '../trips/entities/trip-member.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';

import { RuleSet } from './entities/rule-set.entity';
import { Rule } from './entities/rule.entity';
import { RuleEvaluation } from './entities/rule-evaluation.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripMember,
      ItineraryItem,
      RuleSet,
      Rule,
      RuleEvaluation,
    ]),
    EventsModule,
  ],
  controllers: [RulesController],
  providers: [RulesService],
  exports: [RulesService],
})
export class RulesModule {}
