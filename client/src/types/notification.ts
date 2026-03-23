export type NotifactionType =
  | "MENTION"
  | "COMMENT"
  | "PROPOSAL"
  | "VOTE"
  | "BOOKING_UPDATED"
  | "REBOOKING_OPTIONS_READY"
  | "REBOOKING_DECIDED"
  | "REBOOKING_APPLIED"
  | "TRIP_CREATED"
  | "ITINERARY_UPDATED"
  | "RULES_VIOLATION"
  | "REMINDER"
  | "SYSTEM";

export type NotificationChannel = "IN_APP" | "EMAIL";

export interface Notification {
  id: string;
  recipientUserId: string;
  type: NotifactionType;
  channel: NotificationChannel;
  title: string;
  body?: string;
  link?: string;
  tripId?: string;
  actorUserId?: string;
  meta?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}
