"use client";

import { useState, useTransition } from "react";
import { SaveButton, StatusMessage } from "@/components/admin/Fields";
import { saveBatch, type ActionResult } from "@/lib/admin/actions";
import { PLACEHOLDER } from "@/lib/defaults";
import type { Batch, Branch } from "@/lib/types";

/**
 * Batch management (SRS 9.2).
 *
 * One row per branch per mode, matching what a visitor sees in the batches
 * popup. Changing a date, a fee, the assigned faculty, or the demo video is
 * meant to take well under a minute and never involve a developer (SRS 9.3).
 *
 * The demo video is per branch and per mode - not one global video.
 */
export default function BatchesEditor({
  branches,
  batches,
}: {
  branches: Branch[];
  batches: Batch[];
}) {
  const [mode, setMode] = useState<"offline" | "online">("offline");
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [, startTransition] = useTransition();

  const rows = branches
    .map((branch) => ({
      branch,
      batch: batches.find((b) => b.branch_id === branch.id && b.mode === mode) ?? null,
    }))
    .filter((r) => r.batch);

  const usingPlaceholderFees = batches.some(
    (b) => b.start_date === PLACEHOLDER || b.faculty === PLACEHOLDER,
  );

  function handleSave(batchId: string, formData: FormData) {
    startTransition(async () => {
      const result = await saveBatch(batchId, formData);
      setStatus(result);
      if (result.ok) setOpenId(null);
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Batches, dates &amp; fees</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
          What students see when they open the offline or online batches popup, and in the
          &ldquo;Know about the batch&rdquo; details.
        </p>
      </header>

      {usingPlaceholderFees && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          Some batches still have starting placeholder values for the start date, faculty or fee.
          Please replace them with the real details before the site goes live — the fee shown here is
          the amount students are charged online.
        </p>
      )}

      <StatusMessage status={status} />

      <div className="flex gap-2">
        {(["offline", "online"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setOpenId(null);
            }}
            className={`min-h-11 rounded-full border px-5 text-sm font-bold transition-colors ${
              mode === m
                ? "border-red bg-red text-white"
                : "border-line bg-white text-charcoal hover:border-red/40"
            }`}
          >
            {m === "offline" ? "Offline batches" : "Online batches"}
          </button>
        ))}
      </div>

      <ul className="space-y-2.5">
        {rows.map(({ branch, batch }) => {
          if (!batch) return null;
          const open = openId === batch.id;
          const summary = [
            batch.start_date === PLACEHOLDER || !batch.start_date
              ? "No start date set"
              : `Starts ${batch.start_date}`,
            batch.fees ? `₹${Number(batch.fees).toLocaleString("en-IN")} + GST` : "No fee set",
          ].join(" · ");

          return (
            <li key={batch.id} className="card overflow-hidden">
              <div className="flex items-center gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-charcoal">
                    {branch.name} <span className="text-muted">({branch.code})</span>
                  </p>
                  <p className="truncate text-xs text-muted">{summary}</p>
                </div>
                {!batch.visible && (
                  <span className="shrink-0 rounded bg-offwhite px-2 py-1 text-[11px] font-bold text-muted">
                    Hidden
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : batch.id)}
                  className="btn-secondary shrink-0"
                >
                  {open ? "Close" : "Edit"}
                </button>
              </div>

              {open && (
                <div className="border-t border-line bg-offwhite/50 p-5">
                  <form action={(fd) => handleSave(batch.id, fd)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Text
                        name="start_date"
                        label="Start date"
                        defaultValue={batch.start_date === PLACEHOLDER ? "" : batch.start_date}
                        placeholder="e.g. 12 January 2026"
                        help="Written however you want it to appear on the site."
                      />
                      <Text
                        name="duration"
                        label="Duration"
                        defaultValue={batch.duration === PLACEHOLDER ? "" : batch.duration}
                        placeholder="e.g. 12 months"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Text
                        name="faculty"
                        label="Faculty assigned"
                        defaultValue={batch.faculty === PLACEHOLDER ? "" : batch.faculty}
                        placeholder="e.g. Er. Mukesh Rai"
                      />
                      <Text
                        name="seats"
                        label="Seats"
                        defaultValue={batch.seats}
                        placeholder="e.g. 40"
                        help="Optional."
                      />
                    </div>

                    <div>
                      <label htmlFor={`fees-${batch.id}`} className="field-label">
                        Course fee (₹, before GST)
                      </label>
                      <input
                        id={`fees-${batch.id}`}
                        name="fees"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={batch.fees ?? ""}
                        className="field"
                      />
                      <p className="mt-1.5 text-xs text-muted">
                        This is what students are charged online, with 18% GST added on top and
                        shown separately. Leave blank to hide the fee and turn off online payment for
                        this batch.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr,140px]">
                      <Text
                        name="video_id"
                        label="Demo video"
                        defaultValue={batch.video_id}
                        placeholder="Paste the YouTube link or video ID"
                        help="Each branch can have its own demo lecture. Paste the whole YouTube address — we'll pick out what we need."
                      />
                      <Text
                        name="video_start"
                        label="Start at (seconds)"
                        defaultValue={String(batch.video_start ?? 0)}
                        help="Optional."
                      />
                    </div>

                    <Checkbox
                      name="enroll_enabled"
                      label="Allow students to enroll and pay online for this batch"
                      defaultChecked={batch.enroll_enabled}
                    />
                    <Checkbox
                      name="visible"
                      label="Show this batch on the website"
                      defaultChecked={batch.visible}
                    />

                    <div className="flex gap-2 border-t border-line pt-4">
                      <SaveButton />
                      <button type="button" onClick={() => setOpenId(null)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Text({
  name,
  label,
  defaultValue,
  placeholder,
  help,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  help?: string;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input name={name} defaultValue={defaultValue} placeholder={placeholder} className="field" />
      {help && <p className="mt-1.5 text-xs text-muted">{help}</p>}
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#E31E24]"
      />
      <span className="text-sm font-semibold text-charcoal">{label}</span>
    </label>
  );
}
