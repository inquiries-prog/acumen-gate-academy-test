"use client";

import { useFormStatus } from "react-dom";
import ImageField from "./ImageField";
import type { FieldDef } from "@/lib/admin/collections";

/** Renders one field from a collection definition. */
export function Field({
  field,
  value,
  folder,
}: {
  field: FieldDef;
  value: unknown;
  folder?: string;
}) {
  const id = `f-${field.name}`;
  const stringValue = value === null || value === undefined ? "" : String(value);

  if (field.type === "image") {
    return (
      <ImageField
        name={field.name}
        label={field.label}
        value={stringValue}
        help={field.help}
        folder={folder}
        required={field.required}
      />
    );
  }

  if (field.type === "boolean") {
    return (
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3.5">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={value === true || value === "true"}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#E31E24]"
        />
        <span>
          <span className="block text-sm font-semibold text-charcoal">{field.label}</span>
          {field.help && <span className="mt-0.5 block text-xs text-muted">{field.help}</span>}
        </span>
      </label>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {field.label} {field.required && <span className="text-red">*</span>}
      </label>

      {field.type === "select" ? (
        <select id={id} name={field.name} defaultValue={stringValue} className="field">
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "longtext" ? (
        <textarea
          id={id}
          name={field.name}
          rows={10}
          defaultValue={stringValue}
          placeholder={field.placeholder}
          className="field resize-y font-normal leading-relaxed"
        />
      ) : field.type === "textarea" ? (
        <textarea
          id={id}
          name={field.name}
          rows={3}
          defaultValue={stringValue}
          placeholder={field.placeholder}
          className="field resize-y"
        />
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type === "date" ? "date" : field.type === "number" || field.type === "money" ? "number" : "text"}
          step={field.type === "money" ? "0.01" : undefined}
          min={field.type === "money" || field.type === "number" ? "0" : undefined}
          defaultValue={stringValue}
          placeholder={field.placeholder}
          className="field"
        />
      )}

      {field.help && <p className="mt-1.5 text-xs text-muted">{field.help}</p>}
    </div>
  );
}

/** Save button that shows its own progress, so a save is never ambiguous. */
export function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : label}
    </button>
  );
}

/** Clear confirmation after a save (SRS 9.1). */
export function StatusMessage({ status }: { status: { ok: boolean; message: string } | null }) {
  if (!status) return null;
  return (
    <p
      role="status"
      className={`rounded-md px-3 py-2.5 text-sm font-medium ${
        status.ok ? "bg-green-50 text-green-800" : "bg-red/5 text-red-dark"
      }`}
    >
      {status.ok ? `✓ ${status.message}` : status.message}
    </p>
  );
}
