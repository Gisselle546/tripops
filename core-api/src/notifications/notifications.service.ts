import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import {
  Notification,
  NotificationChannel,
  NotificationType,
} from './entities/notification.entity';
import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';

export interface CreateNotificationInput {
  recipientUserId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  tripId?: string;
  actorUserId?: string;
  meta?: Record<string, any>;
  channel?: NotificationChannel;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,

    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
  ) {}

  // ── Create a single notification ───────────────────────────────────
  async create(input: CreateNotificationInput): Promise<Notification> {
    const notif = this.notificationsRepo.create({
      recipientUserId: input.recipientUserId,
      type: input.type,
      channel: input.channel ?? NotificationChannel.IN_APP,
      title: input.title,
      body: input.body,
      link: input.link,
      tripId: input.tripId,
      actorUserId: input.actorUserId,
      meta: input.meta,
    });

    return this.notificationsRepo.save(notif);
  }

  // ── Notify all trip members (except the actor) ─────────────────────
  async notifyTripMembers(
    tripId: string,
    actorUserId: string,
    opts: {
      type: NotificationType;
      title: string;
      body?: string;
      link?: string;
      meta?: Record<string, any>;
    },
  ): Promise<number> {
    const members = await this.tripMembersRepo.find({
      where: { tripId, status: TripMemberStatus.ACTIVE },
    });

    const recipients = members.filter((m) => m.userId !== actorUserId);
    if (!recipients.length) return 0;

    const notifications = recipients.map((m) =>
      this.notificationsRepo.create({
        recipientUserId: m.userId,
        type: opts.type,
        channel: NotificationChannel.IN_APP,
        title: opts.title,
        body: opts.body,
        link: opts.link,
        tripId,
        actorUserId,
        meta: opts.meta,
      }),
    );

    await this.notificationsRepo.save(notifications);
    this.logger.debug(
      `Sent ${notifications.length} notifications for trip ${tripId} (${opts.type})`,
    );
    return notifications.length;
  }

  // ── List user notifications ────────────────────────────────────────
  async listForUser(userId: string, limit = 50, offset = 0) {
    const [items, total] = await this.notificationsRepo.findAndCount({
      where: { recipientUserId: userId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 200),
      skip: offset,
    });

    return {
      items: items.map((n) => this.toDto(n)),
      total,
      unreadCount: items.filter((n) => !n.read).length,
    };
  }

  // ── Unread count ───────────────────────────────────────────────────
  async unreadCount(userId: string): Promise<number> {
    return this.notificationsRepo.count({
      where: { recipientUserId: userId, read: false },
    });
  }

  // ── Mark as read ───────────────────────────────────────────────────
  async markAsRead(userId: string, notificationIds: string[]) {
    await this.notificationsRepo.update(
      { id: In(notificationIds), recipientUserId: userId },
      { read: true, readAt: new Date() },
    );
    return { ok: true };
  }

  // ── Mark all as read ───────────────────────────────────────────────
  async markAllAsRead(userId: string) {
    await this.notificationsRepo.update(
      { recipientUserId: userId, read: false },
      { read: true, readAt: new Date() },
    );
    return { ok: true };
  }

  // ── DTO mapper ─────────────────────────────────────────────────────
  private toDto(n: Notification) {
    return {
      id: n.id,
      type: n.type,
      channel: n.channel,
      title: n.title,
      body: n.body ?? null,
      link: n.link ?? null,
      tripId: n.tripId ?? null,
      actorUserId: n.actorUserId ?? null,
      meta: n.meta ?? null,
      read: n.read,
      readAt: n.readAt ?? null,
      createdAt: n.createdAt,
    };
  }
}
