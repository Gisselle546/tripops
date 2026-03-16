import { Test, TestingModule } from '@nestjs/testing';
import { RebookingController } from './rebooking.controller';
import { RebookingService } from './rebooking.service';

describe('RebookingController', () => {
  let controller: RebookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RebookingController],
      providers: [
        {
          provide: RebookingService,
          useValue: {
            listCases: jest.fn().mockResolvedValue([]),
            getCase: jest.fn().mockResolvedValue({}),
            simulateDisruption: jest.fn().mockResolvedValue({}),
            generateOptions: jest.fn().mockResolvedValue([]),
            decide: jest.fn().mockResolvedValue({}),
            applyDecision: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<RebookingController>(RebookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
