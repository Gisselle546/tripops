import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TripMember,
  TripMemberStatus,
  TripRole,
} from '../../trips/entities/trip-member.entity';
import { REQUIRED_TRIP_ROLE_KEY } from '../decorators/required-trip-roles.decorator';
import { hasTripRoleAtLeast } from '../helpers/role-levels';

/**
 * Guard that enforces trip-level role permissions.
 *
 * How it works:
 *  1. Reads the required minimum role from `@RequiredTripRole(...)` metadata.
 *  2. Extracts `:tripId` from the route params.
 *  3. Looks up the user's active membership in `trip_members`.
 *  4. Compares role levels: userLevel >= requiredLevel.
 *
 * If no `@RequiredTripRole()` decorator is present the guard allows the
 * request through (so you can stack it at the controller level without
 * blocking routes that don't need trip-scoped auth).
 */
@Injectable()
export class TripRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 1. Check if decorator was applied
    const requiredRole = this.reflector.getAllAndOverride<TripRole | undefined>(
      REQUIRED_TRIP_ROLE_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    // No decorator → nothing to enforce
    if (!requiredRole) return true;

    // 2. Get user + tripId from request
    const req = ctx.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.userId;
    const tripId: string | undefined = req.params?.tripId;

    if (!userId) {
      throw new ForbiddenException('Authentication required.');
    }
    if (!tripId) {
      throw new NotFoundException(
        'Trip ID not found in route params. Make sure the route has a :tripId parameter.',
      );
    }

    // 3. Look up membership
    const membership = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this trip.');
    }

    // 4. Level check
    if (!hasTripRoleAtLeast(membership.role, requiredRole)) {
      throw new ForbiddenException(
        `This action requires at least the ${requiredRole} role on this trip.`,
      );
    }

    // Attach membership to request so handlers can use it
    req.tripMembership = membership;
    return true;
  }
}
