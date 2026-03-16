import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationEventsHandler } from './notification-events.handler';

import { TripMember } from '../trips/entities/trip-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, TripMember])],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationEventsHandler],
  exports: [NotificationsService],
})
export class NotificationsModule {}
