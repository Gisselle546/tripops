export interface Trip {
  id: string;
  workspaceId: string;
  title: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  budgetTarget?: number; // cents
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
