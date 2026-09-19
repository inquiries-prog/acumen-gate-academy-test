"use client";

import { useMemo, useState, useTransition } from "react";
import { saveLeadNotes, setLeadContacted, type ActionResult } from "@/lib/admin/actions";
import { StatusMessage } from "./Fields";
import { telHref } from "@/lib/utils";

/**
 * Lead list (SRS 10).
 *
 * General enquiries and seminar leads are rendered by this same component but
 * always as two SEPARATE screens - the SRS is explicit that they must never be
 * merged into one undifferentiated table, because the client follows them up
 * differently.
 *
 * Sorting, filtering, mark-as-contacted, per-lead notes and CSV export all live
 * here. On a phone each lead becomes a card rather than a squeezed table row.
 */

export interface LeadColumn {
  key: string;
  label: string;
  /** Shown in the compact mobile card, not just the desktop table. */
  primary?: boolean;
}

export type LeadTable = "general_enquiries" | "seminar_leads";

export default function LeadsTable({
  table,
  title,
  description,
  exportType,
  columns,
  rows,
  phoneKey,
  nameKey,
}: {
  table: LeadTable;
  title: string;
  description: string;
  exportType: string;
  columns: LeadColumn[];
  rows: Record<string, unknown>[];
  phoneKey: string;
  nameKey: string;
}) {
  const [filter, setFilter] = useState<"all" | "todo" | "done">("all");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [openNotes, setOpenNotes] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "todo" && row.contacted === true) return false;
      if (filter === "done" && row.contacted !== true) return false;
      if (!term) return true;
      return columns.some((c) => String(row[c.key] ?? "").toLowerCase().includes(term));
    });
  }, [rows, filter, search, columns]);

  const pending = rows.filter((r) => r.contacted !== true).length;

  function toggleContacted(id: string, next: boolean) {
    startTransition(async () => {
      setStatus(await setLeadContacted(table, id, next));
    });
  }

  function saveNotes(id: string, notes: string) {
    startTransition(async () => {
      const result = await saveLeadNotes(table, id, notes);
      setStatus(result);
      if (result.ok) setOpenNotes(null);
    });
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">{description}</p>
          <p className="mt-2 text-sm font-semibold text-charcoal">
            {rows.length} total
            {pending > 0 && <span className="ml-2 text-red">{pending} still to call</span>}
          </p>
        </div>
        <a href={`/api/admin/export?type=${exportType}`} className="btn-secondary">
          Download as spreadsheet
        </a>
      </header>

      <StatusMessage status={status} />

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All"],
            ["todo", "Still to call"],
            ["done", "Contacted"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`min-h-10 rounded-full border px-4 text-sm font-semibold transition-colors ${
              filter === value
                ? "border-red bg-red text-white"
                : "border-line bg-white text-charcoal hover:border-red/40"
            }`}
          >
            {label}
          </button>
        ))}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, college…"
          className="field ml-auto w-full sm:w-64"
        />
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-offwhite px-5 py-10 text-center text-sm text-body">
          {rows.length === 0 ? "No leads yet." : "No leads match that filter."}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((row) => {
            const id = String(row.id);
            const contacted = row.contacted === true;
            const phone = String(row[phoneKey] ?? "");
            const notesOpen = openNotes === id;

            return (
              <li key={id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-charcoal">
                      {String(row[nameKey] ?? "(no name)")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatWhen(row.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {phone && (
                      <a href={telHref(phone)} className="btn-secondary">
                        Call {phone}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleContacted(id, !contacted)}
                      className={contacted ? "btn-ghost text-green-700" : "btn-primary"}
                    >
                      {contacted ? "✓ Contacted" : "Mark contacted"}
                    </button>
                  </div>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-1.5 border-t border-line pt-3 sm:grid-cols-2">
                  {columns
                    .filter((c) => c.key !== nameKey)
                    .map((c) => {
                      const value = String(row[c.key] ?? "").trim();
                      if (!value) return null;
                      return (
                        <div key={c.key} className="flex gap-2 text-xs">
                          <dt className="shrink-0 font-semibold text-muted">{c.label}:</dt>
                          <dd className="min-w-0 break-words text-charcoal">{value}</dd>
                        </div>
                      );
                    })}
                </dl>

                {String(row.notes ?? "") && !notesOpen && (
                  <p className="mt-2.5 rounded bg-offwhite px-3 py-2 text-xs leading-relaxed text-body">
                    {String(row.notes)}
                  </p>
                )}

                {notesOpen ? (
                  <form
                    action={(fd) => saveNotes(id, String(fd.get("notes") ?? ""))}
                    className="mt-3 space-y-2"
                  >
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={String(row.notes ?? "")}
                      placeholder="What happened when you called?"
                      className="field resize-y"
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary">
                        Save note
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenNotes(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenNotes(id)}
                    className="mt-2 text-xs font-semibold text-red hover:underline"
                  >
                    {String(row.notes ?? "") ? "Edit note" : "+ Add a note"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function formatWhen(value: unknown): string {
  if (typeof value !== "string") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
