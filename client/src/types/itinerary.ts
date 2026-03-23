export type ItineraryItemType =
  | "FLIGHT"
  | "HOTEL"
  | "ACTIVITY"
  | "RESTAURANT"
  | "TRANSPORT"
  | "NOTE"
  | "OTHER";

export type ItineraryItemStatus =
  | "FLIGHT"
  | "HOTEL"
  | "ACTIVITY"
  | "RESTAURANT"
  | "TRANSPORT"
  | "NOTE"
  | "OTHER"
  | "CANCELLED"
  | "DELAYED"
  | "COMPLETED";

export interface ItineraryItem {
  id: string;
  tripId: string;
  dayId?: string | null;
  type: ItineraryItemType;
  status: ItineraryItemStatus;
  title: string;
  startsAt?: string | null;
  endsAt?: string | null;
  locationName?: string | null;
  address?: string | null;
  lat?: number;
  lng?: number;
  estimatedCost?: number;
  bookingId?: string | null;
  notes?: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  date: string;
  dayIndex: number;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  days: ItineraryDay[];
  unassigned: ItineraryItem[];
  unassignedItems: ItineraryItem[];
}
