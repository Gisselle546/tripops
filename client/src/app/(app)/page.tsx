"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTripStore } from "@/stores/trip-store";
import { useTrips } from "@/hooks/use-trips";
import { useNotifications } from "@/hooks/use-notifications";
import { useRouter } from "next/navigation";
import { coverStyle } from "@/lib/cover-images";
import type { Trip } from "@/types/trip";

export default function Dashboard() {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { setActiveTrip } = useTripStore();
  const router = useRouter();

  const { data: trips, isLoading: tripsLoading } = useTrips(
    activeWorkspaceId ?? "",
  );

  const { data: notifications } = useNotifications(10);

  function handleTripClick(trip: Trip) {
    setActiveTrip(trip.id);
    router.push("/workspace");
  }

  if (!activeWorkspaceId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-xl font-semibold text-slate-600">
            No workspace selected
          </div>
          <div className="mt-2 text-sm">
            <button
              onClick={() => router.push("/workspaces")}
              className="text-blue-600"
            >
              Select a workspace
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusTone: Record<string, string> = {
    Planning: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  // Derive simple status from trip dates
  function getTripStatus(trip: Trip): string {
    const now = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (now > end) return "Completed";
    if (now >= start && now <= end) return "Confirmed";
    return "Planning";
  }

  // Build metrics from real data
  const activeTrips =
    trips?.filter((t) => getTripStatus(t) !== "Completed") ?? [];
  const planningCount =
    trips?.filter((t) => getTripStatus(t) === "Planning").length ?? 0;
  const confirmedCount =
    trips?.filter((t) => getTripStatus(t) === "Confirmed").length ?? 0;

  const nextTrip = [...(trips ?? [])]
    .filter((t) => new Date(t.startDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )[0];

  const metrics = [
    {
      label: "Active Trips",
      value: String(activeTrips.length),
      note: `${planningCount} planning · ${confirmedCount} confirmed`,
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Upcoming Trips",
      value: String(planningCount),
      note: nextTrip ? `${nextTrip.title} next` : "None upcoming",
      tone: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Total Trips",
      value: String(trips?.length ?? 0),
      note: "All workspace trips",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Next Departure",
      value: nextTrip
        ? new Date(nextTrip.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "—",
      note: nextTrip ? nextTrip.destination : "No upcoming trips",
      tone: "bg-violet-50 text-violet-700 border-violet-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <section className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              All Trips
            </h1>
            <p className="mt-1 text-slate-500">
              Overview of all your personal and workspace travel plans.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              Personal
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              Workspace
            </button>
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
              Archived
            </button>
            <button
              onClick={() => router.push("/trips/new")}
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
            >
              + New Trip
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`rounded-3xl border bg-white p-5 shadow-sm ${metric.tone}`}
            >
              <div className="text-sm font-medium opacity-80">
                {metric.label}
              </div>
              <div className="mt-2 text-3xl font-bold tracking-tight">
                {metric.value}
              </div>
              <div className="mt-1 text-sm opacity-75">{metric.note}</div>
            </div>
          ))}
        </div>

        {/* Loading skeleton */}
        {tripsLoading && (
          <div className="space-y-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm animate-pulse"
              >
                <div className="h-56 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-48 rounded bg-slate-200" />
                  <div className="h-4 w-32 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!tripsLoading && trips?.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl mb-4">🌍</div>
            <div className="text-xl font-semibold text-slate-600">
              Create your first trip
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Start planning a new adventure by clicking &quot;+ New Trip&quot;
              above.
            </p>
          </div>
        )}

        {/* Trip cards + Activity feed */}
        {!tripsLoading && trips && trips.length > 0 && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
            {/* Trip list */}
            <div className="space-y-5">
              {trips.map((trip) => {
                const status = getTripStatus(trip);
                const startFormatted = new Date(
                  trip.startDate,
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const endFormatted = new Date(trip.endDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                );
                const dateRange = `${startFormatted} – ${endFormatted}`;

                return (
                  <div
                    key={trip.id}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        {/* Trip visual header */}
                        <div
                          className="relative h-56 w-full overflow-hidden"
                          style={coverStyle(trip.title, trip.coverImage)}
                        >
                          <div className="absolute left-5 top-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${statusTone[status] ?? statusTone.Planning}`}
                            >
                              {status}
                            </span>
                          </div>
                          <div className="absolute bottom-5 left-5 text-white">
                            <h2 className="text-4xl font-bold tracking-tight">
                              {trip.title}
                            </h2>
                            <p className="mt-1 text-white/85">{dateRange}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-100 p-5">
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-base">
                              📍
                            </span>
                            <div>
                              <div className="text-xs uppercase tracking-wide text-slate-400">
                                Destination
                              </div>
                              <div className="font-semibold text-slate-900">
                                {trip.destination}
                              </div>
                            </div>
                            {trip.budgetTarget && (
                              <div className="ml-auto text-right">
                                <div className="text-xs uppercase tracking-wide text-slate-400">
                                  Budget
                                </div>
                                <div className="font-semibold text-slate-900">
                                  ${(trip.budgetTarget / 100).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="border-l border-slate-100 bg-slate-50/70 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-slate-500">
                              Trip details
                            </div>
                            <div className="mt-1 text-xl font-semibold text-slate-900">
                              Overview
                            </div>
                          </div>
                          <button
                            onClick={() => handleTripClick(trip)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            Open
                          </button>
                        </div>

                        <div className="mt-5 space-y-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              Dates
                            </div>
                            <div className="mt-1 font-semibold">
                              {dateRange}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              Destination
                            </div>
                            <div className="mt-1 font-semibold">
                              {trip.destination}
                            </div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              Status
                            </div>
                            <div className="mt-1 font-semibold">{status}</div>
                          </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleTripClick(trip)}
                            className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                          >
                            View Trip
                          </button>
                          <button
                            onClick={() => router.push("/workspace")}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                          >
                            Workspace
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Activity feed */}
            <div className="space-y-5">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">
                      Recent activity
                    </div>
                    <div className="text-2xl font-bold tracking-tight">
                      Activity Feed
                    </div>
                  </div>
                  <button
                    onClick={() => router.push("/collaboration")}
                    className="text-sm text-blue-600"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-5 space-y-4">
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 8).map((notif) => (
                      <div
                        key={notif.id}
                        className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          🔔
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900">
                            {notif.title}
                          </div>
                          {notif.body && (
                            <div className="text-sm text-slate-700">
                              {notif.body}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-slate-400">
                            {new Date(notif.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 text-center py-6">
                      No recent activity.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">Quick actions</div>
                <div className="mt-1 text-2xl font-bold tracking-tight">
                  Start fast
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {[
                    { label: "Create trip", href: "/trips/new" },
                    { label: "Import booking", href: "/bookings/new" },
                    { label: "Invite collaborators", href: "/collaboration" },
                    { label: "Upload docs", href: "/documents/new" },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.href)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-medium text-slate-700 hover:bg-white"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm text-slate-500">
                  Upcoming departures
                </div>
                <div className="mt-1 text-2xl font-bold tracking-tight">
                  Next flights
                </div>
                <div className="mt-5 space-y-3">
                  {trips && trips.length > 0 ? (
                    [...trips]
                      .filter((t) => new Date(t.startDate) > new Date())
                      .sort(
                        (a, b) =>
                          new Date(a.startDate).getTime() -
                          new Date(b.startDate).getTime(),
                      )
                      .slice(0, 3)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                        >
                          {new Date(t.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {t.destination} · {t.title}
                        </div>
                      ))
                  ) : (
                    <div className="text-sm text-slate-400 text-center py-4">
                      No upcoming departures.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
