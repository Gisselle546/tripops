import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth-user';
import { AuditService } from './audit.service';

@Controller('trips/:tripId/audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(
    @Req() req: { user: AuthUser },
    @Param('tripId') tripId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const lim = limit ? Number(limit) : 50;
    const off = offset ? Number(offset) : 0;
    return this.audit.listForTrip(req.user.userId, tripId, lim, off);
  }
}
