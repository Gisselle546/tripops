export default function DocumentsPage() {
  const categories = ["Bookings", "Insurance", "IDs", "Itineraries"];

  const files = [
    {
      name: "Passport - Sarah Johnson.pdf",
      category: "IDs",
      type: "Passport",
      size: "2.1 MB",
      uploaded: "Apr 22",
    },
    {
      name: "AirFrance Flight Ticket.pdf",
      category: "Bookings",
      type: "Ticket",
      size: "1.4 MB",
      uploaded: "Apr 25",
    },
    {
      name: "Travel Insurance Policy.pdf",
      category: "Insurance",
      type: "Policy",
      size: "3.6 MB",
      uploaded: "Apr 28",
    },
    {
      name: "Paris Itinerary Overview.pdf",
      category: "Itineraries",
      type: "Itinerary",
      size: "1.9 MB",
      uploaded: "May 1",
    },
    {
      name: "Schengen Visa Scan.pdf",
      category: "IDs",
      type: "Visa",
      size: "900 KB",
      uploaded: "Apr 29",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Category Filters */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                Documents
              </div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight">
                Travel Files
              </h1>
              <p className="mt-2 text-slate-500">
                Store passports, tickets, visas, and travel documents.
              </p>
            </div>

            <button className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200">
              Upload File
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {files.map((file) => (
            <div
              key={file.name}
              className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">{file.category}</div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {file.type}
                </span>
              </div>

              <div className="mt-3 font-semibold text-slate-900">
                {file.name}
              </div>

              <div className="mt-2 text-sm text-slate-500">
                {file.size} • Uploaded {file.uploaded}
              </div>

              {/* Preview box */}
              <div className="mt-4 h-32 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
                PDF Preview
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  Open
                </button>
                <button className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                  Download
                </button>
                <button className="flex-1 rounded-xl bg-blue-600 text-white px-3 py-2 text-sm">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
