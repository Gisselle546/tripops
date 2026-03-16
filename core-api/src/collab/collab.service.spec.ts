import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollabService } from './collab.service';
import { Comment } from './entities/comment.entity';
import { Proposal } from './entities/proposal.entity';
import { ProposalOption } from './entities/proposal-option.entity';
import { Vote } from './entities/vote.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { EventsService } from '../events/events.service';

describe('CollabService', () => {
  let service: CollabService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollabService,
        {
          provide: getRepositoryToken(TripMember),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(ItineraryItem),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'test-id', ...entity }),
              ),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Proposal),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'test-id', ...entity }),
              ),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(ProposalOption),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'test-id', ...entity }),
              ),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(Vote),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'test-id', ...entity }),
              ),
            findOne: jest.fn().mockResolvedValue(null),
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

    service = module.get<CollabService>(CollabService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
