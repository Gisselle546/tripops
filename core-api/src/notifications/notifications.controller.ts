import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { AuthUser } from '../auth/types/auth-user';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(
    @Req() req: { user: AuthUser },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const lim = limit ? Number(limit) : 50;
    const off = offset ? Number(offset) : 0;
    return this.notifications.listForUser(req.user.userId, lim, off);
  }

  @Get('unread-count')
  unreadCount(@Req() req: { user: AuthUser }) {
    return this.notifications
      .unreadCount(req.user.userId)
      .then((count) => ({ count }));
  }

  @Patch('read')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  markAsRead(@Req() req: { user: AuthUser }, @Body() body: { ids: string[] }) {
    return this.notifications.markAsRead(req.user.userId, body.ids);
  }

  @Patch('read-all')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  markAllAsRead(@Req() req: { user: AuthUser }) {
    return this.notifications.markAllAsRead(req.user.userId);
  }
}
