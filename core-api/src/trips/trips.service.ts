import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import {
  TripMember,
  TripMemberStatus,
  TripRole,
} from './entities/trip-member.entity';
import { TripInvite } from './entities/trip-invite.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { WorkspaceMember } from '../workspace/entities/workspace-member.entity';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripsRepo: Repository<Trip>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
    @InjectRepository(TripInvite)
    private readonly tripInvitesRepo: Repository<TripInvite>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMembersRepo: Repository<WorkspaceMember>,
    private readonly eventsService: EventsService,
  ) {}

  private toDto(t: Trip) {
    return {
      id: t.id,
      workspaceId: t.workspaceId,
      title: t.title,
      destination: t.destination,
      startDate: t.startDate,
      endDate: t.endDate,
      budgetTarget: t.budgetTarget ?? undefined,
      createdByUserId: t.createdByUserId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async createTrip(userId: string, workspaceId: string, dto: CreateTripDto) {
    // Ensure caller is a member of the workspace (no role checks yet)
    const wsMembership = await this.workspaceMembersRepo.findOne({
      where: { workspaceId, userId },
    });
    if (!wsMembership)
      throw new ForbiddenException('You are not a member of this workspace.');

    const trip = await this.tripsRepo.save(
      this.tripsRepo.create({
        workspaceId,
        title: dto.title,
        destination: dto.destination,
        startDate: dto.startDate,
        endDate: dto.endDate,
        budgetTarget: dto.budgetTarget,
        createdByUserId: userId,
      }),
    );

    await this.tripMembersRepo.save(
      this.tripMembersRepo.create({
        tripId: trip.id,
        userId,
        role: TripRole.OWNER,
        status: TripMemberStatus.ACTIVE,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.TRIP_CREATED,
      aggregateId: trip.id,
      aggregateType: 'Trip',
      actorUserId: userId,
      tripId: trip.id,
      workspaceId,
      data: { title: trip.title, destination: trip.destination },
    });

    return this.toDto(trip);
  }

  async listTripsInWorkspace(userId: string, workspaceId: string) {
    // Must be workspace member to list trips
    const wsMembership = await this.workspaceMembersRepo.findOne({
      where: { workspaceId, userId },
    });
    if (!wsMembership)
      throw new ForbiddenException('You are not a member of this workspace.');

    // Return only trips in this workspace where user is a trip member
    const trips = await this.tripsRepo
      .createQueryBuilder('t')
      .innerJoin(
        TripMember,
        'tm',
        'tm.tripId = t.id AND tm.userId = :userId AND tm.status = :status',
        {
          userId,
          status: TripMemberStatus.ACTIVE,
        },
      )
      .where('t.workspaceId = :workspaceId', { workspaceId })
      .orderBy('t.createdAt', 'DESC')
      .getMany();

    return trips.map((t) => this.toDto(t));
  }

  async getTripById(userId: string, tripId: string) {
    // Membership-scoped fetch (prevents guessing IDs)
    const trip = await this.tripsRepo
      .createQueryBuilder('t')
      .innerJoin(
        TripMember,
        'tm',
        'tm.tripId = t.id AND tm.userId = :userId AND tm.status = :status',
        {
          userId,
          status: TripMemberStatus.ACTIVE,
        },
      )
      .where('t.id = :tripId', { tripId })
      .getOne();

    if (!trip) throw new NotFoundException('Trip not found.');
    return this.toDto(trip);
  }
}
