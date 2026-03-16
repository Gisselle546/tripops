import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRoleGuard } from '../auth/guards/workspace-role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRoleGuard],
  exports: [WorkspaceService, TypeOrmModule],
})
export class WorkspaceModule {}
