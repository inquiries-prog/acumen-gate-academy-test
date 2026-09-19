"use client";

import { useRef, useState } from "react";

/**
 * Image picker for the admin panel (SRS 9.1).
 *
 * Shows the current image with a "Replace" control - drag-and-drop or file
 * picker - and never exposes a URL box. The URL is carried in a hidden input so
 * the surrounding form saves it without the client ever seeing it.
 */
export default function ImageField({
  name,
  label,
  value,
  help,
  folder = "general",
  required = false,
}: {
  name: string;
  label: string;
  value: string;
  help?: string;
  folder?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok || !json.url) throw new Error(json.error || "Upload failed.");
      setUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  }

  return (
    <div>
      <span className="field-label">
        {label} {required && <span className="text-red">*</span>}
      </span>

      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col gap-3 rounded-lg border-2 border-dashed p-3 transition-colors sm:flex-row sm:items-center ${
          dragging ? "border-red bg-red/5" : "border-line bg-offwhite"
        }`}
      >
        <div className="grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-md border border-line bg-white">
          {url ? (
            // Deliberately a plain <img>: this previews an arbitrary just-
            // uploaded URL, which next/image would need configured up front.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Current" className="h-full w-full object-contain" />
          ) : (
            <span className="px-2 text-center text-[11px] text-muted">No image yet</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary"
            >
              {uploading ? "Uploading…" : url ? "Replace image" : "Choose image"}
            </button>
            {url && !uploading && (
              <button
                type="button"
                onClick={() => setUrl("")}
                className="btn-ghost text-red hover:bg-red/5"
              >
                Remove
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted">
            {help ?? "Drag an image here, or choose a file. JPG, PNG or WebP, up to 8 MB."}
          </p>
          {error && (
            <p className="mt-1.5 text-xs font-semibold text-red" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
