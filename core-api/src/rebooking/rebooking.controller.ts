import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { AuthUser } from '../auth/types/auth-user';

import { RebookingService } from './rebooking.service';
import { SimulateDisruptionDto } from './dto/simulate-disruption.dto';
import { GenerateOptionsDto } from './dto/generate-options.dto';
import { DecideRebookingDto } from './dto/decide.dto';

@Controller('trips/:tripId/rebooking')
@UseGuards(JwtAuthGuard)
export class RebookingController {
  constructor(private readonly rebooking: RebookingService) {}

  @Get('cases')
  listCases(@Req() req: { user: AuthUser }, @Param('tripId') tripId: string) {
    return this.rebooking.listCases(req.user.userId, tripId);
  }

  @Get('cases/:caseId')
  getCase(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('caseId') caseId: string,
  ) {
    return this.rebooking.getCase(req.user.userId, tripId, caseId);
  }

  @Post('simulate-disruption')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  simulate(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Body() dto: SimulateDisruptionDto,
  ) {
    return this.rebooking.simulateDisruption(req.user.userId, tripId, dto);
  }

  @Post('cases/:caseId/generate-options')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  generateOptions(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('caseId') caseId: string,
    @Body() dto: GenerateOptionsDto,
  ) {
    return this.rebooking.generateOptions(req.user.userId, tripId, caseId, dto);
  }

  @Post('cases/:caseId/decide')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  decide(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('caseId') caseId: string,
    @Body() dto: DecideRebookingDto,
  ) {
    return this.rebooking.decide(req.user.userId, tripId, caseId, dto);
  }

  @Post('cases/:caseId/apply')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  apply(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Param('caseId') caseId: string,
  ) {
    return this.rebooking.applyDecision(req.user.userId, tripId, caseId);
  }
}
