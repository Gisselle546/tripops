import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { WorkspaceMember } from './entities/workspace-member.entity';

describe('WorkspaceController', () => {
  let controller: WorkspaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceController],
      providers: [
        {
          provide: WorkspaceService,
          useValue: {
            createWorkspace: jest.fn(),
            listMyWorkspaces: jest.fn(),
            getWorkspaceById: jest.fn(),
          },
        },
        WorkspaceRoleGuard,
        Reflector,
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<WorkspaceController>(WorkspaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
