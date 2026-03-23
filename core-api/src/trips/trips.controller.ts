import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { TripRoleGuard } from '../auth/guards/trip-role.guard';
import { RequiredWorkspaceRole } from '../auth/decorators/required-workspace-role.decorator';
import { RequiredTripRole } from '../auth/decorators/required-trip-roles.decorator';
import { WorkspaceRole } from '../workspace/entities/workspace-member.entity';
import { TripRole } from './entities/trip-member.entity';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { AuthUser } from '../auth/types/auth-user';

@Controller()
@UseGuards(JwtAuthGuard)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // Creating a trip requires MEMBER-level workspace access
  @RequiredWorkspaceRole(WorkspaceRole.MEMBER)
  @UseGuards(WorkspaceRoleGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('workspaces/:workspaceId/trips')
  createTrip(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateTripDto,
  ) {
    return this.tripsService.createTrip(req.user.userId, workspaceId, dto);
  }

  // Listing trips requires at least GUEST workspace access
  @RequiredWorkspaceRole(WorkspaceRole.GUEST)
  @UseGuards(WorkspaceRoleGuard)
  @Get('workspaces/:workspaceId/trips')
  listTrips(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.tripsService.listTripsInWorkspace(req.user.userId, workspaceId);
  }

  // Viewing a trip requires at least VIEWER trip access
  @RequiredTripRole(TripRole.VIEWER)
  @UseGuards(TripRoleGuard)
  @Get('trips/:tripId')
  getTrip(@Req() req: { user: AuthUser }, @Param('tripId') tripId: string) {
    return this.tripsService.getTripById(req.user.userId, tripId);
  }

  @RequiredTripRole(TripRole.VIEWER)
  @UseGuards(TripRoleGuard)
  @Get('trips/:tripId/members')
  listTripMembers(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
  ) {
    return this.tripsService.listTripMembers(req.user.userId, tripId);
  }
}
