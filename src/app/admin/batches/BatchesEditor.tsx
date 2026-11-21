"use client";

import { useState, useTransition } from "react";
import { SaveButton, StatusMessage } from "@/components/admin/Fields";
import { createBatch, deleteBatch, saveBatch, type ActionResult } from "@/lib/admin/actions";
import { PLACEHOLDER } from "@/lib/defaults";
import type { Batch, Branch } from "@/lib/types";

/**
 * Batch management (SRS 9.2).
 *
 * Grouped by branch, for the chosen mode (classroom / online). A branch can
 * run several batches per mode - a weekday and a weekend batch, say - and
 * every visible batch appears on that branch's course page under "Batches &
 * fees". Changing a date, a fee, the faculty or the demo video is meant to
 * take well under a minute and never involve a developer (SRS 9.3).
 *
 * The demo video is per batch - not one global video.
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
  const [pending, startTransition] = useTransition();

  const groups = branches.map((branch) => ({
    branch,
    rows: batches.filter((b) => b.branch_id === branch.id && b.mode === mode),
  }));

  const usingPlaceholders = batches.some(
    (b) => b.visible && (b.start_date === PLACEHOLDER || b.faculty === PLACEHOLDER || !b.start_date),
  );

  function handleSave(batchId: string, formData: FormData) {
    startTransition(async () => {
      const result = await saveBatch(batchId, formData);
      setStatus(result);
      if (result.ok) setOpenId(null);
    });
  }

  function handleAdd(branchId: string) {
    startTransition(async () => setStatus(await createBatch(branchId, mode)));
  }

  function handleDelete(batch: Batch, label: string) {
    if (!window.confirm(`Delete "${label}"? Students will no longer see it. This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteBatch(batch.id);
      setStatus(result);
      if (result.ok) setOpenId(null);
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Batches, dates &amp; fees</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
          Every batch shown under &ldquo;Batches &amp; fees&rdquo; on each branch&apos;s course page. A branch can
          have more than one batch of each type - for example a weekday and a weekend batch. Students can enroll
          and pay online for any batch with a fee and online payment switched on.
        </p>
      </header>

      {usingPlaceholders && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
          Some visible batches still have a missing start date or faculty, or sample details. Please replace them
          with the real details before the site goes live - the fee shown here is the amount students are charged
          online.
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
            {m === "offline" ? "Classroom batches" : "Online batches"}
          </button>
        ))}
      </div>

      {groups.map(({ branch, rows }) => (
        <section key={branch.id} className="space-y-2.5">
          <div className="flex items-center justify-between gap-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">
              {branch.name} <span className="text-charcoal">({branch.code})</span>
            </h2>
            <button
              type="button"
              disabled={pending}
              onClick={() => handleAdd(branch.id)}
              className="text-xs font-bold text-red hover:underline disabled:opacity-50"
            >
              + Add a {mode === "offline" ? "classroom" : "online"} batch
            </button>
          </div>

          {rows.length === 0 && (
            <p className="rounded-lg border border-dashed border-line bg-offwhite px-4 py-3 text-xs text-muted">
              No {mode === "offline" ? "classroom" : "online"} batch for this branch.
            </p>
          )}

          <ul className="space-y-2.5">
            {rows.map((batch) => {
              const open = openId === batch.id;
              const label = batch.title || `${branch.code} ${mode === "offline" ? "classroom" : "online"} batch`;
              const summary = [
                batch.start_date === PLACEHOLDER || !batch.start_date ? "No start date set" : `Starts ${batch.start_date}`,
                batch.schedule || null,
                batch.fees ? `₹${Number(batch.fees).toLocaleString("en-IN")} incl. GST` : "No fee set",
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <li key={batch.id} className="card overflow-hidden">
                  <div className="flex items-center gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-charcoal">{label}</p>
                      <p className="truncate text-xs text-muted">{summary}</p>
                    </div>
                    {!batch.visible && (
                      <span className="shrink-0 rounded bg-offwhite px-2 py-1 text-[11px] font-bold text-muted">Hidden</span>
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
                        <div className="grid gap-4 sm:grid-cols-[1fr,160px]">
                          <Text
                            name="title"
                            label="Batch name"
                            defaultValue={batch.title ?? ""}
                            placeholder="e.g. Weekend Batch · Vadodara"
                            help="Shown as the heading of this batch on the course page."
                          />
                          <Text
                            name="badge"
                            label="Small label"
                            defaultValue={batch.badge ?? ""}
                            placeholder="e.g. New"
                            help="Optional, a word or two."
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <Text
                            name="start_date"
                            label="Start date"
                            defaultValue={batch.start_date === PLACEHOLDER ? "" : batch.start_date}
                            placeholder="e.g. 12 January 2027"
                            help="Written however you want it to appear on the site."
                          />
                          <Text
                            name="schedule"
                            label="Days & timings"
                            defaultValue={batch.schedule ?? ""}
                            placeholder="e.g. Mon–Fri · 5:30–8:30 PM"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <Text
                            name="duration"
                            label="Duration"
                            defaultValue={batch.duration === PLACEHOLDER ? "" : batch.duration}
                            placeholder="e.g. 12 months"
                          />
                          <Text
                            name="medium"
                            label="Teaching language"
                            defaultValue={batch.medium ?? ""}
                            placeholder="e.g. English + Hindi"
                          />
                          <Text name="seats" label="Batch size" defaultValue={batch.seats} placeholder="e.g. 40" help="Optional." />
                        </div>

                        <Text
                          name="faculty"
                          label="Faculty assigned"
                          defaultValue={batch.faculty === PLACEHOLDER ? "" : batch.faculty}
                          placeholder="e.g. Er. Mukesh Rai"
                        />

                        <div>
                          <label htmlFor={`fees-${batch.id}`} className="field-label">
                            Course fee (₹, including GST - what the student pays)
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
                            The full amount the student pays, with 18% GST already included - the invoice works out
                            the GST part. Leave blank to hide the fee and turn off online payment for this batch.
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-[1fr,140px]">
                          <Text
                            name="video_id"
                            label="Demo video"
                            defaultValue={batch.video_id}
                            placeholder="Paste the YouTube link or video ID"
                            help="Each batch can have its own demo lecture. Paste the whole YouTube address — we'll pick out what we need."
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
                        <Checkbox name="visible" label="Show this batch on the website" defaultChecked={batch.visible} />

                        <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                          <SaveButton />
                          <button type="button" onClick={() => setOpenId(null)} className="btn-secondary">
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => handleDelete(batch, label)}
                            className="btn-ghost ml-auto text-red hover:bg-red/5"
                          >
                            Delete batch
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
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
