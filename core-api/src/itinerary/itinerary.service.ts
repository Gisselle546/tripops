import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItineraryDay } from './entities/itinerary-day.entity';
import { ItineraryItem } from './entities/itinerary-item.entity';
import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';

import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { CreateItineraryDayDto } from './dto/create-itinerary-day.dto';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class ItineraryService {
  constructor(
    @InjectRepository(ItineraryDay)
    private readonly daysRepo: Repository<ItineraryDay>,
    @InjectRepository(ItineraryItem)
    private readonly itemsRepo: Repository<ItineraryItem>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
    private readonly eventsService: EventsService,
  ) {}

  // ---- membership check (no role guard yet)
  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  async getItinerary(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);

    const days = await this.daysRepo.find({
      where: { tripId },
      order: { dayIndex: 'ASC', date: 'ASC' },
    });

    const items = await this.itemsRepo.find({
      where: { tripId },
      order: { startsAt: 'ASC', createdAt: 'ASC' },
    });

    // Group items by dayId (or "unassigned")
    const itemsByDayId: Record<string, ItineraryItem[]> = {};
    for (const item of items) {
      const key = item.dayId ?? 'unassigned';
      itemsByDayId[key] ||= [];
      itemsByDayId[key].push(item);
    }

    return {
      tripId,
      days: days.map((d) => ({
        id: d.id,
        date: d.date,
        dayIndex: d.dayIndex,
        items: (itemsByDayId[d.id] ?? []).map((i) => this.toItemDto(i)),
      })),
      unassignedItems: (itemsByDayId['unassigned'] ?? []).map((i) =>
        this.toItemDto(i),
      ),
    };
  }

  async createDay(userId: string, tripId: string, dto: CreateItineraryDayDto) {
    await this.assertTripAccess(userId, tripId);

    // If dayIndex not provided, auto-append.
    let dayIndex = dto.dayIndex;
    if (dayIndex === undefined || dayIndex === null) {
      const last = await this.daysRepo
        .createQueryBuilder('d')
        .where('d.tripId = :tripId', { tripId })
        .orderBy('d.dayIndex', 'DESC')
        .addOrderBy('d.date', 'DESC')
        .getOne();
      dayIndex = last ? last.dayIndex + 1 : 0;
    }

    const day = await this.daysRepo.save(
      this.daysRepo.create({
        tripId,
        date: dto.date,
        dayIndex,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.ITINERARY_DAY_CREATED,
      aggregateId: day.id,
      aggregateType: 'ItineraryDay',
      actorUserId: userId,
      tripId,
      data: { date: day.date, dayIndex: day.dayIndex },
    });

    return {
      id: day.id,
      tripId: day.tripId,
      date: day.date,
      dayIndex: day.dayIndex,
    };
  }

  async createItem(
    userId: string,
    tripId: string,
    dto: CreateItineraryItemDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    if (dto.dayId) {
      // Ensure the day belongs to the same trip (prevents cross-trip linking)
      const day = await this.daysRepo.findOne({
        where: { id: dto.dayId, tripId },
      });
      if (!day) throw new NotFoundException('Day not found in this trip.');
    }

    const item = await this.itemsRepo.save(
      this.itemsRepo.create({
        tripId,
        dayId: dto.dayId ?? undefined,
        type: dto.type,
        status: dto.status,
        title: dto.title,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        locationName: dto.locationName,
        address: dto.address,
        lat: dto.lat,
        lng: dto.lng,
        estimatedCost: dto.estimatedCost,
        createdByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.ITINERARY_ITEM_CREATED,
      aggregateId: item.id,
      aggregateType: 'ItineraryItem',
      actorUserId: userId,
      tripId,
      data: { title: item.title, type: item.type, dayId: item.dayId },
    });

    return this.toItemDto(item);
  }

  async updateItem(
    userId: string,
    tripId: string,
    itemId: string,
    dto: UpdateItineraryItemDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    // membership-scoped fetch (prevents guessing itemId)
    const item = await this.itemsRepo.findOne({
      where: { id: itemId, tripId },
    });
    if (!item) throw new NotFoundException('Itinerary item not found.');

    if (dto.dayId !== undefined) {
      if (dto.dayId === null || dto.dayId === '') {
        item.dayId = undefined; // unassign
      } else {
        const day = await this.daysRepo.findOne({
          where: { id: dto.dayId, tripId },
        });
        if (!day) throw new NotFoundException('Day not found in this trip.');
        item.dayId = dto.dayId;
      }
    }

    if (dto.type !== undefined) item.type = dto.type;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.title !== undefined) item.title = dto.title;

    if (dto.startsAt !== undefined)
      item.startsAt = dto.startsAt ? new Date(dto.startsAt) : undefined;
    if (dto.endsAt !== undefined)
      item.endsAt = dto.endsAt ? new Date(dto.endsAt) : undefined;

    if (dto.locationName !== undefined)
      item.locationName = dto.locationName ?? undefined;
    if (dto.address !== undefined) item.address = dto.address ?? undefined;
    if (dto.lat !== undefined) item.lat = (dto.lat as any) ?? undefined;
    if (dto.lng !== undefined) item.lng = (dto.lng as any) ?? undefined;
    if (dto.estimatedCost !== undefined)
      item.estimatedCost = (dto.estimatedCost as any) ?? undefined;

    const saved = await this.itemsRepo.save(item);

    await this.eventsService.publish({
      type: DomainEvents.ITINERARY_ITEM_UPDATED,
      aggregateId: itemId,
      aggregateType: 'ItineraryItem',
      actorUserId: userId,
      tripId,
      data: { changes: dto },
    });

    return this.toItemDto(saved);
  }

  async deleteItem(userId: string, tripId: string, itemId: string) {
    await this.assertTripAccess(userId, tripId);

    const item = await this.itemsRepo.findOne({
      where: { id: itemId, tripId },
    });
    if (!item) throw new NotFoundException('Itinerary item not found.');

    await this.itemsRepo.remove(item);

    await this.eventsService.publish({
      type: DomainEvents.ITINERARY_ITEM_DELETED,
      aggregateId: itemId,
      aggregateType: 'ItineraryItem',
      actorUserId: userId,
      tripId,
      data: { title: item.title, type: item.type },
    });

    return { ok: true };
  }

  private toItemDto(i: ItineraryItem) {
    return {
      id: i.id,
      tripId: i.tripId,
      dayId: i.dayId ?? null,
      type: i.type,
      status: i.status,
      title: i.title,
      startsAt: i.startsAt ?? null,
      endsAt: i.endsAt ?? null,
      locationName: i.locationName ?? null,
      address: i.address ?? null,
      lat: i.lat ?? null,
      lng: i.lng ?? null,
      estimatedCost: i.estimatedCost ?? null,
      bookingId: i.bookingId ?? null,
      createdByUserId: i.createdByUserId,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    };
  }
}
