import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { TripRoleGuard } from '../auth/guards/trip-role.guard';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { TripMember } from './entities/trip-member.entity';
import { WorkspaceMember } from '../workspace/entities/workspace-member.entity';

describe('TripsController', () => {
  let controller: TripsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: {
            createTrip: jest.fn(),
            listTripsInWorkspace: jest.fn(),
            getTripById: jest.fn(),
          },
        },
        TripRoleGuard,
        WorkspaceRoleGuard,
        Reflector,
        {
          provide: getRepositoryToken(TripMember),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(WorkspaceMember),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<TripsController>(TripsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
