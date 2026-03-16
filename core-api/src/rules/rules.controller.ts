import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { AuthUser } from '../auth/types/auth-user';

import { RulesService } from './rules.service';
import { UpsertRuleSetDto } from './dto/upsert-rule-set.dto';
import { EvaluateItineraryItemDto } from './dto/evaluate-item.dto';

@Controller('trips/:tripId/rules')
@UseGuards(JwtAuthGuard)
export class RulesController {
  constructor(private readonly rules: RulesService) {}

  @Get()
  getRuleSet(@Req() req: { user: AuthUser }, @Param('tripId') tripId: string) {
    return this.rules.getRuleSet(req.user.userId, tripId);
  }

  @Put()
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  upsertRuleSet(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: UpsertRuleSetDto,
  ) {
    return this.rules.upsertRuleSet(req.user.userId, tripId, dto);
  }

  @Post('evaluate-item')
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  evaluateItem(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: EvaluateItineraryItemDto,
  ) {
    return this.rules.evaluateItineraryItem(
      req.user.userId,
      tripId,
      dto.itineraryItemId,
    );
  }
}
