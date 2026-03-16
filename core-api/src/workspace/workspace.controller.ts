import {
  Body,
  Controller,
  Get,
  Param,
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
import type { AuthUser } from '../auth/types/auth-user';

@Controller('workspaces')
@UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // No workspace role needed — user is *creating* the workspace (becomes owner)
  @Post()
  create(@Req() req: { user: AuthUser }, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(req.user.userId, dto);
  }

  // No workspace role needed — service scopes to user's memberships already
  @Get()
  listMine(@Req() req: { user: AuthUser }) {
    return this.workspaceService.listMyWorkspaces(req.user.userId);
  }

  // Any workspace member (GUEST and above) can view the workspace
  @RequiredWorkspaceRole(WorkspaceRole.GUEST)
  @Get(':workspaceId')
  getOne(
    @Req() req: { user: AuthUser },
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspaceService.getWorkspaceById(req.user.userId, workspaceId);
  }
}
