import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CollabController } from './collab.controller';
import { CollabService } from './collab.service';

import { TripMember } from '../trips/entities/trip-member.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';

import { Comment } from './entities/comment.entity';
import { Proposal } from './entities/proposal.entity';
import { ProposalOption } from './entities/proposal-option.entity';
import { Vote } from './entities/vote.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripMember,
      ItineraryItem,
      Comment,
      Proposal,
      ProposalOption,
      Vote,
    ]),
    EventsModule,
  ],
  controllers: [CollabController],
  providers: [CollabService],
  exports: [CollabService],
})
export class CollabModule {}
