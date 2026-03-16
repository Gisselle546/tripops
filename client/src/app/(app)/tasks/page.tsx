type TaskStatus = "Pending" | "In Progress" | "Completed";

interface Task {
  title: string;
  assignee: string;
  initials: string;
  due: string;
  status: TaskStatus;
}

export default function TasksPage() {
  const tasks: Task[] = [
    {
      title: "Book flights",
      assignee: "Sarah Johnson",
      initials: "SJ",
      due: "May 10",
      status: "In Progress",
    },
    {
      title: "Reserve hotel",
      assignee: "John Taylor",
      initials: "JT",
      due: "May 11",
      status: "Pending",
    },
    {
      title: "Pack passport",
      assignee: "Maria Lee",
      initials: "ML",
      due: "May 14",
      status: "Pending",
    },
    {
      title: "Buy travel insurance",
      assignee: "Daniel Wong",
      initials: "DW",
      due: "May 12",
      status: "Completed",
    },
  ];

  const kanban = {
    Pending: tasks.filter((t) => t.status === "Pending"),
    "In Progress": tasks.filter((t) => t.status === "In Progress"),
    Completed: tasks.filter((t) => t.status === "Completed"),
  };

  const statusTone: Record<TaskStatus, string> = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Completed: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Tasks
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Trip Preparation Checklist
              </h1>
              <p className="mt-2 text-slate-500">
                Tasks that need to be completed before the trip.
              </p>
            </div>

            <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200">
              + Add Task
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="text-2xl font-bold">Task List</div>
            <div className="flex gap-3">
              <button className="rounded-xl border px-3 py-2 text-sm bg-white">
                List
              </button>
              <button className="rounded-xl border px-3 py-2 text-sm bg-white">
                Kanban
              </button>
              <button className="rounded-xl border px-3 py-2 text-sm bg-white">
                Completed
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.title}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    defaultChecked={task.status === "Completed"}
                  />

                  <div>
                    <div className="font-medium text-slate-900">
                      {task.title}
                    </div>
                    <div className="text-sm text-slate-500">
                      Due: {task.due}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold">
                      {task.initials}
                    </div>
                    <div className="text-sm text-slate-600">
                      {task.assignee}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[task.status]}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(kanban).map((column) => (
            <div
              key={column}
              className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-lg font-bold mb-4">{column}</div>

              <div className="space-y-3">
                {kanban[column as TaskStatus].map((task) => (
                  <div
                    key={task.title}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="font-medium text-slate-900">
                      {task.title}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Due: {task.due}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {task.initials}
                      </div>
                      <div className="text-xs text-slate-500">
                        {task.assignee}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
