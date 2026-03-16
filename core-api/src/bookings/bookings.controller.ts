import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth-user';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AttachBookingToItemDto } from './dto/attach-booking-to-item.dto';

@Controller('trips/:tripId/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Post()
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  create(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookings.createBooking(req.user.userId, tripId, dto);
  }

  @Get()
  list(@Req() req: { user: AuthUser }, @Param('tripId') tripId: string) {
    return this.bookings.listBookings(req.user.userId, tripId);
  }

  @Get(':bookingId')
  getOne(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookings.getBooking(req.user.userId, tripId, bookingId);
  }

  @Patch(':bookingId')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  update(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('bookingId') bookingId: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookings.updateBooking(req.user.userId, tripId, bookingId, dto);
  }

  // Convenience endpoint to link a booking to an itinerary item
  @Post('attach-to-item')
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  attachToItem(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: AttachBookingToItemDto,
  ) {
    return this.bookings.attachBookingToItineraryItem(
      req.user.userId,
      tripId,
      dto.itineraryItemId,
      dto.bookingId,
    );
  }
}
