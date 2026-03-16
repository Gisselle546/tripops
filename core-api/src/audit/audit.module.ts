import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditEventsHandler } from './audit-events.handler';

import { TripMember } from '../trips/entities/trip-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, TripMember])],
  controllers: [AuditController],
  providers: [AuditService, AuditEventsHandler],
  exports: [AuditService],
})
export class AuditModule {}
