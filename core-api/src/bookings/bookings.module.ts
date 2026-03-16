import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

import { TripMember } from '../trips/entities/trip-member.entity';
import { Booking } from './entities/booking.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TripMember, Booking, ItineraryItem]),
    EventsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
