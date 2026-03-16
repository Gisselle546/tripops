import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RebookingController } from './rebooking.controller';
import { RebookingService } from './rebooking.service';

import { TripMember } from '../trips/entities/trip-member.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';

import { DisruptionEvent } from './entities/disruption-event.entity';
import { RebookingCase } from './entities/rebooking-case.entity';
import { RebookingOption } from './entities/rebooking-option.entity';
import { RebookingDecision } from './entities/rebooking-decision.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TripMember,
      Booking,
      ItineraryItem,
      DisruptionEvent,
      RebookingCase,
      RebookingOption,
      RebookingDecision,
    ]),
    EventsModule,
  ],
  controllers: [RebookingController],
  providers: [RebookingService],
  exports: [RebookingService],
})
export class RebookingModule {}
