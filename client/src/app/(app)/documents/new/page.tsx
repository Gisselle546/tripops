"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActiveTrip } from "@/hooks/use-active-trip";
import { useUploadDocument } from "@/hooks/use-documents";
import type { DocumentCategory } from "@/types/document";

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: "BOOKINGS", label: "Bookings" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "IDS", label: "IDs" },
  { value: "ITINERARIES", label: "Itineraries" },
  { value: "OTHER", label: "Other" },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const tripId = useActiveTrip();
  const uploadDoc = useUploadDocument(tripId ?? undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("OTHER");
  const [fileType, setFileType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 flex items-center justify-center">
        <p className="text-slate-500">Select a trip first.</p>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !name.trim()) return;

    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("name", name.trim());
    fd.append("category", category);
    if (fileType.trim()) fd.append("fileType", fileType.trim());

    uploadDoc.mutate(fd, {
      onSuccess: () => router.push("/documents"),
    });
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file && !name.trim()) {
      setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-[30px] border border-slate-200 bg-white shadow-sm p-6">
          <button
            onClick={() => router.push("/documents")}
            className="text-sm text-blue-600 mb-3 inline-block"
          >
            ← Back to Documents
          </button>
          <h1 className="text-4xl font-bold tracking-tight">Upload Document</h1>
          <p className="mt-2 text-slate-500">
            Upload a passport, ticket, visa, insurance policy, or other travel
            file.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-5"
        >
          {/* File Drop Zone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              File *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-blue-300 hover:bg-blue-50/30 transition"
            >
              {selectedFile ? (
                <div>
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Click
                    to change
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">📁</div>
                  <div className="text-sm text-slate-600 font-medium">
                    Click to select a file
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    PDF, images, documents up to 25 MB
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFilePick}
              className="hidden"
            />
          </div>

          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Document Name *
            </label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah's Passport"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`rounded-xl border px-4 py-2.5 text-sm ${
                    category === cat.value
                      ? "border-blue-300 bg-blue-50 text-blue-700 font-medium"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              File Type (optional label)
            </label>
            <input
              type="text"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              placeholder="e.g. Passport, Ticket, Policy, Visa"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/documents")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadDoc.isPending || !selectedFile || !name.trim()}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {uploadDoc.isPending ? "Uploading…" : "Upload Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
