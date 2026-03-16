import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RulesService } from './rules.service';
import { RuleSet } from './entities/rule-set.entity';
import { Rule } from './entities/rule.entity';
import { RuleEvaluation } from './entities/rule-evaluation.entity';
import { TripMember } from '../trips/entities/trip-member.entity';
import { ItineraryItem } from '../itinerary/entities/itinerary-item.entity';
import { EventsService } from '../events/events.service';

describe('RulesService', () => {
  let service: RulesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
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
          provide: getRepositoryToken(RuleSet),
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
          provide: getRepositoryToken(Rule),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest
              .fn()
              .mockImplementation((entity) =>
                Promise.resolve({ id: 'test-id', ...entity }),
              ),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(RuleEvaluation),
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
          provide: EventsService,
          useValue: {
            publish: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
