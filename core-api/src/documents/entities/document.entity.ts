import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AppBaseEntity } from '../../common/base.entity';
import { Trip } from '../../trips/entities/trip.entity';
import { User } from '../../users/entities/user.entity';

export enum DocumentCategory {
  BOOKINGS = 'BOOKINGS',
  INSURANCE = 'INSURANCE',
  IDS = 'IDS',
  ITINERARIES = 'ITINERARIES',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document extends AppBaseEntity {
  @Index()
  @Column()
  tripId: string;

  @Column({ length: 300 })
  name: string;

  @Column({
    type: 'enum',
    enum: DocumentCategory,
    default: DocumentCategory.OTHER,
  })
  category: DocumentCategory;

  @Column({ length: 100, nullable: true })
  fileType?: string; // e.g. "Passport", "Ticket", "Policy", "Visa"

  @Column({ length: 500 })
  storageKey: string; // S3/local file path

  @Column({ length: 120, nullable: true })
  mimeType?: string;

  @Column({ type: 'bigint', nullable: true })
  sizeBytes?: number;

  @Index()
  @Column()
  uploadedByUserId: string;

  @ManyToOne(() => Trip, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploadedByUserId' })
  uploadedBy: User;
}
