export interface Workspace {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "GUEST";

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export type TripRole = "OWNER" | "COLLABORATOR" | "VIEWER";

export type TripMemberStatus = "INVITED" | "ACTIVE" | "REMOVED";

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: TripRole;
  status: TripMemberStatus;
  createdAt: string;
  updatedAt: string;
}
