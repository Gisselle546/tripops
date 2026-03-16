import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,

    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  async write(entry: {
    tripId: string;
    workspaceId?: string;
    actorUserId: string;
    action: AuditAction;
    targetType?: string;
    targetId?: string;
    meta?: Record<string, any>;
    correlationId?: string;
  }) {
    // no access check here because internal services call this after they already checked membership
    const log = this.auditRepo.create(entry);
    await this.auditRepo.save(log);
    return log;
  }

  async listForTrip(userId: string, tripId: string, limit = 50, offset = 0) {
    await this.assertTripAccess(userId, tripId);

    const logs = await this.auditRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 200),
      skip: offset,
    });

    return logs.map((l) => ({
      id: l.id,
      tripId: l.tripId,
      workspaceId: l.workspaceId ?? null,
      actorUserId: l.actorUserId,
      action: l.action,
      targetType: l.targetType ?? null,
      targetId: l.targetId ?? null,
      meta: l.meta ?? null,
      correlationId: l.correlationId ?? null,
      createdAt: l.createdAt,
    }));
  }
}
