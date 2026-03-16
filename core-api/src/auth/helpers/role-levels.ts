import { TripRole } from '../../trips/entities/trip-member.entity';
import { WorkspaceRole } from '../../workspace/entities/workspace-member.entity';

// ─── Trip role levels ────────────────────────────────────────────────
// OWNER implies COLLABORATOR implies VIEWER
const TRIP_ROLE_LEVEL: Record<TripRole, number> = {
  [TripRole.VIEWER]: 1,
  [TripRole.COLLABORATOR]: 2,
  [TripRole.OWNER]: 3,
};

// ─── Workspace role levels ───────────────────────────────────────────
// OWNER implies ADMIN implies MEMBER implies GUEST
const WORKSPACE_ROLE_LEVEL: Record<WorkspaceRole, number> = {
  [WorkspaceRole.GUEST]: 1,
  [WorkspaceRole.MEMBER]: 2,
  [WorkspaceRole.ADMIN]: 3,
  [WorkspaceRole.OWNER]: 4,
};

/**
 * Returns true if the user's trip role is at least as powerful as the
 * required role.
 *
 * Example:
 *   hasTripRoleAtLeast(TripRole.OWNER, TripRole.COLLABORATOR) → true
 *   hasTripRoleAtLeast(TripRole.VIEWER, TripRole.COLLABORATOR) → false
 */
export function hasTripRoleAtLeast(
  userRole: TripRole,
  requiredRole: TripRole,
): boolean {
  return TRIP_ROLE_LEVEL[userRole] >= TRIP_ROLE_LEVEL[requiredRole];
}

/**
 * Returns true if the user's workspace role is at least as powerful as
 * the required role.
 */
export function hasWorkspaceRoleAtLeast(
  userRole: WorkspaceRole,
  requiredRole: WorkspaceRole,
): boolean {
  return WORKSPACE_ROLE_LEVEL[userRole] >= WORKSPACE_ROLE_LEVEL[requiredRole];
}
