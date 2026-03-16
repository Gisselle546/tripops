import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RebookingService } from './rebooking.service';
import { DisruptionEvent } from './entities/disruption-event.entity';
import { RebookingCase } from './entities/rebooking-case.entity';
import { RebookingOption } from './entities/rebooking-option.entity';
import { RebookingDecision } from './entities/rebooking-decision.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { EventsService } from '../events/events.service';

describe('RebookingService', () => {
  let service: RebookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RebookingService,
        {
          provide: getRepositoryToken(TripMember),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(ItineraryItem),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(DisruptionEvent),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) =>
              Promise.resolve({ id: 'test-id', ...entity }),
            ),
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(RebookingCase),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) =>
              Promise.resolve({ id: 'test-id', ...entity }),
            ),
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(RebookingOption),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) =>
              Promise.resolve({ id: 'test-id', ...entity }),
            ),
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(RebookingDecision),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) =>
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

    service = module.get<RebookingService>(RebookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
