export type BookingType =
  | "FLIGHT"
  | "HOTEL"
  | "TRAIN"
  | "CAR"
  | "ACTIVITY"
  | "RESTAURANT"
  | "OTHER";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELED";

export interface Booking {
  id: string;
  tripId: string;
  type: BookingType;
  status: BookingStatus;
  providerName: string;
  confirmationCode?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  totalCost?: number | null; // cents
  notes?: string | null;
  details?: Record<string, unknown> | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}
