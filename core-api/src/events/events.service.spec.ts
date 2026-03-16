import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OutboxEvent } from './entities/outbox-event.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(OutboxEvent),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockImplementation((entity) => ({
              id: 'test-id',
              ...entity,
            })),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            emitAsync: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
