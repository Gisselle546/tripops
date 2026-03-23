"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useRegister } from "@/hooks/use-auth";

const launchBenefits = [
  {
    title: "Launch workspaces faster",
    body: "Set up your operations hub with team access, traveler flows, and disruption handling in one place.",
  },
  {
    title: "Coordinate from day one",
    body: "Create a shared source of truth for bookings, itinerary changes, and live stakeholder updates.",
  },
  {
    title: "Designed for scale",
    body: "Start with a single team and grow into a cross-functional operations environment without rebuilding.",
  },
];

const trustSignals = [
  "Role-based workspace access",
  "Refresh-session security",
  "Real-time operational context",
];

function getErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Unable to create your account right now. Please try again.";
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return (
    error.message ||
    "Unable to create your account right now. Please try again."
  );
}

export default function RegisterPage() {
  const register = useRegister();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const errorMessage =
    passwordError ||
    (register.isError ? getErrorMessage(register.error) : null);

  function submitRegistration(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setPasswordError(null);
    register.mutate({
      fullName: fullName.trim() || undefined,
      email: email.trim(),
      password,
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(67,156,224,0.22),transparent_28%),linear-gradient(160deg,#f7fbff_0%,#edf2fb_48%,#dce6f4_100%)] text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-10 h-80 w-80 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute right-8 top-0 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-stretch px-4 py-6 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-8">
        <section className="order-2 flex items-center justify-center py-8 lg:order-1 lg:pr-8">
          <div className="w-full max-w-lg rounded-4xl border border-white/70 bg-white/84 p-6 shadow-[0_30px_70px_rgba(148,163,184,0.26)] backdrop-blur-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Create workspace access
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Start with TripOps
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Create your account to manage bookings, coordinate changes,
                  and run operations from one control layer.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-right sm:block">
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">
                  Setup
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Under 1 minute
                </p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={submitRegistration}>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="fullName"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className="tp-input h-12 border-white bg-white/70"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Alex Morgan"
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="tp-input h-12 border-white bg-white/70"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ops@tripops.app"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-sm font-medium text-sky-700 transition hover:text-sky-900"
                      onClick={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="tp-input h-12 border-white bg-white/70"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) {
                        setPasswordError(null);
                      }
                    }}
                    placeholder="Create a password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="confirmPassword"
                  >
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="tp-input h-12 border-white bg-white/70"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (passwordError) {
                        setPasswordError(null);
                      }
                    }}
                    placeholder="Repeat password"
                    required
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600">
                Use at least one strong password you do not reuse across
                operational systems.
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={register.isPending}
                className="tp-btn tp-btn-primary h-12 w-full rounded-2xl text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {register.isPending ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                Already have access?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-sky-700 transition hover:text-sky-900"
                >
                  Sign in
                </Link>
              </div>
              <p className="text-slate-500">
                Your session stays refresh-protected.
              </p>
            </div>
          </div>
        </section>

        <section className="order-1 flex flex-col justify-between rounded-4xl border border-slate-900/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,255,255,0.44))] px-6 py-8 text-slate-900 shadow-[0_25px_65px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-8 lg:order-2 lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/75 px-4 py-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Operations Onboarding
            </div>

            <div className="mt-10 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-700/80">
                Built for modern trip teams
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Build the workspace your operations team actually wants to open.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                From traveler messaging to rebooking decisions, TripOps gives
                your team one place to coordinate the messy middle of travel
                operations.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {launchBenefits.map((benefit) => (
                <article
                  key={benefit.title}
                  className="rounded-3xl border border-white/80 bg-white/68 p-4 shadow-sm backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <h3 className="text-sm font-semibold tracking-wide text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {benefit.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-600">
            {trustSignals.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 backdrop-blur-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
