"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import Image from "next/image";

type NavItem = { href: string; label: string; icon: string };

export default function Sidebar() {
  const pathname = usePathname() || "/";
  const [collapsed, setCollapsed] = useState(false);

  const nav: NavItem[] = useMemo(
    () => [
      { href: "/", label: "All Trips", icon: "🏝️" },
      { href: "/workspace", label: "workspaces", icon: "🏢" },
      { href: "/itinerary", label: "Itinerary", icon: "🗺️" },
      { href: "/bookings", label: "Bookings", icon: "✈️" },
      { href: "/collaboration", label: "Collaboration", icon: "💬" },
      { href: "/tasks", label: "Tasks", icon: "✅" },
      { href: "/documents", label: "Documents", icon: "📁" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ],
    [],
  );

  return (
    <aside
      className={[
        "sticky top-0 h-screen shrink-0",
        "flex flex-col text-white",
        "transition-[width] duration-200",
        collapsed ? "w-20" : "w-64",
        // background matches the screenshot: deep blue vertical gradient
        "bg-linear-to-b from-sidebar-2 to-sidebar",
        "dark:from-sidebar-2-dark dark:to-sidebar-dark",
        // subtle inner border + depth
        "shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]",
      ].join(" ")}
      aria-label="Primary"
    >
      {/* Top brand */}
      <div className="px-4 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image src="/tripops-logo.svg" alt="TripOps" width={36} height={36} />

          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="text-white font-semibold text-lg truncate">
                TripOps
              </div>
              <div className="text-xs text-white/75 -mt-0.5 truncate">
                Plan together
              </div>
            </div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={[
            "hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg",
            "hover:bg-white/10 active:translate-y-px transition",
            "outline-none focus-visible:ring-4 focus-visible:ring-white/20",
          ].join(" ")}
        >
          {collapsed ? "➡" : "⬅"}
        </button>
      </div>

      {/* Workspace quick switch */}
      <div className="px-3 py-3 border-t border-white/10">
        {!collapsed ? (
          <div className="rounded-xl bg-white/8 px-3 py-2.5 border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">
                  Paris Getaway
                </div>
                <div className="text-xs text-white/70 truncate">
                  Active workspace
                </div>
              </div>
              <button
                className={[
                  "shrink-0 text-xs font-semibold px-2.5 py-1 rounded-md",
                  "bg-white/10 hover:bg-white/14 transition",
                  "border border-white/10",
                ].join(" ")}
              >
                Switch
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-10 h-10 rounded-xl bg-white/10 border border-white/10 grid place-items-center text-sm font-semibold">
            P
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-3 px-2 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {nav.map((n) => {
            const active = isActive(pathname, n.href);

            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                title={collapsed ? n.label : undefined}
                className={[
                  "group relative flex items-center gap-3",
                  "rounded-xl px-3 py-2.5",
                  "transition",
                  active
                    ? "bg-white/14 text-white"
                    : "text-white/80 hover:text-white hover:bg-white/10",
                  collapsed ? "justify-center" : "",
                ].join(" ")}
              >
                {/* Left accent bar (only when expanded; looks like the screenshot highlight) */}
                {!collapsed && (
                  <span
                    className={[
                      "absolute left-1 top-1/2 -translate-y-1/2",
                      "h-6 w-1 rounded-full",
                      active ? "bg-white/85" : "bg-transparent",
                    ].join(" ")}
                  />
                )}

                {/* Icon */}
                <span
                  className={[
                    "text-lg leading-none",
                    active
                      ? "opacity-100"
                      : "opacity-90 group-hover:opacity-100",
                  ].join(" ")}
                >
                  {n.icon}
                </span>

                {/* Label */}
                {!collapsed && (
                  <span className="font-medium truncate">{n.label}</span>
                )}

                {/* Subtle right chevron indicator (expanded only, active only) */}
                {!collapsed && active && (
                  <span className="ml-auto text-white/70 text-xs">›</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom CTA + profile */}
      <div className="px-3 pb-4 border-t border-white/10">
        <button
          className={[
            "w-full mt-3",
            "rounded-xl py-2.5 font-semibold",
            "bg-primary hover:bg-primary-600",
            "shadow-[0_10px_25px_rgba(35,118,207,0.25)]",
            "active:translate-y-px transition",
            "outline-none focus-visible:ring-4 focus-visible:ring-white/20",
          ].join(" ")}
        >
          {!collapsed ? "New Trip" : "＋"}
        </button>

        <div
          className={[
            "mt-3 rounded-xl px-2 py-2",
            "flex items-center gap-3",
            "hover:bg-white/8 transition",
          ].join(" ")}
        >
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 grid place-items-center font-semibold text-sm">
            SJ
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm text-white font-medium truncate">
                Sarah Johnson
              </div>
              <div className="text-xs text-white/70 truncate">Owner</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}
