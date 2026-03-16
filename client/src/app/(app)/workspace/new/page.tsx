import { Metadata } from "next";

export const metadata: Metadata = {
  title: "new workspace",
  description: "new workspace management",
};

export default function NewWorkspacePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">New Workspace</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">workspace content goes here</p>
        </div>
      </div>
    </div>
  );
}
