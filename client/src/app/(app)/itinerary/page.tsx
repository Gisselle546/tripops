export default function ItineraryPage() {
  const trip = {
    name: "Paris Getaway",
    destination: "Paris, France",
    dates: "May 15 – May 20",
  };

  const days = [
    {
      day: "Day 1",
      date: "May 15",
      items: [
        { time: "10:00", title: "Flight arrival", location: "CDG Airport" },
        {
          time: "13:00",
          title: "Hotel check-in",
          location: "Le Meurice Hotel",
        },
        {
          time: "19:30",
          title: "Dinner reservation",
          location: "Le Relais Plaza",
        },
      ],
    },
    {
      day: "Day 2",
      date: "May 16",
      items: [
        { time: "09:30", title: "Tour booking", location: "Louvre Museum" },
        { time: "14:00", title: "Museum visit", location: "Musée d’Orsay" },
      ],
    },
  ];

  const pins = [
    "CDG Airport",
    "Le Meurice Hotel",
    "Le Relais Plaza",
    "Louvre Museum",
    "Musée d’Orsay",
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Trip Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{trip.name}</h1>
              <div className="mt-1 text-slate-500">{trip.destination}</div>
              <div className="text-sm text-slate-400">{trip.dates}</div>
            </div>

            <div className="flex gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                Add Activity
              </button>
              <button className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                Add Reservation
              </button>
              <button className="rounded-2xl bg-blue-600 text-white px-5 py-3 text-sm font-semibold">
                Add Note
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
          {/* Timeline */}
          <div className="space-y-5">
            {days.map((day) => (
              <div
                key={day.day}
                className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{day.date}</div>
                    <div className="text-2xl font-bold">{day.day}</div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {day.items.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="text-sm font-semibold text-blue-600">
                          {item.time}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {item.title}
                          </div>
                          <div className="text-sm text-slate-500">
                            {item.location}
                          </div>
                        </div>
                      </div>

                      <button className="text-sm text-blue-600">Edit</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Map Preview */}
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5">
              <div className="text-sm text-slate-500">Map preview</div>
              <div className="text-2xl font-bold">Trip locations</div>

              <div className="mt-5 rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"
                  className="w-full h-56 object-cover"
                />
              </div>

              <div className="mt-4 space-y-2">
                {pins.map((pin) => (
                  <div
                    key={pin}
                    className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-600"
                  >
                    📍 {pin}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Add */}
            <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5">
              <div className="text-sm text-slate-500">Quick add</div>
              <div className="text-2xl font-bold">Add to itinerary</div>

              <div className="mt-5 grid gap-3">
                <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                  Add activity
                </button>
                <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                  Add reservation
                </button>
                <button className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
                  Add note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
