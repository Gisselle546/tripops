"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useTrip } from "@/hooks/use-trips";
import { useItinerary } from "@/hooks/use-itinerary";

const TripMap = dynamic(() => import("@/components/trip-map"), { ssr: false });

export default function ItineraryPage() {
  const tripId = useActiveTrip();
  const { data: trip, isLoading: tripLoading } = useTrip(tripId ?? "");
  const { data: itinerary, isLoading: itinLoading } = useItinerary(
    tripId ?? "",
  );

  const isLoading = tripLoading || itinLoading;

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-xl font-semibold text-slate-600">
            No trip selected
          </div>
          <div className="mt-2 text-sm">
            Select a trip from the dashboard to view its itinerary.
          </div>
        </div>
      </div>
    );
  }

  // Collect all location names for the map sidebar
  const allItems = [
    ...(itinerary?.days?.flatMap((d) => d.items) ?? []),
    ...(itinerary?.unassignedItems ?? []),
  ];
  const pins = allItems
    .map((item) => item.locationName)
    .filter((name): name is string => !!name);
  const uniquePins = [...new Set(pins)];

  const TYPE_TONE: Record<string, string> = {
    FLIGHT: "bg-sky-100 text-sky-700",
    HOTEL: "bg-violet-100 text-violet-700",
    ACTIVITY: "bg-amber-100 text-amber-700",
    RESTAURANT: "bg-rose-100 text-rose-700",
    TRANSPORT: "bg-emerald-100 text-emerald-700",
    NOTE: "bg-slate-100 text-slate-700",
    OTHER: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Trip Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-8 w-56 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-100" />
              </div>
            ) : (
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  {trip?.title ?? "Itinerary"}
                </h1>
                <div className="mt-1 text-slate-500">
                  {trip?.destination ?? ""}
                </div>
                <div className="text-sm text-slate-400">
                  {trip?.startDate && trip?.endDate
                    ? `${new Date(trip.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })} – ${new Date(trip.endDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}`
                    : ""}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/itinerary/new"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                Add Activity
              </Link>
              <Link
                href="/itinerary/new"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                Add Reservation
              </Link>
              <Link
                href="/itinerary/new"
                className="rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm font-semibold"
              >
                Add Note
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
          {/* Timeline */}
          <div className="space-y-5">
            {isLoading && (
              <div className="space-y-5">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 animate-pulse"
                  >
                    <div className="h-6 w-24 rounded bg-slate-200 mb-4" />
                    <div className="space-y-3">
                      <div className="h-12 rounded-2xl bg-slate-100" />
                      <div className="h-12 rounded-2xl bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading &&
              itinerary?.days?.length === 0 &&
              !itinerary?.unassignedItems?.length && (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
                  <div className="text-5xl mb-4">📅</div>
                  <div className="text-xl font-semibold text-slate-600">
                    No itinerary days yet
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Add your first day to start building the itinerary.
                  </p>
                </div>
              )}

            {!isLoading &&
              itinerary?.days?.map((day) => (
                <div
                  key={day.id}
                  className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-500">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          weekday: "short",
                        })}
                      </div>
                      <div className="text-2xl font-bold">
                        Day {day.dayIndex}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {day.items.length === 0 && (
                      <div className="text-sm text-slate-400 py-4 text-center">
                        No items for this day.
                      </div>
                    )}
                    {day.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="text-sm font-semibold text-blue-600">
                            {item.startsAt
                              ? new Date(item.startsAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  },
                                )
                              : "—"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">
                                {item.title}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_TONE[item.type] ?? TYPE_TONE.OTHER}`}
                              >
                                {item.type}
                              </span>
                            </div>
                            {item.locationName && (
                              <div className="text-sm text-slate-500">
                                {item.locationName}
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="text-sm text-blue-600">Edit</button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {/* Unassigned items */}
            {!isLoading &&
              itinerary?.unassignedItems &&
              itinerary.unassignedItems.length > 0 && (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white shadow-sm p-6">
                  <div className="text-sm text-slate-500">Unscheduled</div>
                  <div className="text-2xl font-bold">Unassigned Items</div>
                  <div className="mt-5 space-y-3">
                    {itinerary.unassignedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex gap-4 items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">
                                {item.title}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_TONE[item.type] ?? TYPE_TONE.OTHER}`}
                              >
                                {item.type}
                              </span>
                            </div>
                            {item.locationName && (
                              <div className="text-sm text-slate-500">
                                {item.locationName}
                              </div>
                            )}
                          </div>
                        </div>
                        <button className="text-sm text-blue-600">
                          Assign
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Map preview + Quick add */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5">
              <div className="text-sm text-slate-500">Map preview</div>
              <div className="text-2xl font-bold">Trip locations</div>

              {/* Interactive Leaflet map with geocoded pins */}
              <div className="mt-5 rounded-2xl overflow-hidden h-72 relative border border-slate-200">
                {trip?.destination ? (
                  <TripMap
                    destination={trip.destination}
                    locationNames={uniquePins}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-linear-to-br from-blue-50 to-blue-100 text-slate-400 text-sm">
                    No destination set for this trip.
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                {uniquePins.length === 0 && (
                  <div className="text-sm text-slate-400 text-center py-2">
                    No locations pinned yet.
                  </div>
                )}
                {uniquePins.map((pin, idx) => (
                  <div
                    key={pin}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {pin}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5">
              <div className="text-sm text-slate-500">Quick add</div>
              <div className="text-2xl font-bold">Add to itinerary</div>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/itinerary/new"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
                >
                  Add activity
                </Link>
                <Link
                  href="/itinerary/new"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
                >
                  Add reservation
                </Link>
                <Link
                  href="/itinerary/new"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left"
                >
                  Add note
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
