import { SetMetadata } from '@nestjs/common';
import { WorkspaceRole } from '../../workspace/entities/workspace-member.entity';

export const REQUIRED_WORKSPACE_ROLE_KEY = 'requiredWorkspaceRole';

/**
 * Declare the **minimum** workspace role needed to access a route.
 *
 * The hierarchy is:  OWNER > ADMIN > MEMBER > GUEST
 *
 * If you write `@RequiredWorkspaceRole(WorkspaceRole.MEMBER)`, then
 * MEMBER, ADMIN, and OWNER are all allowed — GUEST is not.
 *
 * Usage:
 *   @RequiredWorkspaceRole(WorkspaceRole.MEMBER)
 *   @UseGuards(JwtAuthGuard, WorkspaceRoleGuard)
 */
export const RequiredWorkspaceRole = (role: WorkspaceRole) =>
  SetMetadata(REQUIRED_WORKSPACE_ROLE_KEY, role);
