import Sidebar from "@/components/ui/layout/Sidebar";
import Topbar from "@/components/ui/layout/Topbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TripOps",
  description: "Collaborative trip planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          {/* Persistent sidebar */}
          <aside className="border-r border-border">
            <Sidebar />
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <header className="sticky top-0 z-40 ">
              <Topbar />
            </header>

            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
