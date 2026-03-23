import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { Document } from './entities/document.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { EventsModule } from '../events/events.module';
import { S3StorageService } from './storage/s3-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, TripMember]), EventsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, S3StorageService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
