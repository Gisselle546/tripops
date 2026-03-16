import { SetMetadata } from '@nestjs/common';
import { TripRole } from '../../trips/entities/trip-member.entity';

export const REQUIRED_TRIP_ROLE_KEY = 'requiredTripRole';

/**
 * Declare the **minimum** trip role needed to access a route.
 *
 * The hierarchy is:  OWNER > COLLABORATOR > VIEWER
 *
 * If you write `@RequiredTripRole(TripRole.COLLABORATOR)`, then both
 * COLLABORATOR and OWNER are allowed — VIEWER is not.
 *
 * Usage:
 *   @RequiredTripRole(TripRole.COLLABORATOR)
 *   @UseGuards(JwtAuthGuard, TripRoleGuard)
 */
export const RequiredTripRole = (role: TripRole) =>
  SetMetadata(REQUIRED_TRIP_ROLE_KEY, role);
