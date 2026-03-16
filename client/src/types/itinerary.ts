export type ItineraryItemType =
  | "FLIGHT"
  | "HOTEL"
  | "ACTIVITY"
  | "RESTAURANT"
  | "TRANSPORT"
  | "NOTE";

export type ItineraryItemStatus = "IDEA" | "PLANNED" | "BOOKED" | "CANCELED";

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
  bookingId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  id: string;
  tripId: string;
  date: string; // ISO date string
  dayIndex?: number | null;
  items: ItineraryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  days: ItineraryDay[];
  unassigned: ItineraryItem[];
}
