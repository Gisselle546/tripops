import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItineraryService } from './itinerary.service';
import { ItineraryDay } from './entities/itinerary-day.entity';
import { ItineraryItem } from './entities/itinerary-item.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { EventsService } from '../events/events.service';

describe('ItineraryService', () => {
  let service: ItineraryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItineraryService,
        {
          provide: getRepositoryToken(ItineraryDay),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) =>
              Promise.resolve({ id: 'test-id', ...entity }),
            ),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(ItineraryItem),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) =>
              Promise.resolve({ id: 'test-id', ...entity }),
            ),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(TripMember),
          useValue: {
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

    service = module.get<ItineraryService>(ItineraryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
