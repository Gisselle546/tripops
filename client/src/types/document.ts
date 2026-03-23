export type DocumentCategory =
  | "BOOKINGS"
  | "INSURANCE"
  | "IDS"
  | "ITINERARIES"
  | "OTHER";

export interface TripDocument {
  id: string;
  tripId: string;
  name: string;
  category: DocumentCategory;
  fileType: string | null;
  storageKey: string;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
}
