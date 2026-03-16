export default function BookingsPage() {
  const categories = [
    {
      title: "Flights",
      icon: "✈️",
      items: [
        {
          name: "Air France AF091",
          detail: "Miami (MIA) → Paris (CDG)",
          meta: "May 15 · 7:45 PM departure · 9:20 AM arrival",
          price: "$820",
          status: "Confirmed",
        },
        {
          name: "Iberia IB262",
          detail: "Barcelona (BCN) → Miami (MIA)",
          meta: "Jun 9 · 1:10 PM departure · 5:45 PM arrival",
          price: "$640",
          status: "Pending",
        },
      ],
    },
    {
      title: "Hotels",
      icon: "🏨",
      items: [
        {
          name: "Le Meurice Hotel",
          detail: "228 Rue de Rivoli, Paris",
          meta: "May 15 – May 20 · Deluxe room",
          price: "$1,150",
          status: "Confirmed",
        },
        {
          name: "Hotel Pulitzer",
          detail: "Carrer de Bergara 8, Barcelona",
          meta: "Jun 6 – Jun 9 · Standard room",
          price: "$590",
          status: "Cancelled",
        },
      ],
    },
    {
      title: "Transport",
      icon: "🚆",
      items: [
        {
          name: "Train to Versailles",
          detail: "RER C round trip",
          meta: "May 17 · 9:00 AM departure",
          price: "$24",
          status: "Confirmed",
        },
        {
          name: "Rental Car",
          detail: "Compact automatic · Barcelona Airport",
          meta: "Jun 6 – Jun 9",
          price: "$180",
          status: "Pending",
        },
        {
          name: "Airport Taxi",
          detail: "CDG Airport to Le Meurice Hotel",
          meta: "May 15 · 10:15 AM",
          price: "$58",
          status: "Confirmed",
        },
      ],
    },
    {
      title: "Activities",
      icon: "🎟️",
      items: [
        {
          name: "Louvre Guided Tour",
          detail: "Small group ticket",
          meta: "May 16 · 9:30 AM",
          price: "$92",
          status: "Confirmed",
        },
        {
          name: "Musée d’Orsay Pass",
          detail: "Museum admission ticket",
          meta: "May 16 · 2:00 PM",
          price: "$34",
          status: "Pending",
        },
      ],
    },
  ];

  const summary = [
    {
      label: "Total Reservations",
      value: "9",
      tone: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Confirmed",
      value: "5",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Pending",
      value: "3",
      tone: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      label: "Cancelled",
      value: "1",
      tone: "bg-rose-50 text-rose-700 border-rose-200",
    },
  ];

  const statusTone: Record<string, string> = {
    Confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Cancelled: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Bookings
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                All Reservations
              </h1>
              <p className="mt-2 text-slate-500">
                Flights, hotels, transport, and activities for this trip.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                All
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Flights
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                Hotels
              </button>
              <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200">
                + Add Booking
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          {summary.map((item) => (
            <div
              key={item.label}
              className={`rounded-3xl border bg-white p-5 shadow-sm ${item.tone}`}
            >
              <div className="text-sm font-medium opacity-80">{item.label}</div>
              <div className="mt-2 text-3xl font-bold tracking-tight">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {categories.map((category) => (
            <section
              key={category.title}
              className="rounded-[30px] border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                    {category.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {category.title}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {category.items.length} reservations
                    </p>
                  </div>
                </div>
                <button className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  Manage
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 lg:grid-cols-2">
                {category.items.map((item) => (
                  <div
                    key={item.name + item.meta}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                          {item.name}
                        </h3>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {item.detail}
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {item.meta}
                        </div>
                      </div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[item.status]}`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-slate-400">
                          Price
                        </div>
                        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                          {item.price}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                          View
                        </button>
                        <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
