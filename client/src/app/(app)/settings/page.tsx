export default function SettingsPage() {
  const profile = {
    name: "Sarah Johnson",
    email: "sarah.johnson@tripops.com",
    photo: "SJ",
  };

  const notifications = [
    { label: "Trip updates", enabled: true },
    { label: "Booking alerts", enabled: true },
    { label: "Collaboration mentions", enabled: false },
    { label: "Document activity", enabled: true },
  ];

  const members = [
    { name: "Sarah Johnson", role: "Owner", initials: "SJ" },
    { name: "John Taylor", role: "Admin", initials: "JT" },
    { name: "Maria Lee", role: "Member", initials: "ML" },
  ];

  const permissions = [
    { label: "Manage trips", value: "Owner, Admin" },
    { label: "Edit bookings", value: "Owner, Admin, Member" },
    { label: "Invite members", value: "Owner, Admin" },
    { label: "Delete workspace docs", value: "Owner only" },
  ];

  const integrations = [
    {
      name: "Google Calendar",
      status: "Connected",
      description: "Sync trip dates and itinerary events.",
    },
    {
      name: "Airline APIs",
      status: "Pending",
      description: "Track live flight details and booking changes.",
    },
    {
      name: "Maps",
      status: "Connected",
      description: "Show routes, places, and pinned trip locations.",
    },
  ];

  const statusTone: Record<string, string> = {
    Connected: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
              Settings
            </div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Account & Workspace Configuration
            </h1>
            <p className="mt-2 text-slate-500">
              Manage your profile, notifications, permissions, and integrations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Profile</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Your Account
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">
                  {profile.photo}
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {profile.name}
                  </div>
                  <div className="text-sm text-slate-500">{profile.email}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Edit profile
                </button>
                <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700">
                  Change photo
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Notifications</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Alerts & Updates
              </div>
              <div className="mt-5 space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-slate-500">
                        Email and in-app notification
                      </div>
                    </div>
                    <div
                      className={`h-7 w-12 rounded-full p-1 transition ${item.enabled ? "bg-blue-600" : "bg-slate-300"}`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white transition ${item.enabled ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Workspace settings</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Members & Permissions
              </div>
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3">
                  {members.map((member) => (
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
                      <button className="text-sm text-blue-600">Edit</button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="text-sm text-slate-500">
                        {permission.label}
                      </div>
                      <div className="mt-1 font-semibold text-slate-900">
                        {permission.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm text-slate-500">Integrations</div>
              <div className="mt-1 text-2xl font-bold tracking-tight">
                Connected Services
              </div>
              <div className="mt-5 space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {integration.name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {integration.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[integration.status]}`}
                      >
                        {integration.status}
                      </span>
                      <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
