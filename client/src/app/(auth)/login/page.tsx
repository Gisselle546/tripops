"use client";

import Link from "next/link";
import { isAxiosError } from "axios";
import { useState } from "react";
import { useLogin } from "@/hooks/use-auth";

const productPillars = [
  {
    title: "Rebooking control",
    body: "Coordinate schedule changes, disruptions, and traveler updates from one workspace.",
  },
  {
    title: "Shared operations view",
    body: "Keep agents, suppliers, and stakeholders aligned on the same itinerary state.",
  },
  {
    title: "Audit-ready actions",
    body: "Track every decision, handoff, and notification with a clean operational trail.",
  },
];

const credentialHints = [
  "Workspace email",
  "SSO-ready architecture",
  "Secure session refresh",
];

function getErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Unable to sign in right now. Please try again.";
  }

  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return error.message || "Unable to sign in right now. Please try again.";
}

export default function LoginPage() {
  const login = useLogin();
  const [email, setEmail] = useState("demo@tripops.app");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const errorMessage = login.isError ? getErrorMessage(login.error) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate({
      email: email.trim(),
      password,
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(135,181,255,0.42),transparent_32%),linear-gradient(135deg,#f4f8ff_0%,#e8eef8_46%,#dfe6f3_100%)] text-slate-950">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-32 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute -right-16 top-12 h-80 w-80 rounded-full bg-blue-500/18 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/60" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-stretch px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
        <section className="flex flex-col justify-between rounded-4xl border border-white/60 bg-slate-950 px-6 py-8 text-slate-50 shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10 lg:py-10">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium tracking-[0.18em] text-sky-100 uppercase backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-300" />
              TripOps Control Deck
            </div>

            <div className="mt-10 max-w-xl">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-200/80">
                Airline operations platform
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Keep every trip disruption moving without losing the plot.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                Sign in to manage rebookings, coordinate collaborators, and keep
                travelers informed from one operational workspace.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {productPillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-1"
                >
                  <h2 className="text-sm font-semibold tracking-wide text-white">
                    {pillar.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {pillar.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-slate-200/80">
            {credentialHints.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 backdrop-blur-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center py-8 lg:px-8">
          <div className="w-full max-w-lg rounded-4xl border border-white/75 bg-white/82 p-6 shadow-[0_30px_70px_rgba(148,163,184,0.28)] backdrop-blur-xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-700">
                  Welcome back
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  Sign in to TripOps
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Use your workspace credentials to access trips, alerts, and
                  operational workflows.
                </p>
              </div>

              <div className="hidden  rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-right sm:block">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-600">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Secure session
                </p>
              </div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
                  autoComplete="current-password"
                  className="tp-input h-12 border-white bg-white/70"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {errorMessage ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={login.isPending}
                className="tp-btn tp-btn-primary h-12 w-full rounded-2xl text-base disabled:cursor-not-allowed disabled:opacity-70"
              >
                {login.isPending ? "Signing in..." : "Enter workspace"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col">
                New to TripOps?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-sky-700 transition hover:text-sky-900"
                >
                  Create an account
                </Link>
              </div>
              <p className="text-slate-500">
                Protected by refresh-session auth.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
