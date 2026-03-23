"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useActiveTrip } from "@/hooks/use-active-trip";
import {
  useDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks/use-documents";
import { documentsApi } from "@/lib/api/documents";
import type { DocumentCategory } from "@/types/document";

const CATEGORIES: { label: string; value: DocumentCategory | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Bookings", value: "BOOKINGS" },
  { label: "Insurance", value: "INSURANCE" },
  { label: "IDs", value: "IDS" },
  { label: "Itineraries", value: "ITINERARIES" },
  { label: "Other", value: "OTHER" },
];

function formatBytes(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const tripId = useActiveTrip();
  const { data: documents = [], isLoading } = useDocuments(tripId ?? undefined);
  const uploadMut = useUploadDocument(tripId ?? undefined);
  const deleteMut = useDeleteDocument(tripId ?? undefined);

  const [activeCategory, setActiveCategory] = useState<
    DocumentCategory | "ALL"
  >("ALL");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategory, setUploadCategory] =
    useState<DocumentCategory>("OTHER");
  const [uploadFileType, setUploadFileType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filtered =
    activeCategory === "ALL"
      ? documents
      : documents.filter((d) => d.category === activeCategory);

  function handleUpload() {
    if (!selectedFile || !uploadName.trim() || !tripId) return;
    const fd = new FormData();
    fd.append("file", selectedFile);
    fd.append("name", uploadName.trim());
    fd.append("category", uploadCategory);
    if (uploadFileType.trim()) fd.append("fileType", uploadFileType.trim());
    uploadMut.mutate(fd, {
      onSuccess: () => {
        setShowUpload(false);
        setUploadName("");
        setUploadCategory("OTHER");
        setUploadFileType("");
        setSelectedFile(null);
      },
    });
  }

  async function handleDownload(docId: string) {
    if (!tripId) return;
    const { url } = await documentsApi.download(tripId, docId);
    window.open(url, "_blank");
  }

  if (!tripId) {
    return (
      <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Select a trip to view documents.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fc] p-6 lg:p-8 text-slate-900">
      <div className="space-y-6">
        {/* Header */}
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

            <Link
              href="/documents/new"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
            >
              Upload File
            </Link>
          </div>

          {/* Category Filters */}
          <div className="mt-6 flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`rounded-xl border px-4 py-2 text-sm ${
                  activeCategory === cat.value
                    ? "border-blue-300 bg-blue-50 text-blue-700 font-medium"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold">Upload a Document</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                placeholder="Document name"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <select
                value={uploadCategory}
                onChange={(e) =>
                  setUploadCategory(e.target.value as DocumentCategory)
                }
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="BOOKINGS">Bookings</option>
                <option value="INSURANCE">Insurance</option>
                <option value="IDS">IDs</option>
                <option value="ITINERARIES">Itineraries</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                value={uploadFileType}
                onChange={(e) => setUploadFileType(e.target.value)}
                placeholder="File type (e.g. Passport, Ticket)"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="text-sm text-slate-600"
              />
              <button
                onClick={handleUpload}
                disabled={
                  uploadMut.isPending || !selectedFile || !uploadName.trim()
                }
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {uploadMut.isPending ? "Uploading…" : "Upload"}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 text-slate-400">
            Loading documents…
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-12 text-center">
            <p className="text-slate-400">
              {documents.length === 0
                ? 'No documents uploaded yet. Click "Upload File" to get started.'
                : "No documents match the selected category."}
            </p>
          </div>
        )}

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-[28px] border border-slate-200 bg-white shadow-sm p-5"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">{doc.category}</div>
                {doc.fileType && (
                  <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                    {doc.fileType}
                  </span>
                )}
              </div>

              <div className="mt-3 font-semibold text-slate-900">
                {doc.name}
              </div>

              <div className="mt-2 text-sm text-slate-500">
                {formatBytes(doc.sizeBytes)} • Uploaded{" "}
                {new Date(doc.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>

              {/* Preview box */}
              <div className="mt-4 h-32 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-sm text-slate-400">
                {doc.mimeType?.startsWith("image/")
                  ? "Image"
                  : doc.mimeType === "application/pdf"
                    ? "PDF"
                    : "File"}{" "}
                Preview
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDownload(doc.id)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  Download
                </button>
                <button
                  onClick={() => deleteMut.mutate(doc.id)}
                  disabled={deleteMut.isPending}
                  className="flex-1 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
