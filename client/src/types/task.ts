export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Task {
  id: string;
  tripId: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  dueDate?: string | null;
  assigneeUserId?: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
