import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JobsService } from './jobs.service';

import { EventsModule } from '../events/events.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { Booking } from '../bookings/entities/booking.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { Trip } from '../trips/entities/trip.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Booking, TripMember, Trip]),
    EventsModule,
    NotificationsModule,
  ],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
