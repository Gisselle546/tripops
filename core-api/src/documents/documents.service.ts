import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import {
  TripMember,
  TripMemberStatus,
} from '../trips/entities/trip-member.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { EventsService } from '../events/events.service';
import { DomainEvents } from '../events/domain-events';
import { S3StorageService } from './storage/s3-storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly docsRepo: Repository<Document>,
    @InjectRepository(TripMember)
    private readonly tripMembersRepo: Repository<TripMember>,
    private readonly eventsService: EventsService,
    private readonly storage: S3StorageService,
  ) {}

  private async assertTripAccess(userId: string, tripId: string) {
    const m = await this.tripMembersRepo.findOne({
      where: { tripId, userId, status: TripMemberStatus.ACTIVE },
    });
    if (!m) throw new ForbiddenException('You are not a member of this trip.');
    return m;
  }

  private toDto(d: Document) {
    return {
      id: d.id,
      tripId: d.tripId,
      name: d.name,
      category: d.category,
      fileType: d.fileType ?? null,
      storageKey: d.storageKey,
      mimeType: d.mimeType ?? null,
      sizeBytes: d.sizeBytes ? Number(d.sizeBytes) : null,
      uploadedByUserId: d.uploadedByUserId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async uploadDocument(
    userId: string,
    tripId: string,
    dto: CreateDocumentDto,
    file: Express.Multer.File,
  ) {
    await this.assertTripAccess(userId, tripId);

    const storageKey = await this.storage.upload(
      tripId,
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    const doc = await this.docsRepo.save(
      this.docsRepo.create({
        tripId,
        name: dto.name,
        category: dto.category,
        fileType: dto.fileType,
        storageKey,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        uploadedByUserId: userId,
      }),
    );

    await this.eventsService.publish({
      type: DomainEvents.DOCUMENT_UPLOADED,
      aggregateId: doc.id,
      aggregateType: 'Document',
      actorUserId: userId,
      tripId,
      data: { name: doc.name, category: doc.category },
    });

    return this.toDto(doc);
  }

  async listDocuments(userId: string, tripId: string) {
    await this.assertTripAccess(userId, tripId);
    const docs = await this.docsRepo.find({
      where: { tripId },
      order: { createdAt: 'DESC' },
    });
    return docs.map((d) => this.toDto(d));
  }

  async getDocument(userId: string, tripId: string, docId: string) {
    await this.assertTripAccess(userId, tripId);
    const doc = await this.docsRepo.findOne({
      where: { id: docId, tripId },
    });
    if (!doc) throw new NotFoundException('Document not found.');
    return this.toDto(doc);
  }

  async getDownloadUrl(userId: string, tripId: string, docId: string) {
    await this.assertTripAccess(userId, tripId);
    const doc = await this.docsRepo.findOne({
      where: { id: docId, tripId },
    });
    if (!doc) throw new NotFoundException('Document not found.');

    const url = await this.storage.getSignedDownloadUrl(doc.storageKey);
    return { url, name: doc.name, mimeType: doc.mimeType };
  }

  async updateDocument(
    userId: string,
    tripId: string,
    docId: string,
    dto: UpdateDocumentDto,
  ) {
    await this.assertTripAccess(userId, tripId);
    const doc = await this.docsRepo.findOne({
      where: { id: docId, tripId },
    });
    if (!doc) throw new NotFoundException('Document not found.');

    Object.assign(doc, dto);
    const saved = await this.docsRepo.save(doc);

    await this.eventsService.publish({
      type: DomainEvents.DOCUMENT_UPDATED,
      aggregateId: saved.id,
      aggregateType: 'Document',
      actorUserId: userId,
      tripId,
      data: { name: saved.name, category: saved.category },
    });

    return this.toDto(saved);
  }

  async deleteDocument(userId: string, tripId: string, docId: string) {
    await this.assertTripAccess(userId, tripId);
    const doc = await this.docsRepo.findOne({
      where: { id: docId, tripId },
    });
    if (!doc) throw new NotFoundException('Document not found.');

    await this.storage.delete(doc.storageKey);
    await this.docsRepo.remove(doc);

    await this.eventsService.publish({
      type: DomainEvents.DOCUMENT_DELETED,
      aggregateId: docId,
      aggregateType: 'Document',
      actorUserId: userId,
      tripId,
      data: { name: doc.name },
    });

    return { ok: true as const };
  }
}
