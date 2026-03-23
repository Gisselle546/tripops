import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import {
  WorkspaceMember,
  WorkspaceRole,
} from './entities/workspace-member.entity';
import { User } from '../users/entities/user.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspacesRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly membersRepo: Repository<WorkspaceMember>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  private toDto(w: Workspace) {
    return {
      id: w.id,
      name: w.name,
      description: w.description ?? undefined,
      coverImage: w.coverImage ?? undefined,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    };
  }

  async createWorkspace(userId: string, dto: CreateWorkspaceDto) {
    const workspace = await this.workspacesRepo.save(
      this.workspacesRepo.create({
        name: dto.name,
        description: dto.description,
        coverImage: dto.coverImage,
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

  async listMembers(userId: string, workspaceId: string) {
    // Ensure requester is in the workspace
    const membership = await this.membersRepo.findOne({
      where: { workspaceId, userId },
    });
    if (!membership)
      throw new ForbiddenException('Not a member of this workspace.');

    const members = await this.membersRepo.find({
      where: { workspaceId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });

    return members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      role: m.role,
      user: m.user
        ? {
            id: m.user.id,
            name: m.user.fullName ?? m.user.email,
            email: m.user.email,
          }
        : undefined,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  }

  // ---- Update workspace ----

  async updateWorkspace(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspaceDto,
  ) {
    await this.assertRole(userId, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    await this.workspacesRepo.update(workspaceId, dto);
    const updated = await this.workspacesRepo.findOneByOrFail({
      id: workspaceId,
    });
    return this.toDto(updated);
  }

  // ---- Invite member ----

  async inviteMember(
    userId: string,
    workspaceId: string,
    dto: InviteMemberDto,
  ) {
    await this.assertRole(userId, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const targetUser = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!targetUser)
      throw new NotFoundException(
        'No user found with that email. They need to sign up first.',
      );

    const existing = await this.membersRepo.findOne({
      where: { workspaceId, userId: targetUser.id },
    });
    if (existing)
      throw new ConflictException(
        'User is already a member of this workspace.',
      );

    const member = await this.membersRepo.save(
      this.membersRepo.create({
        workspaceId,
        userId: targetUser.id,
        role: dto.role ?? WorkspaceRole.MEMBER,
      }),
    );

    return {
      id: member.id,
      workspaceId: member.workspaceId,
      userId: member.userId,
      role: member.role,
      user: {
        id: targetUser.id,
        name: targetUser.fullName ?? targetUser.email,
        email: targetUser.email,
      },
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // ---- Update member role ----

  async updateMemberRole(
    userId: string,
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ) {
    await this.assertRole(userId, workspaceId, [WorkspaceRole.OWNER]);

    const member = await this.membersRepo.findOne({
      where: { id: memberId, workspaceId },
      relations: ['user'],
    });
    if (!member) throw new NotFoundException('Member not found.');
    if (member.role === WorkspaceRole.OWNER)
      throw new BadRequestException('Cannot change the owner role.');

    member.role = role;
    await this.membersRepo.save(member);

    return {
      id: member.id,
      workspaceId: member.workspaceId,
      userId: member.userId,
      role: member.role,
      user: member.user
        ? {
            id: member.user.id,
            name: member.user.fullName ?? member.user.email,
            email: member.user.email,
          }
        : undefined,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  }

  // ---- Remove member ----

  async removeMember(userId: string, workspaceId: string, memberId: string) {
    await this.assertRole(userId, workspaceId, [
      WorkspaceRole.OWNER,
      WorkspaceRole.ADMIN,
    ]);

    const member = await this.membersRepo.findOne({
      where: { id: memberId, workspaceId },
    });
    if (!member) throw new NotFoundException('Member not found.');
    if (member.role === WorkspaceRole.OWNER)
      throw new BadRequestException('Cannot remove the workspace owner.');

    await this.membersRepo.remove(member);
    return { ok: true };
  }

  // ---- Role assertion helper ----

  private async assertRole(
    userId: string,
    workspaceId: string,
    allowedRoles: WorkspaceRole[],
  ) {
    const membership = await this.membersRepo.findOne({
      where: { workspaceId, userId },
    });
    if (!membership)
      throw new ForbiddenException('Not a member of this workspace.');
    if (!allowedRoles.includes(membership.role))
      throw new ForbiddenException('Insufficient workspace permissions.');
    return membership;
  }
}
