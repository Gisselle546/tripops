export default function Dashboard() {
  const trips = [
    {
      id: 1,
      name: "Paris Getaway",
      dates: "May 15 – May 20",
      status: "Planning",
      participants: ["SJ", "JT", "ML"],
      image:
        "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1200&q=80",
      timeline: [
        "10:00 AM Arrival in Paris",
        "1:00 PM Hotel check-in",
        "7:30 PM Dinner near the Seine",
      ],
    },
    {
      id: 2,
      name: "Barcelona Weekend",
      dates: "Jun 6 – Jun 9",
      status: "Confirmed",
      participants: ["SJ", "AR"],
      image:
        "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
      timeline: [
        "9:00 AM Flight to BCN",
        "2:00 PM Gothic Quarter walk",
        "8:00 PM Tapas reservation",
      ],
    },
    {
      id: 3,
      name: "Tokyo Conference",
      dates: "Jul 11 – Jul 18",
      status: "Completed",
      participants: ["SJ", "DW", "PK", "LM"],
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      timeline: [
        "Conference badge pickup",
        "Keynote at 11:00 AM",
        "Team dinner in Shibuya",
      ],
    },
  ];

  const activity = [
    {
      user: "Sarah Johnson",
      action: "added a flight to Paris Getaway",
      time: "12 min ago",
    },
    {
      user: "James Thompson",
      action: "updated the itinerary for Barcelona Weekend",
      time: "1 hr ago",
    },
    { user: "Maria Lee", action: "joined Tokyo Conference", time: "3 hrs ago" },
    {
      user: "Sarah Johnson",
      action: "confirmed hotel booking for Paris Getaway",
      time: "Yesterday",
    },
  ];

  const metrics = [
    {
      label: "Active Trips",
      value: "2",
      note: "1 planning · 1 confirmed",
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Upcoming Trips",
      value: "1",
      note: "Paris starts in 5 days",
      tone: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Total Booking Cost",
      value: "$1,480",
      note: "Flights + hotels booked",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Upcoming Departure",
      value: "May 15",
      note: "AirFrance · MIA → CDG",
      tone: "bg-violet-50 text-violet-700 border-violet-200",
    },
  ];

  const statusTone = {
    Planning: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <section className="space-y-6">
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
            <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200">
              + New Trip
            </button>
          </div>
        </div>

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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <div className="relative h-56 w-full overflow-hidden">
                      <img
                        src={trip.image}
                        alt={trip.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/45 via-slate-900/10 to-transparent" />
                      <div className="absolute left-5 top-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${statusTone[trip.status as keyof typeof statusTone]}`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5 text-white">
                        <h2 className="text-4xl font-bold tracking-tight">
                          {trip.name}
                        </h2>
                        <p className="mt-1 text-white/85">{trip.dates}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 p-5">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="font-medium text-slate-900">
                          Participants
                        </div>
                        <div className="flex -space-x-2">
                          {trip.participants.map((p) => (
                            <div
                              key={p}
                              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-semibold text-blue-700"
                            >
                              {p}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                        {trip.timeline.map((item) => (
                          <div
                            key={item}
                            className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                          >
                            {item}
                          </div>
                        ))}
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
                      <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                        Open
                      </button>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">
                          Dates
                        </div>
                        <div className="mt-1 font-semibold">{trip.dates}</div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">
                          Bookings
                        </div>
                        <div className="mt-1 font-semibold">
                          Flights · Hotel · Activities
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-xs uppercase tracking-wide text-slate-400">
                          Workspace
                        </div>
                        <div className="mt-1 font-semibold">
                          Paris Gateway Team
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                        View Trip
                      </button>
                      <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                        Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Recent activity</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Activity Feed
                  </div>
                </div>
                <button className="text-sm text-blue-600">View all</button>
              </div>
              <div className="mt-5 space-y-4">
                {activity.map((item) => (
                  <div
                    key={`${item.user}-${item.action}`}
                    className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {item.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {item.user}
                        </span>{" "}
                        {item.action}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Quick actions</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Start fast
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  "Create trip",
                  "Import booking",
                  "Invite collaborators",
                  "Upload docs",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-medium text-slate-700 hover:bg-white"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Upcoming departures</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Next flights
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "May 15 · AirFrance · MIA → CDG",
                  "Jun 6 · Iberia · MIA → BCN",
                  "Jul 11 · ANA · JFK → HND",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
