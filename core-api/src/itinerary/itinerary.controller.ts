import {
  Body,
  Controller,
  Delete,
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

import { ItineraryService } from './itinerary.service';
import { CreateItineraryItemDto } from './dto/create-itinerary-item.dto';
import { UpdateItineraryItemDto } from './dto/update-itinerary-item.dto';
import { CreateItineraryDayDto } from './dto/create-itinerary-day.dto';

@Controller('trips/:tripId/itinerary')
@UseGuards(JwtAuthGuard)
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @Get()
  getItinerary(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
  ) {
    return this.itineraryService.getItinerary(req.user.userId, tripId);
  }

  @Post('days')
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  createDay(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateItineraryDayDto,
  ) {
    return this.itineraryService.createDay(req.user.userId, tripId, dto);
  }

  @Post('items')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  createItem(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: CreateItineraryItemDto,
  ) {
    return this.itineraryService.createItem(req.user.userId, tripId, dto);
  }

  @Patch('items/:itemId')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  updateItem(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItineraryItemDto,
  ) {
    return this.itineraryService.updateItem(
      req.user.userId,
      tripId,
      itemId,
      dto,
    );
  }

  @Delete('items/:itemId')
  @Throttle({ default: { ttl: 60_000, limit: 15 } })
  deleteItem(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('itemId') itemId: string,
  ) {
    return this.itineraryService.deleteItem(req.user.userId, tripId, itemId);
  }
}
