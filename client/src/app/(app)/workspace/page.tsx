import { Metadata } from "next";

export const metadata: Metadata = {
  title: "workspace",
  description: "workspace management",
};

export default function WorkspacePage() {
  const workspace = {
    name: "Paris Gateway",
    owner: "Sarah Johnson",
    description:
      "Team workspace for shared itineraries, bookings, and travel planning.",
    stats: [
      { label: "Active Trips", value: "4" },
      { label: "Members", value: "8" },
      { label: "Pending Invites", value: "2" },
    ],
    members: [
      { name: "Sarah Johnson", role: "Owner", initials: "SJ" },
      { name: "James Thompson", role: "Admin", initials: "JT" },
      { name: "Maria Lee", role: "Member", initials: "ML" },
      { name: "Daniel Wong", role: "Member", initials: "DW" },
      { name: "Ariana Ruiz", role: "Member", initials: "AR" },
    ],
  };

  const trips = [
    {
      id: 1,
      name: "Paris Getaway",
      dates: "May 15 – May 20",
      status: "Planning",
      members: ["SJ", "JT", "ML"],
      image:
        "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1200&q=80",
      note: "Museum planning, hotel shortlisted, flights pending approval.",
    },
    {
      id: 2,
      name: "Barcelona Weekend",
      dates: "Jun 6 – Jun 9",
      status: "Confirmed",
      members: ["SJ", "AR"],
      image:
        "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
      note: "Flights confirmed, hotel booked, team dinner added.",
    },
    {
      id: 3,
      name: "Tokyo Conference",
      dates: "Jul 11 – Jul 18",
      status: "Completed",
      members: ["SJ", "DW", "ML"],
      image:
        "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
      note: "Post-trip wrap-up and shared notes available.",
    },
  ];

  const tools = [
    {
      title: "Invite Member",
      description: "Add teammates or guests to this workspace.",
    },
    {
      title: "Permissions",
      description: "Manage who can edit trips, bookings, and docs.",
    },
    {
      title: "Workspace Settings",
      description: "Update branding, defaults, and workspace rules.",
    },
  ];

  const statusTone: Record<string, string> = {
    Planning: "bg-amber-100 text-amber-800 border-amber-200",
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Completed: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const roleTone: Record<string, string> = {
    Owner: "bg-blue-100 text-blue-700",
    Admin: "bg-violet-100 text-violet-700",
    Member: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
          <div className="relative h-64 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80"
              alt={workspace.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-slate-950/55 via-slate-900/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="text-white">
                  <div className="text-sm uppercase tracking-[0.2em] text-white/75">
                    Workspace
                  </div>
                  <h1 className="mt-2 text-5xl font-bold tracking-tight">
                    {workspace.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-white/85">
                    {workspace.description}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {workspace.members.slice(0, 5).map((member) => (
                        <div
                          key={member.name}
                          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white/15 text-sm font-semibold backdrop-blur"
                        >
                          {member.initials}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm text-white/85">
                      Owner:{" "}
                      <span className="font-semibold text-white">
                        {workspace.owner}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {workspace.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white backdrop-blur"
                    >
                      <div className="text-xs uppercase tracking-wide text-white/70">
                        {stat.label}
                      </div>
                      <div className="mt-1 text-2xl font-bold">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Trips in this workspace
                </h2>
                <p className="mt-1 text-slate-500">
                  Shared trips that belong to {workspace.name}.
                </p>
              </div>
              <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200">
                + New Workspace Trip
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative h-64 md:h-full">
                      <img
                        src={trip.image}
                        alt={trip.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-slate-950/50 via-slate-900/10 to-transparent" />
                      <div className="absolute left-5 top-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur ${statusTone[trip.status]}`}
                        >
                          {trip.status}
                        </span>
                      </div>
                      <div className="absolute bottom-5 left-5 text-white">
                        <h3 className="text-3xl font-bold tracking-tight">
                          {trip.name}
                        </h3>
                        <p className="mt-1 text-white/85">{trip.dates}</p>
                      </div>
                    </div>

                    <div className="p-5 lg:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-slate-500">
                            Workspace trip
                          </div>
                          <div className="mt-1 text-xl font-semibold text-slate-900">
                            Shared planning overview
                          </div>
                        </div>
                        <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          Open Trip
                        </button>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {trip.note}
                      </p>

                      <div className="mt-5">
                        <div className="text-sm font-medium text-slate-900">
                          Members on this trip
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {trip.members.map((member) => (
                              <div
                                key={member}
                                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-semibold text-blue-700"
                              >
                                {member}
                              </div>
                            ))}
                          </div>
                          <div className="text-sm text-slate-500">
                            {trip.members.length} collaborators assigned
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-400">
                            Status
                          </div>
                          <div className="mt-1 font-semibold">
                            {trip.status}
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-400">
                            Dates
                          </div>
                          <div className="mt-1 font-semibold">{trip.dates}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-xs uppercase tracking-wide text-slate-400">
                            Workspace
                          </div>
                          <div className="mt-1 font-semibold">
                            {workspace.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Members panel</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Workspace Members
                  </div>
                </div>
                <button className="text-sm text-blue-600">Manage</button>
              </div>

              <div className="mt-5 space-y-3">
                {workspace.members.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {member.initials}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${roleTone[member.role]}`}
                    >
                      {member.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Workspace tools</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Manage workspace
              </div>
              <div className="mt-5 space-y-3">
                {tools.map((tool) => (
                  <button
                    key={tool.title}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-white"
                  >
                    <div className="font-semibold text-slate-900">
                      {tool.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {tool.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Workspace owner</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Leadership
              </div>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                    SJ
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      Sarah Johnson
                    </div>
                    <div className="text-sm text-slate-500">
                      Workspace Owner
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
