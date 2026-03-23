export const qk = {
  workspaces: {
    all: () => ["workspaces"] as const,
    detail: (id: string) => ["workspaces", id] as const,
    trips: (id: string) => ["workspaces", id, "trips"] as const,
    members: (id: string) => ["workspaces", id, "members"] as const,
  },
  trips: {
    detail: (id: string) => ["trips", id] as const,
    itinerary: (id: string) => ["trips", id, "itinerary"] as const,
    bookings: (id: string) => ["trips", id, "bookings"] as const,
    tasks: (id: string) => ["trips", id, "tasks"] as const,
    documents: (id: string) => ["trips", id, "documents"] as const,
    comments: (id: string) => ["trips", id, "comments"] as const, // ADD
    proposals: (id: string) => ["trips", id, "proposals"] as const, // ADD
    rules: (id: string) => ["trips", id, "rules"] as const,
    audit: (id: string) => ["trips", id, "audit"] as const,
    members: (id: string) => ["trips", id, "members"] as const,
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
