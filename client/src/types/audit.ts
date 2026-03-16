export interface AuditLog {
  id: string;
  tripId: string;
  workspaceId?: string | null;
  actorUserId: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}
