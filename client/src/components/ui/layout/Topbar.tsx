"use client";

import Image from "next/image";
import { useState } from "react";

export default function Topbar() {
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-30">
      {/* Topbar container */}
      <div className="tp-topbar">
        <div className="mx-auto w-full max-w-350 px-4 sm:px-6">
          <div className="flex h-14 items-center gap-4">
            {/* Left: brand (optional on desktop) */}
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
            <div className="flex-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("search", q);
                }}
              >
                <div className="relative max-w-180">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search trips, places, bookings..."
                    className={[
                      // base input look
                      "tp-input",
                      // extra polish
                      "pr-10 text-sm",
                    ].join(" ")}
                    aria-label="Search"
                  />

                  <button
                    type="submit"
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
                </div>
              </form>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <IconButton ariaLabel="Calendar" badge={0}>
                📅
              </IconButton>
              <IconButton ariaLabel="Notifications" badge={3}>
                🔔
              </IconButton>

              {/* Divider */}
              <div className="hidden sm:block h-7 w-px bg-border dark:bg-border-dark mx-1" />

              {/* User */}
              <button
                className={[
                  "flex items-center gap-3 rounded-lg px-2 py-1.5",
                  "hover:bg-black/5 dark:hover:bg-white/8 transition",
                  "outline-none focus-visible:ring-4",
                  "focus-visible:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
                ].join(" ")}
              >
                <div className="text-right hidden sm:block leading-tight">
                  <div className="text-sm font-medium text-text dark:text-text-dark">
                    Sarah Johnson
                  </div>
                  <div className="text-xs text-(--color-text-muted) dark:text-text-muted-dark">
                    Owner
                  </div>
                </div>

                <div
                  className={[
                    "w-9 h-9 rounded-full grid place-items-center font-semibold text-sm",
                    "bg-surface-2 border border-border",
                    "dark:bg-surface-2-dark dark:border-border-dark",
                  ].join(" ")}
                >
                  SJ
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: subtle divider under the topbar like the screenshot */}
      <div className="h-px bg-border dark:bg-border-dark" />
    </header>
  );
}

function IconButton({
  children,
  ariaLabel,
  badge,
}: {
  children: React.ReactNode;
  ariaLabel: string;
  badge?: number;
}) {
  return (
    <button
      aria-label={ariaLabel}
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
