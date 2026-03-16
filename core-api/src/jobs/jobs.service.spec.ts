import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { EventsService } from '../events/events.service';
import { NotificationsService } from '../notifications/notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from '../bookings/entities/booking.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { Trip } from '../trips/entities/trip.entity';

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: EventsService,
          useValue: {
            processPendingEvents: jest.fn().mockResolvedValue(0),
            retryFailedEvents: jest.fn().mockResolvedValue(0),
            cleanupDeliveredEvents: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        {
          provide: getRepositoryToken(TripMember),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Trip),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
