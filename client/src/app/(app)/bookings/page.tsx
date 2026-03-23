"use client";

import Link from "next/link";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useBookings } from "@/hooks/use-bookings";
import type { Booking, BookingType, BookingStatus } from "@/types/booking";

const TYPE_LABELS: Record<BookingType, { title: string; icon: string }> = {
  FLIGHT: { title: "Flights", icon: "✈️" },
  HOTEL: { title: "Hotels", icon: "🏨" },
  TRAIN: { title: "Train", icon: "🚆" },
  CAR: { title: "Car Rental", icon: "🚗" },
  ACTIVITY: { title: "Activities", icon: "🎟️" },
  RESTAURANT: { title: "Restaurants", icon: "🍽️" },
  OTHER: { title: "Other", icon: "📦" },
};

const STATUS_TONE: Record<BookingStatus, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CANCELED: "bg-rose-100 text-rose-800 border-rose-200",
};

function formatCost(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function groupByType(bookings: Booking[]): Record<BookingType, Booking[]> {
  const groups: Record<string, Booking[]> = {};
  for (const b of bookings) {
    if (!groups[b.type]) groups[b.type] = [];
    groups[b.type].push(b);
  }
  return groups as Record<BookingType, Booking[]>;
}

export default function BookingsPage() {
  const tripId = useActiveTrip();
  const { data: bookings, isLoading } = useBookings(tripId ?? "");

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="text-xl font-semibold text-slate-600">
            No trip selected
          </div>
          <div className="mt-2 text-sm">
            Select a trip from the dashboard to view bookings.
          </div>
        </div>
      </div>
    );
  }

  const allBookings = bookings ?? [];
  const grouped = groupByType(allBookings);

  const confirmedCount = allBookings.filter(
    (b) => b.status === "CONFIRMED",
  ).length;
  const pendingCount = allBookings.filter((b) => b.status === "PENDING").length;
  const canceledCount = allBookings.filter(
    (b) => b.status === "CANCELED",
  ).length;

  const summary = [
    {
      label: "Total Reservations",
      value: String(allBookings.length),
      tone: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Confirmed",
      value: String(confirmedCount),
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Pending",
      value: String(pendingCount),
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Cancelled",
      value: String(canceledCount),
      tone: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Bookings
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                All Reservations
              </h1>
              <p className="mt-2 text-slate-500">
                Flights, hotels, transport, and activities for this trip.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                All
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Flights
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Hotels
              </button>
              <Link
                href="/bookings/new"
                className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
              >
                + Add Booking
              </Link>
            </div>
          </div>
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {summary.map((item) => (
            <div
              key={item.label}
              className={`rounded-3xl border bg-white p-5 shadow-sm ${item.tone}`}
            >
              <div className="text-sm font-medium opacity-80">{item.label}</div>
              <div className="mt-2 text-3xl font-bold tracking-tight">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6 animate-pulse"
              >
                <div className="h-8 w-32 rounded bg-slate-200 mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-40 rounded-3xl bg-slate-100" />
                  <div className="h-40 rounded-3xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && allBookings.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="text-5xl mb-4">🎫</div>
            <div className="text-xl font-semibold text-slate-600">
              No bookings yet
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Add your first flight, hotel, or activity booking.
            </p>
          </div>
        )}

        {/* Grouped booking categories */}
        {!isLoading &&
          (Object.keys(TYPE_LABELS) as BookingType[])
            .filter((type) => grouped[type]?.length > 0)
            .map((type) => {
              const meta = TYPE_LABELS[type];
              const items = grouped[type];

              return (
                <section
                  key={type}
                  className="rounded-[30px] border border-slate-200 bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                        {meta.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {meta.title}
                        </h2>
                        <p className="text-sm text-slate-500">
                          {items.length} reservation
                          {items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                      Manage
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
                    {items.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                              {booking.providerName}
                            </h3>
                            {booking.confirmationCode && (
                              <div className="mt-1 text-sm font-medium text-slate-700">
                                Confirmation: {booking.confirmationCode}
                              </div>
                            )}
                            <div className="mt-2 text-sm text-slate-500">
                              {formatDate(booking.startsAt)}
                              {booking.endsAt &&
                                ` – ${formatDate(booking.endsAt)}`}
                            </div>
                          </div>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_TONE[booking.status]}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-slate-400">
                              Price
                            </div>
                            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                              {formatCost(booking.totalCost)}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                              View
                            </button>
                            <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
      </div>
    </div>
  );
}
