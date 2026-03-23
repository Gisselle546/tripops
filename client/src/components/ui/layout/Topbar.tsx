"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useTripStore } from "@/stores/trip-store";
import { useTrips } from "@/hooks/use-trips";
import { useUnreadCount } from "@/hooks/use-notifications";
import { useLogout } from "@/hooks/use-auth";

export default function Topbar() {
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const { data: trips } = useTrips(activeWorkspaceId ?? "");
  const { data: unreadCount } = useUnreadCount();
  const logout = useLogout();

  const displayName = user?.fullName || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Filter trips by search query
  const searchResults = q.trim()
    ? (trips ?? []).filter(
        (t) =>
          t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.destination.toLowerCase().includes(q.toLowerCase()),
      )
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30">
      <div className="tp-topbar">
        <div className="mx-auto w-full max-w-350 px-4 sm:px-6">
          <div className="flex h-14 items-center gap-4">
            {/* Left: brand */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <Image
                src="/tripops-logo.svg"
                width={28}
                height={28}
                alt="TripOps"
              />
              <div className="text-sm font-semibold text-text dark:text-text-dark">
                TripOps
              </div>
            </div>

            {/* Search */}
            <div className="flex-1" ref={searchRef}>
              <div className="relative max-w-180">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => q.trim() && setShowResults(true)}
                  placeholder="Search trips, places, bookings..."
                  className="tp-input pr-10 text-sm w-full"
                  aria-label="Search"
                />
                <button
                  type="button"
                  aria-label="Submit search"
                  className={[
                    "absolute right-1 top-1/2 -translate-y-1/2",
                    "h-8 w-8 grid place-items-center rounded-md",
                    "text-(--color-text-muted) hover:text-text",
                    "hover:bg-black/5 dark:hover:bg-white/8",
                    "transition",
                  ].join(" ")}
                >
                  🔎
                </button>

                {/* Search results dropdown */}
                {showResults && q.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400">
                        No results for &ldquo;{q}&rdquo;
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        {searchResults.map((trip) => (
                          <button
                            key={trip.id}
                            onClick={() => {
                              useTripStore.getState().setActiveTrip(trip.id);
                              router.push("/itinerary");
                              setShowResults(false);
                              setQ("");
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left transition"
                          >
                            <span className="text-lg">🏝️</span>
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {trip.title}
                              </div>
                              <div className="text-xs text-slate-400">
                                {trip.destination}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <IconButton
                ariaLabel="Calendar"
                badge={0}
                onClick={() => router.push("/itinerary")}
              >
                📅
              </IconButton>
              <IconButton
                ariaLabel="Notifications"
                badge={
                  typeof unreadCount === "object"
                    ? (unreadCount?.count ?? 0)
                    : (unreadCount ?? 0)
                }
                onClick={() => router.push("/settings")}
              >
                🔔
              </IconButton>

              {/* Divider */}
              <div className="hidden sm:block h-7 w-px bg-border dark:bg-border-dark mx-1" />

              {/* User dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu((s) => !s)}
                  className={[
                    "flex items-center gap-3 rounded-lg px-2 py-1.5",
                    "hover:bg-black/5 dark:hover:bg-white/8 transition",
                    "outline-none focus-visible:ring-4",
                    "focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
                  ].join(" ")}
                >
                  <div className="text-right hidden sm:block leading-tight">
                    <div className="text-sm font-medium text-text dark:text-text-dark">
                      {displayName}
                    </div>
                    <div className="text-xs text-(--color-text-muted) dark:text-text-muted-dark">
                      {user?.email ?? ""}
                    </div>
                  </div>

                  <div
                    className={[
                      "w-9 h-9 rounded-full grid place-items-center font-semibold text-sm",
                      "bg-surface-2 border border-border",
                      "dark:bg-surface-2-dark dark:border-border-dark",
                    ].join(" ")}
                  >
                    {initials}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-50">
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      ⚙️ Settings
                    </button>
                    <div className="h-px bg-slate-100" />
                    <button
                      onClick={() => {
                        logout.mutate();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      🚪 Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-border dark:bg-border-dark" />
    </header>
  );
}

function IconButton({
  children,
  ariaLabel,
  badge,
  onClick,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      className={[
        "relative h-9 w-9 grid place-items-center rounded-lg",
        "border border-border bg-surface",
        "hover:bg-black/5 dark:hover:bg-white/8 transition",
        "dark:border-border-dark dark:bg-surface-dark",
        "outline-none focus-visible:ring-4",
        "focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]",
      ].join(" ")}
    >
      {children}

      {!!badge && badge > 0 && (
        <span
          className={[
            "absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1",
            "grid place-items-center rounded-full text-[11px] font-semibold",
            "bg-danger text-white",
          ].join(" ")}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
