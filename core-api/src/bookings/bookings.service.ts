import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,

    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,

    @InjectRepository(ItineraryItem)
    private readonly itineraryItemsRepo: Repository<ItineraryItem>,
    private readonly eventsService: EventsService,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  private toDto(b: Booking) {
    return {
      id: b.id,
      tripId: b.tripId,
      type: b.type,
      status: b.status,
      providerName: b.providerName,
      confirmationCode: b.confirmationCode ?? null,
      startsAt: b.startsAt ?? null,
      endsAt: b.endsAt ?? null,
      totalCost: b.totalCost ?? null,
      notes: b.notes ?? null,
      details: b.details ?? null,
      createdByUserId: b.createdByUserId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
    };
  }

  async createBooking(userId: string, tripId: string, dto: CreateBookingDto) {
    await this.assertTripAccess(userId, tripId);

    const booking = await this.bookingsRepo.save(
      this.bookingsRepo.create({
        tripId,
        type: dto.type,
        status: dto.status,
        providerName: dto.providerName,
        confirmationCode: dto.confirmationCode,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
        totalCost: dto.totalCost,
        notes: dto.notes,
        details: dto.details,
        createdByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.BOOKING_CREATED,
      aggregateId: booking.id,
      aggregateType: 'Booking',
      actorUserId: userId,
      tripId,
      data: { type: booking.type, providerName: booking.providerName },
    });

    return this.toDto(booking);
  }

  async listBookings(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);

    const bookings = await this.bookingsRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });

    return bookings.map((b) => this.toDto(b));
  }

  async getBooking(userId: string, tripId: string, bookingId: string) {
    await this.assertTripAccess(userId, tripId);

    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId, tripId },
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    return this.toDto(booking);
  }

  async updateBooking(
    userId: string,
    tripId: string,
    bookingId: string,
    dto: UpdateBookingDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId, tripId },
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    if (dto.type !== undefined) booking.type = dto.type;
    if (dto.status !== undefined) booking.status = dto.status;
    if (dto.providerName !== undefined) booking.providerName = dto.providerName;

    if (dto.confirmationCode !== undefined)
      booking.confirmationCode = dto.confirmationCode ?? undefined;
    if (dto.startsAt !== undefined)
      booking.startsAt = dto.startsAt ? new Date(dto.startsAt) : undefined;
    if (dto.endsAt !== undefined)
      booking.endsAt = dto.endsAt ? new Date(dto.endsAt) : undefined;
    if (dto.totalCost !== undefined)
      booking.totalCost = (dto.totalCost as any) ?? undefined;
    if (dto.notes !== undefined) booking.notes = dto.notes ?? undefined;
    if (dto.details !== undefined) booking.details = dto.details ?? undefined;

    const saved = await this.bookingsRepo.save(booking);

    await this.eventsService.publish({
      type: DomainEvents.BOOKING_UPDATED,
      aggregateId: bookingId,
      aggregateType: 'Booking',
      actorUserId: userId,
      tripId,
      data: { changes: dto },
    });

    return this.toDto(saved);
  }

  async attachBookingToItineraryItem(
    userId: string,
    tripId: string,
    itineraryItemId: string,
    bookingId: string,
  ) {
    await this.assertTripAccess(userId, tripId);

    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId, tripId },
    });
    if (!booking)
      throw new NotFoundException('Booking not found in this trip.');

    const item = await this.itineraryItemsRepo.findOne({
      where: { id: itineraryItemId, tripId },
    });
    if (!item)
      throw new NotFoundException('Itinerary item not found in this trip.');

    item.bookingId = booking.id;
    await this.itineraryItemsRepo.save(item);

    await this.eventsService.publish({
      type: DomainEvents.BOOKING_ATTACHED,
      aggregateId: bookingId,
      aggregateType: 'Booking',
      actorUserId: userId,
      tripId,
      data: { itineraryItemId: item.id, bookingId: booking.id },
    });

    return { ok: true, itineraryItemId: item.id, bookingId: booking.id };
  }
}
