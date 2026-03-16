import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './entities/trip.entity';
import { TripMember } from './entities/trip-member.entity';
import { TripInvite } from './entities/trip-invite.entity';
import { WorkspaceMember } from '../workspace/entities/workspace-member.entity';
import { TripRoleGuard } from '../auth/guards/trip-role.guard';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, TripMember, TripInvite, WorkspaceMember]),
    EventsModule,
  ],
  controllers: [TripsController],
  providers: [TripsService, TripRoleGuard, WorkspaceRoleGuard],
})
export class TripsModule {}
