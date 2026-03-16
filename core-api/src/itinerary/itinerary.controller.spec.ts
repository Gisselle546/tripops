import { Test, TestingModule } from '@nestjs/testing';
import { ItineraryController } from './itinerary.controller';
import { ItineraryService } from './itinerary.service';

describe('ItineraryController', () => {
  let controller: ItineraryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItineraryController],
      providers: [
        {
          provide: ItineraryService,
          useValue: {
            getItinerary: jest.fn().mockResolvedValue({}),
            createDay: jest.fn().mockResolvedValue({}),
            createItem: jest.fn().mockResolvedValue({}),
            updateItem: jest.fn().mockResolvedValue({}),
            deleteItem: jest.fn().mockResolvedValue({ ok: true }),
          },
        },
      ],
    }).compile();

    controller = module.get<ItineraryController>(ItineraryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
