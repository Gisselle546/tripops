import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { Trip } from './entities/trip.entity';
import { TripMember } from './entities/trip-member.entity';
import { TripInvite } from './entities/trip-invite.entity';
import { WorkspaceMember } from '../workspace/entities/workspace-member.entity';
import { EventsService } from '../events/events.service';

describe('TripsService', () => {
  let service: TripsService;

  const mockQueryBuilder = {
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: getRepositoryToken(Trip),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(TripMember),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
          },
        },
        {
          provide: getRepositoryToken(TripInvite),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            publish: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
