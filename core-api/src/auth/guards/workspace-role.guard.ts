import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkspaceMember,
  WorkspaceRole,
} from '../../workspace/entities/workspace-member.entity';
import { REQUIRED_WORKSPACE_ROLE_KEY } from '../decorators/required-workspace-role.decorator';
import { hasWorkspaceRoleAtLeast } from '../helpers/role-levels';

/**
 * Guard that enforces workspace-level role permissions.
 *
 * How it works:
 *  1. Reads the required minimum role from `@RequiredWorkspaceRole(...)`.
 *  2. Extracts `:workspaceId` from the route params.
 *  3. Looks up the user's membership in `workspace_members`.
 *  4. Compares role levels: userLevel >= requiredLevel.
 *
 * If no `@RequiredWorkspaceRole()` decorator is present the guard passes.
 */
@Injectable()
export class WorkspaceRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(WorkspaceMember)
    private readonly membersRepo: Repository<WorkspaceMember>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    // 1. Check if decorator was applied
    const requiredRole = this.reflector.getAllAndOverride<
      WorkspaceRole | undefined
    >(REQUIRED_WORKSPACE_ROLE_KEY, [ctx.getHandler(), ctx.getClass()]);

    // No decorator → nothing to enforce
    if (!requiredRole) return true;

    // 2. Get user + workspaceId from request
    const req = ctx.switchToHttp().getRequest();
    const userId: string | undefined = req.user?.userId;
    const workspaceId: string | undefined = req.params?.workspaceId;

    if (!userId) {
      throw new ForbiddenException('Authentication required.');
    }
    if (!workspaceId) {
      throw new NotFoundException(
        'Workspace ID not found in route params. Make sure the route has a :workspaceId parameter.',
      );
    }

    // 3. Look up membership
    const membership = await this.membersRepo.findOne({
      where: { workspaceId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace.');
    }

    // 4. Level check
    if (!hasWorkspaceRoleAtLeast(membership.role, requiredRole)) {
      throw new ForbiddenException(
        `This action requires at least the ${requiredRole} role in this workspace.`,
      );
    }

    // Attach membership to request so handlers can use it
    req.workspaceMembership = membership;
    return true;
  }
}
