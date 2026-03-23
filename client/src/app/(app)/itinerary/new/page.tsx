"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useCreateDay, useCreateItineraryItem } from "@/hooks/use-itinerary";
import type { ItineraryItemType } from "@/types/itinerary";

const ITEM_TYPES: { value: ItineraryItemType; label: string; icon: string }[] =
  [
    { value: "FLIGHT", label: "Flight", icon: "✈️" },
    { value: "HOTEL", label: "Hotel", icon: "🏨" },
    { value: "ACTIVITY", label: "Activity", icon: "🎟️" },
    { value: "RESTAURANT", label: "Restaurant", icon: "🍽️" },
    { value: "TRANSPORT", label: "Transport", icon: "🚌" },
    { value: "NOTE", label: "Note", icon: "📝" },
    { value: "OTHER", label: "Other", icon: "📦" },
  ];

type Tab = "item" | "day";

export default function NewItineraryPage() {
  const router = useRouter();
  const tripId = useActiveTrip();
  const createItem = useCreateItineraryItem(tripId ?? "");
  const createDay = useCreateDay(tripId ?? "");

  const [tab, setTab] = useState<Tab>("item");

  // Item fields
  const [type, setType] = useState<ItineraryItemType>("ACTIVITY");
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [notes, setNotes] = useState("");

  // Day fields
  const [dayDate, setDayDate] = useState("");
  const [dayIndex, setDayIndex] = useState("");

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <p className="text-slate-500">Select a trip first.</p>
      </div>
    );
  }

  function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createItem.mutate(
      {
        type,
        title: title.trim(),
        locationName: locationName.trim() || undefined,
        address: address.trim() || undefined,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
        estimatedCost: estimatedCost
          ? Math.round(parseFloat(estimatedCost) * 100)
          : undefined,
        notes: notes.trim() || undefined,
      },
      { onSuccess: () => router.push("/itinerary") },
    );
  }

  function handleCreateDay(e: React.FormEvent) {
    e.preventDefault();
    if (!dayDate) return;
    createDay.mutate(
      {
        date: dayDate,
        dayIndex: dayIndex ? parseInt(dayIndex, 10) : undefined,
      },
      { onSuccess: () => router.push("/itinerary") },
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/itinerary")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Itinerary
          </button>
          <h1 className="text-4xl font-bold tracking-tight">
            Add to Itinerary
          </h1>
          <p className="mt-2 text-slate-500">
            Add a new day or an activity / reservation to your trip plan.
          </p>

          {/* Tab Switch */}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setTab("item")}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                tab === "item"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              New Item
            </button>
            <button
              type="button"
              onClick={() => setTab("day")}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
                tab === "day"
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              New Day
            </button>
          </div>
        </div>

        {/* Item Form */}
        {tab === "item" && (
          <form
            onSubmit={handleCreateItem}
            className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
          >
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type
              </label>
              <div className="flex flex-wrap gap-2">
                {ITEM_TYPES.map((it) => (
                  <button
                    key={it.value}
                    type="button"
                    onClick={() => setType(it.value)}
                    className={`rounded-xl border px-4 py-2.5 text-sm flex items-center gap-2 ${
                      type === it.value
                        ? "border-blue-300 bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span>{it.icon}</span> {it.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <input
                required
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Visit Eiffel Tower"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Eiffel Tower"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Champ de Mars, Paris"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            {/* Times */}
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
                Estimated Cost ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
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
                placeholder="Any details..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/itinerary")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createItem.isPending || !title.trim()}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {createItem.isPending ? "Adding…" : "Add Item"}
              </button>
            </div>
          </form>
        )}

        {/* Day Form */}
        {tab === "day" && (
          <form
            onSubmit={handleCreateDay}
            className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date *
              </label>
              <input
                required
                type="date"
                value={dayDate}
                onChange={(e) => setDayDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Day Number (optional)
              </label>
              <input
                type="number"
                min="1"
                value={dayIndex}
                onChange={(e) => setDayIndex(e.target.value)}
                placeholder="Auto-assigned if empty"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push("/itinerary")}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDay.isPending || !dayDate}
                className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {createDay.isPending ? "Adding…" : "Add Day"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
