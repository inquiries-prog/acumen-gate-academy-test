"use client";

import { useRef, useState } from "react";
import { IMAGE_ACCEPT, uploadAdminImage } from "./ImageField";
import { IMAGE_LINE, imageLine } from "@/lib/utils";

/**
 * A long text box that can hold images between paragraphs (news posts).
 *
 * "Insert image" uploads a photo and puts it where the cursor is, as a line of
 * its own (`![caption](url)`). Below the box, every image in the text is shown
 * as a thumbnail with a caption box and a Remove button, so the client edits
 * captions there and never has to touch the image line itself. Images can also
 * be dropped or pasted straight into the text box.
 */
export default function RichTextField({
  id,
  name,
  value: initial,
  placeholder,
  folder = "general",
}: {
  id: string;
  name: string;
  value: string;
  placeholder?: string;
  folder?: string;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Where the cursor was when the text box last lost focus (clicking the
  // button blurs it, but the image should still land where the client was).
  const caret = useRef<number | null>(null);

  const lines = value.split("\n");
  const images = lines
    .map((line, index) => ({ index, match: line.trim().match(IMAGE_LINE) }))
    .filter((x): x is { index: number; match: RegExpMatchArray } => x.match !== null)
    .map(({ index, match }) => ({ index, caption: match[1], url: match[2] }));

  async function insert(files: File[]) {
    if (files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await uploadAdminImage(file, folder));
      // Read once, outside the updater: React may run the updater twice.
      const target = caret.current;
      setValue((current) => {
        const at = Math.min(target ?? current.length, current.length);
        const before = current.slice(0, at).replace(/\s+$/, "");
        const after = current.slice(at).replace(/^\s+/, "");
        const block = urls.map((u) => imageLine(u)).join("\n\n");
        const next = [before, block, after].filter(Boolean).join("\n\n");
        caret.current = (before ? before.length + 2 : 0) + block.length;
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function setLine(index: number, line: string | null) {
    const next = [...lines];
    if (line === null) next.splice(index, 1);
    else next[index] = line;
    setValue(next.join("\n").replace(/\n{3,}/g, "\n\n").trim());
  }

  const imageFiles = (list: FileList | null | undefined) =>
    Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));

  return (
    <div>
      <textarea
        ref={textRef}
        id={id}
        name={name}
        rows={12}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => (caret.current = e.target.selectionStart)}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) e.preventDefault();
        }}
        onDrop={(e) => {
          const files = imageFiles(e.dataTransfer.files);
          if (files.length === 0) return;
          e.preventDefault();
          caret.current = e.currentTarget.selectionStart;
          void insert(files);
        }}
        onPaste={(e) => {
          const files = imageFiles(e.clipboardData.files);
          if (files.length === 0) return;
          e.preventDefault();
          caret.current = e.currentTarget.selectionStart;
          void insert(files);
        }}
        placeholder={placeholder}
        className="field resize-y font-normal leading-relaxed"
      />

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-secondary"
        >
          {uploading ? "Uploading…" : "Insert image"}
        </button>
        <span className="text-xs text-muted">
          Goes where your cursor is. You can also drag or paste a photo into the box.
        </span>
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-red" role="alert">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="mt-4 rounded-lg border border-line bg-offwhite p-3">
          <p className="text-xs font-semibold text-charcoal">
            Images in this post ({images.length}), in the order they appear
          </p>
          <ul className="mt-2 space-y-2">
            {images.map((img, n) => (
              <li key={`${img.index}-${img.url}`} className="flex items-center gap-3 rounded-md border border-line bg-white p-2">
                {/* Plain <img>: previews an arbitrary just-uploaded URL. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-14 w-20 shrink-0 rounded object-cover" />
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Caption for image {n + 1}</span>
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => setLine(img.index, imageLine(img.url, e.target.value))}
                    placeholder="Caption (optional), e.g. Students at the result felicitation"
                    className="field !min-h-10 !py-1.5 text-sm"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setLine(img.index, null)}
                  className="btn-ghost shrink-0 text-red hover:bg-red/5"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          void insert(imageFiles(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}
