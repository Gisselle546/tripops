import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspaceService } from './workspace.service';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: getRepositoryToken(Workspace),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
              getOne: jest.fn().mockResolvedValue(null),
            }),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn().mockImplementation((dto) => dto),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
