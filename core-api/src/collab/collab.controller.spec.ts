import { Test, TestingModule } from '@nestjs/testing';
import { CollabController } from './collab.controller';
import { CollabService } from './collab.service';

describe('CollabController', () => {
  let controller: CollabController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollabController],
      providers: [
        {
          provide: CollabService,
          useValue: {
            listComments: jest.fn().mockResolvedValue([]),
            createComment: jest.fn().mockResolvedValue({}),
            listProposals: jest.fn().mockResolvedValue([]),
            createProposal: jest.fn().mockResolvedValue({}),
            addOption: jest.fn().mockResolvedValue({}),
            vote: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<CollabController>(CollabController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
