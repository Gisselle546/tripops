"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useCreateBooking } from "@/hooks/use-bookings";
import type { BookingType, BookingStatus } from "@/types/booking";

const BOOKING_TYPES: { value: BookingType; label: string; icon: string }[] = [
  { value: "FLIGHT", label: "Flight", icon: "✈️" },
  { value: "HOTEL", label: "Hotel", icon: "🏨" },
  { value: "TRAIN", label: "Train", icon: "🚆" },
  { value: "CAR", label: "Car Rental", icon: "🚗" },
  { value: "ACTIVITY", label: "Activity", icon: "🎟️" },
  { value: "RESTAURANT", label: "Restaurant", icon: "🍽️" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

export default function NewBookingPage() {
  const router = useRouter();
  const tripId = useActiveTrip();
  const createBooking = useCreateBooking(tripId ?? "");

  const [type, setType] = useState<BookingType>("FLIGHT");
  const [status, setStatus] = useState<BookingStatus>("PENDING");
  const [providerName, setProviderName] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [notes, setNotes] = useState("");

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <p className="text-slate-500">Select a trip first.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!providerName.trim()) return;

    createBooking.mutate(
      {
        type,
        status,
        providerName: providerName.trim(),
        confirmationCode: confirmationCode.trim() || undefined,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        totalCost: totalCost
          ? Math.round(parseFloat(totalCost) * 100)
          : undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => router.push("/bookings") },
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/bookings")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Bookings
          </button>
          <h1 className="text-4xl font-bold tracking-tight">New Booking</h1>
          <p className="mt-2 text-slate-500">
            Add a flight, hotel, or other reservation to your trip.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
        >
          {/* Booking Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Booking Type
            </label>
            <div className="flex flex-wrap gap-2">
              {BOOKING_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  type="button"
                  onClick={() => setType(bt.value)}
                  className={`rounded-xl border px-4 py-2.5 text-sm flex items-center gap-2 ${
                    type === bt.value
                      ? "border-blue-300 bg-blue-50 text-blue-700 font-medium"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span>{bt.icon}</span> {bt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Provider / Vendor *
            </label>
            <input
              required
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g. Air France, Marriott, Hertz"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELED">Canceled</option>
            </select>
          </div>

          {/* Confirmation Code */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmation Code
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Optional"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Starts At
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ends At
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Total Cost ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalCost}
              onChange={(e) => setTotalCost(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any extra details about the booking..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/bookings")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createBooking.isPending || !providerName.trim()}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {createBooking.isPending ? "Creating…" : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
