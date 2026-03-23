import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';
import { RequiredWorkspaceRole } from '../auth/decorators/required-workspace-role.decorator';
import { WorkspaceRole } from './entities/workspace-member.entity';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import type { AuthUser } from '../auth/types/auth-user';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(@Req() req: { user: AuthUser }, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(req.user.userId, dto);
  }

  @Get()
  listMine(@Req() req: { user: AuthUser }) {
    return this.workspaceService.listMyWorkspaces(req.user.userId);
  }

  @RequiredWorkspaceRole(WorkspaceRole.GUEST)
  @Get(':workspaceId')
  getById(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.getWorkspaceById(req.user.userId, workspaceId);
  }

  @RequiredWorkspaceRole(WorkspaceRole.ADMIN)
  @Patch(':workspaceId')
  update(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.updateWorkspace(
      req.user.userId,
      workspaceId,
      dto,
    );
  }

  @RequiredWorkspaceRole(WorkspaceRole.GUEST)
  @Get(':workspaceId/members')
  listMembers(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.listMembers(req.user.userId, workspaceId);
  }

  @RequiredWorkspaceRole(WorkspaceRole.ADMIN)
  @Post(':workspaceId/members')
  inviteMember(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaceService.inviteMember(
      req.user.userId,
      workspaceId,
      dto,
    );
  }

  @RequiredWorkspaceRole(WorkspaceRole.OWNER)
  @Patch(':workspaceId/members/:memberId/role')
  updateMemberRole(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaceService.updateMemberRole(
      req.user.userId,
      workspaceId,
      memberId,
      dto.role,
    );
  }

  @RequiredWorkspaceRole(WorkspaceRole.ADMIN)
  @Delete(':workspaceId/members/:memberId')
  removeMember(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.workspaceService.removeMember(
      req.user.userId,
      workspaceId,
      memberId,
    );
  }
}
