export const qk = {
  workspaces: {
    all: () => ["workspaces"] as const,
    detail: (id: string) => ["workspaces", id] as const,
    trips: (id: string) => ["workspaces", id, "trips"] as const,
  },
  trips: {
    detail: (id: string) => ["trips", id] as const,
    itinerary: (id: string) => ["trips", id, "itinerary"] as const,
    bookings: (id: string) => ["trips", id, "bookings"] as const,
    collab: (id: string) => ["trips", id, "collab"] as const,
    rules: (id: string) => ["trips", id, "rules"] as const,
    audit: (id: string) => ["trips", id, "audit"] as const,
    rebooking: {
      cases: (id: string) => ["trips", id, "rebooking"] as const,
      case: (tripId: string, caseId: string) =>
        ["trips", tripId, "rebooking", caseId] as const,
    },
  },
  notifications: {
    all: () => ["notifications"] as const,
    unread: () => ["notifications", "unread"] as const,
  },
  user: {
    me: () => ["user", "me"] as const,
  },
};
