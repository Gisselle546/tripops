export class TripDto {
  id: string;
  workspaceId: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetTarget?: number;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}
