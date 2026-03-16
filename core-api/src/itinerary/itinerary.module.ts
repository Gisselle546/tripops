import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';
import { ItineraryDay } from './entities/itinerary-day.entity';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItineraryDay, ItineraryItem, TripMember]),
    EventsModule,
  ],
  controllers: [ItineraryController],
  providers: [ItineraryService],
  exports: [ItineraryService],
})
export class ItineraryModule {}
