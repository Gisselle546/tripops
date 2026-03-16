export default function CollaborationPage() {
  const members = [
    { name: "Sarah Johnson", role: "Owner", initials: "SJ", status: "Online" },
    { name: "John Taylor", role: "Admin", initials: "JT", status: "Online" },
    { name: "Maria Lee", role: "Member", initials: "ML", status: "Away" },
    { name: "Daniel Wong", role: "Member", initials: "DW", status: "Online" },
    { name: "Ariana Ruiz", role: "Member", initials: "AR", status: "Offline" },
  ];

  const activity = [
    {
      user: "Sarah Johnson",
      action: "added a flight",
      target: "Paris Getaway",
      time: "12 min ago",
      initials: "SJ",
    },
    {
      user: "John Taylor",
      action: "updated itinerary",
      target: "Paris Getaway",
      time: "45 min ago",
      initials: "JT",
    },
    {
      user: "Maria Lee",
      action: "uploaded passport document",
      target: "Barcelona Weekend",
      time: "2 hrs ago",
      initials: "ML",
    },
    {
      user: "Daniel Wong",
      action: "confirmed hotel booking",
      target: "Tokyo Conference",
      time: "Yesterday",
      initials: "DW",
    },
  ];

  const comments = [
    {
      user: "Sarah Johnson",
      initials: "SJ",
      time: "10:14 AM",
      text: "I added the new Air France option for May 15. Can @John Taylor review the price before we confirm?",
    },
    {
      user: "John Taylor",
      initials: "JT",
      time: "10:22 AM",
      text: "Looks good to me. The fare is lower than the previous one, and the arrival time works better.",
    },
    {
      user: "Maria Lee",
      initials: "ML",
      time: "10:40 AM",
      text: "I also uploaded the travel insurance PDF. @Sarah Johnson please check if we need anything else.",
    },
  ];

  const mentions = [
    {
      tag: "@John Taylor",
      note: "mentioned in flight review comment",
      time: "Just now",
    },
    {
      tag: "@Sarah Johnson",
      note: "mentioned in insurance follow-up",
      time: "5 min ago",
    },
    {
      tag: "@Maria Lee",
      note: "mentioned in itinerary dinner update",
      time: "1 hr ago",
    },
  ];

  const roleTone: Record<string, string> = {
    Owner: "bg-blue-100 text-blue-700",
    Admin: "bg-violet-100 text-violet-700",
    Member: "bg-slate-100 text-slate-700",
  };

  const statusTone: Record<string, string> = {
    Online: "bg-emerald-500",
    Away: "bg-amber-400",
    Offline: "bg-slate-300",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Collaboration
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                People Working on the Trip
              </h1>
              <p className="mt-2 text-slate-500">
                Members, activity, discussion, and mentions in one place.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Invite Member
              </button>
              <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200">
                Start Discussion
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.2fr_0.7fr]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Members</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Trip Team
                  </div>
                </div>
                <button className="text-sm text-blue-600">Manage</button>
              </div>

              <div className="mt-5 space-y-3">
                {members.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {member.initials}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${statusTone[member.status]}`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {member.status}
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
              <div className="text-sm text-slate-500">Mentions</div>
              <div className="text-2xl font-bold tracking-tight">
                @user Notifications
              </div>
              <div className="mt-5 space-y-3">
                {mentions.map((mention) => (
                  <div
                    key={mention.tag + mention.note}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="font-semibold text-blue-700">
                      {mention.tag}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {mention.note}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {mention.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Comments</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Discussion Thread
                  </div>
                </div>
                <button className="text-sm text-blue-600">Reply</button>
              </div>

              <div className="mt-5 space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.user + comment.time}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                        {comment.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold text-slate-900">
                            {comment.user}
                          </div>
                          <div className="text-xs text-slate-400">
                            {comment.time}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-sm text-slate-500">Add comment</div>
                <textarea
                  className="mt-3 min-h-30 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none"
                  placeholder="Write an update, ask a question, or mention a teammate with @name..."
                />
                <div className="mt-4 flex justify-end">
                  <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Activity feed</div>
                  <div className="text-2xl font-bold tracking-tight">
                    Recent Updates
                  </div>
                </div>
                <button className="text-sm text-blue-600">View all</button>
              </div>

              <div className="mt-5 space-y-4">
                {activity.map((item) => (
                  <div
                    key={item.user + item.action}
                    className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                      {item.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">
                          {item.user}
                        </span>{" "}
                        {item.action} in{" "}
                        <span className="font-medium">{item.target}</span>
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
              <div className="text-sm text-slate-500">
                Quick collaboration tools
              </div>
              <div className="text-2xl font-bold tracking-tight">Actions</div>
              <div className="mt-5 grid gap-3">
                {[
                  "Invite teammate",
                  "Assign owner",
                  "Share update",
                  "Open mentions",
                ].map((action) => (
                  <button
                    key={action}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-medium text-slate-700"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
