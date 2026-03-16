import {
  BadRequestException,
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
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import {
  ItineraryItem,
  ItineraryItemStatus,
} from '../itinerary/entities/itinerary-item.entity';

import {
  DisruptionEvent,
  DisruptionType,
} from './entities/disruption-event.entity';
import {
  RebookingCase,
  RebookingCaseStatus,
} from './entities/rebooking-case.entity';
import { RebookingOption } from './entities/rebooking-option.entity';
import { RebookingDecision } from './entities/rebooking-decision.entity';

import { SimulateDisruptionDto } from './dto/simulate-disruption.dto';
import { GenerateOptionsDto } from './dto/generate-options.dto';
import { DecideRebookingDto } from './dto/decide.dto';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';

@Injectable()
export class RebookingService {
  constructor(
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,

    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,

    @InjectRepository(ItineraryItem)
    private readonly itineraryItemsRepo: Repository<ItineraryItem>,

    @InjectRepository(DisruptionEvent)
    private readonly disruptionsRepo: Repository<DisruptionEvent>,

    @InjectRepository(RebookingCase)
    private readonly casesRepo: Repository<RebookingCase>,

    @InjectRepository(RebookingOption)
    private readonly optionsRepo: Repository<RebookingOption>,

    @InjectRepository(RebookingDecision)
    private readonly decisionsRepo: Repository<RebookingDecision>,
    private readonly eventsService: EventsService,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  // ---------- Query helpers ----------
  async listCases(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);

    const cases = await this.casesRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
    return cases;
  }

  async getCase(userId: string, tripId: string, rebookingCaseId: string) {
    await this.assertTripAccess(userId, tripId);

    const c = await this.casesRepo.findOne({
      where: { id: rebookingCaseId, tripId },
    });
    if (!c) throw new NotFoundException('Rebooking case not found.');

    const options = await this.optionsRepo.find({
      where: { rebookingCaseId: c.id },
      order: { score: 'DESC' },
    });
    const decision = await this.decisionsRepo.findOne({
      where: { rebookingCaseId: c.id },
    });

    return { case: c, options, decision: decision ?? null };
  }

  // ---------- Workflow ----------
  async simulateDisruption(
    userId: string,
    tripId: string,
    dto: SimulateDisruptionDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    const booking = await this.bookingsRepo.findOne({
      where: { id: dto.bookingId, tripId },
    });
    if (!booking)
      throw new NotFoundException('Booking not found in this trip.');

    const disruption = await this.disruptionsRepo.save(
      this.disruptionsRepo.create({
        tripId,
        bookingId: booking.id,
        type: dto.type,
        message: dto.message ?? this.defaultMessage(dto.type),
        createdByUserId: userId,
        payload: {
          previousStatus: booking.status,
          previousStartsAt: booking.startsAt ?? null,
          previousEndsAt: booking.endsAt ?? null,
        },
      }),
    );

    // Create rebooking case
    const rebookingCase = await this.casesRepo.save(
      this.casesRepo.create({
        tripId,
        bookingId: booking.id,
        disruptionEventId: disruption.id,
        status: RebookingCaseStatus.OPEN,
      }),
    );

    // For cancellations, mark booking as canceled immediately (MVP)
    if (dto.type === DisruptionType.CANCELLATION) {
      booking.status = BookingStatus.CANCELED;
      await this.bookingsRepo.save(booking);

      // If there's an itinerary item linked, mark it canceled
      const linkedItems = await this.itineraryItemsRepo.find({
        where: { tripId, bookingId: booking.id },
      });
      for (const item of linkedItems) {
        item.status = ItineraryItemStatus.CANCELED;
        await this.itineraryItemsRepo.save(item);
      }
    }

    await this.eventsService.publish({
      type: DomainEvents.DISRUPTION_SIMULATED,
      aggregateId: rebookingCase.id,
      aggregateType: 'RebookingCase',
      actorUserId: userId,
      tripId,
      data: {
        disruptionEventId: disruption.id,
        bookingId: booking.id,
        disruptionType: dto.type,
      },
    });

    return {
      disruptionEventId: disruption.id,
      rebookingCaseId: rebookingCase.id,
    };
  }

  async generateOptions(
    userId: string,
    tripId: string,
    rebookingCaseId: string,
    dto: GenerateOptionsDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    const c = await this.casesRepo.findOne({
      where: { id: rebookingCaseId, tripId },
    });
    if (!c) throw new NotFoundException('Rebooking case not found.');

    const booking = await this.bookingsRepo.findOne({
      where: { id: c.bookingId, tripId },
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    // Clear existing options (MVP regenerate)
    await this.optionsRepo.delete({ rebookingCaseId: c.id });

    const count = dto.count ?? 3;
    const generated = this.simulateOptions(booking, count);

    const saved = await this.optionsRepo.save(
      generated.map((o) =>
        this.optionsRepo.create({ rebookingCaseId: c.id, ...o }),
      ),
    );

    c.status = RebookingCaseStatus.OPTIONS_READY;
    await this.casesRepo.save(c);

    await this.eventsService.publish({
      type: DomainEvents.REBOOKING_OPTIONS_GENERATED,
      aggregateId: c.id,
      aggregateType: 'RebookingCase',
      actorUserId: userId,
      tripId,
      data: { caseId: c.id, optionCount: saved.length },
    });

    return { rebookingCaseId: c.id, options: saved };
  }

  async decide(
    userId: string,
    tripId: string,
    rebookingCaseId: string,
    dto: DecideRebookingDto,
  ) {
    await this.assertTripAccess(userId, tripId);

    const c = await this.casesRepo.findOne({
      where: { id: rebookingCaseId, tripId },
    });
    if (!c) throw new NotFoundException('Rebooking case not found.');

    if (c.status === RebookingCaseStatus.APPLIED) {
      throw new BadRequestException('Case already applied.');
    }

    const option = await this.optionsRepo.findOne({
      where: { id: dto.optionId, rebookingCaseId: c.id },
    });
    if (!option) throw new NotFoundException('Option not found for this case.');

    // Upsert single decision per case
    const existing = await this.decisionsRepo.findOne({
      where: { rebookingCaseId: c.id },
    });
    if (existing) {
      existing.chosenOptionId = option.id;
      existing.rationale = dto.rationale;
      existing.decidedByUserId = userId;
      await this.decisionsRepo.save(existing);
    } else {
      await this.decisionsRepo.save(
        this.decisionsRepo.create({
          rebookingCaseId: c.id,
          chosenOptionId: option.id,
          rationale: dto.rationale,
          decidedByUserId: userId,
        }),
      );
    }

    c.status = RebookingCaseStatus.DECIDED;
    await this.casesRepo.save(c);

    await this.eventsService.publish({
      type: DomainEvents.REBOOKING_DECIDED,
      aggregateId: c.id,
      aggregateType: 'RebookingCase',
      actorUserId: userId,
      tripId,
      data: { caseId: c.id, chosenOptionId: option.id },
    });

    return { rebookingCaseId: c.id, chosenOptionId: option.id };
  }

  async applyDecision(userId: string, tripId: string, rebookingCaseId: string) {
    await this.assertTripAccess(userId, tripId);

    const c = await this.casesRepo.findOne({
      where: { id: rebookingCaseId, tripId },
    });
    if (!c) throw new NotFoundException('Rebooking case not found.');

    const decision = await this.decisionsRepo.findOne({
      where: { rebookingCaseId: c.id },
    });
    if (!decision)
      throw new BadRequestException('No decision exists for this case.');

    const option = await this.optionsRepo.findOne({
      where: { id: decision.chosenOptionId, rebookingCaseId: c.id },
    });
    if (!option) throw new NotFoundException('Chosen option not found.');

    const booking = await this.bookingsRepo.findOne({
      where: { id: c.bookingId, tripId },
    });
    if (!booking) throw new NotFoundException('Booking not found.');

    // Apply: update booking window + mark confirmed
    booking.startsAt = option.startsAt ?? booking.startsAt;
    booking.endsAt = option.endsAt ?? booking.endsAt;
    booking.status = BookingStatus.CONFIRMED;

    // Optional: store a record in booking.details for traceability
    booking.details = {
      ...(booking.details ?? {}),
      lastRebookedFromCaseId: c.id,
      lastRebookedOptionId: option.id,
      priceDeltaApplied: option.priceDelta,
    };

    await this.bookingsRepo.save(booking);

    // If itinerary items linked to this booking exist, update them too
    const linkedItems = await this.itineraryItemsRepo.find({
      where: { tripId, bookingId: booking.id },
    });
    for (const item of linkedItems) {
      item.status = ItineraryItemStatus.BOOKED;

      // helpful demo: update title to reflect "rebooked"
      if (!item.title.toLowerCase().includes('rebooked')) {
        item.title = `${item.title} (rebooked)`;
      }
      await this.itineraryItemsRepo.save(item);
    }

    c.status = RebookingCaseStatus.APPLIED;
    await this.casesRepo.save(c);

    await this.eventsService.publish({
      type: DomainEvents.REBOOKING_APPLIED,
      aggregateId: c.id,
      aggregateType: 'RebookingCase',
      actorUserId: userId,
      tripId,
      data: { caseId: c.id, bookingId: booking.id },
    });

    return { ok: true, rebookingCaseId: c.id, bookingId: booking.id };
  }

  // ---------- Simulation logic ----------
  private defaultMessage(type: DisruptionType) {
    switch (type) {
      case DisruptionType.DELAY:
        return 'Carrier reported a delay.';
      case DisruptionType.CANCELLATION:
        return 'Carrier canceled the booking.';
      case DisruptionType.CHANGE:
        return 'Carrier changed the booking details.';
      default:
        return 'Disruption detected.';
    }
  }

  private simulateOptions(booking: Booking, count: number) {
    // Very simple: create a few alternative start/end times + price deltas + score
    const baseStart = booking.startsAt
      ? booking.startsAt.getTime()
      : Date.now() + 6 * 3600_000;
    const baseEnd = booking.endsAt
      ? booking.endsAt.getTime()
      : baseStart + 2 * 3600_000;

    const options: Array<{
      label: string;
      startsAt: Date;
      endsAt: Date;
      priceDelta: number;
      score: number;
      notes?: { warnings?: string[]; blocks?: string[] };
      details?: Record<string, any>;
    }> = [];

    for (let i = 0; i < count; i++) {
      const hoursShift = (i + 1) * 2; // +2h, +4h, +6h
      const startsAt = new Date(baseStart + hoursShift * 3600_000);
      const endsAt = new Date(baseEnd + hoursShift * 3600_000);

      const priceDelta =
        (i === 0 ? 0 : i * 50) * (Math.random() > 0.5 ? 1 : -1);
      const score = 100 - i * 10 + (priceDelta < 0 ? 5 : 0);

      options.push({
        label: `Option ${i + 1}: shift +${hoursShift}h`,
        startsAt,
        endsAt,
        priceDelta,
        score,
        notes:
          priceDelta > 150
            ? { warnings: ['Higher cost than original.'] }
            : undefined,
        details: { simulated: true, hoursShift },
      });
    }

    // Sort by score desc
    return options.sort((a, b) => b.score - a.score);
  }
}
