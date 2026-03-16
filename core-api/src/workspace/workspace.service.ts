import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceRole,
} from './entities/workspace-member.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspacesRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly membersRepo: Repository<WorkspaceMember>,
  ) {}

  private toDto(w: Workspace) {
    return {
      id: w.id,
      name: w.name,
      description: w.description ?? undefined,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    };
  }

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.workspacesRepo.save(
      this.workspacesRepo.create({
        name: dto.name,
        description: dto.description,
      }),
    );

    await this.membersRepo.save(
      this.membersRepo.create({
        workspaceId: workspace.id,
        userId,
        role: WorkspaceRole.OWNER,
      }),
    );

    return this.toDto(workspace);
  }

  async listMyWorkspaces(userId: string) {
    const rows = await this.workspacesRepo
      .createQueryBuilder('w')
      .innerJoin(
        WorkspaceMember,
        'wm',
        'wm.workspaceId = w.id AND wm.userId = :userId',
        { userId },
      )
      .orderBy('w.createdAt', 'DESC')
      .getMany();

    return rows.map((w) => this.toDto(w));
  }

  async getWorkspaceById(userId: string, workspaceId: string) {
    const workspace = await this.workspacesRepo
      .createQueryBuilder('w')
      .innerJoin(
        WorkspaceMember,
        'wm',
        'wm.workspaceId = w.id AND wm.userId = :userId',
        { userId },
      )
      .where('w.id = :workspaceId', { workspaceId })
      .getOne();

    if (!workspace) throw new NotFoundException('Workspace not found.');
    return this.toDto(workspace);
  }
}
