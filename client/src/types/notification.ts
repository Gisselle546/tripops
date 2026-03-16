export type NotificationKind =
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELED"
  | "TRIP_INVITE"
  | "ITINERARY_UPDATED"
  | "PROPOSAL_DECIDED"
  | "DISRUPTION_SIMULATED";

export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind;
  tripId?: string | null;
  workspaceId?: string | null;
  payload: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationPage {
  items: Notification[];
  total: number;
  unreadCount: number;
}
