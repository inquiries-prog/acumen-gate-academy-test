"use client";

import { useState, useTransition } from "react";
import ImageField from "@/components/admin/ImageField";
import { SaveButton, StatusMessage } from "@/components/admin/Fields";
import {
  deleteResultEntry,
  deleteResultYear,
  saveResultEntry,
  saveResultYear,
  type ActionResult,
} from "@/lib/admin/actions";
import type { ResultEntry, ResultYear } from "@/lib/types";

/**
 * Results page management (SRS 7.4, 9.2, 9.3).
 *
 * Years are rows, so new ones can be added forever - 2027, 2028 and beyond -
 * with no developer involved. Each year has its own "Show on the website"
 * switch, which is what lets the client show only the current year day to day
 * and reveal every year at once during a seminar or a parent meeting.
 */
export default function ResultsEditor({
  years,
  entries,
}: {
  years: ResultYear[];
  entries: ResultEntry[];
}) {
  const [activeYearId, setActiveYearId] = useState(years[0]?.id ?? "");
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [addingYear, setAddingYear] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [addingEntry, setAddingEntry] = useState(false);
  const [, startTransition] = useTransition();

  const activeYear = years.find((y) => y.id === activeYearId) ?? null;
  const yearEntries = entries.filter((e) => e.year_id === activeYearId);

  function run(action: () => Promise<ActionResult>, onOk?: () => void) {
    startTransition(async () => {
      const result = await action();
      setStatus(result);
      if (result.ok) onOk?.();
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Results page</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
          Add a new GATE year whenever you need one, and add each student&apos;s result under it.
          Use &ldquo;Show on the website&rdquo; to reveal or hide a whole year at a time.
        </p>
      </header>

      <StatusMessage status={status} />

      {/* --- Years ---------------------------------------------------- */}
      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold">Years</h2>
          {!addingYear && (
            <button
              type="button"
              onClick={() => {
                setAddingYear(true);
                setEditingYear(null);
              }}
              className="btn-primary"
            >
              + Add a year
            </button>
          )}
        </div>

        {addingYear && (
          <form
            action={(fd) => run(() => saveResultYear(null, fd), () => setAddingYear(false))}
            className="mt-4 space-y-4 rounded-lg border border-line bg-offwhite/60 p-4"
          >
            <YearFields />
            <div className="flex gap-2">
              <SaveButton label="Add year" />
              <button type="button" onClick={() => setAddingYear(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        <ul className="mt-4 space-y-2">
          {years.map((year) => {
            const count = entries.filter((e) => e.year_id === year.id).length;
            const open = editingYear === year.id;
            return (
              <li key={year.id} className="rounded-lg border border-line">
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveYearId(year.id);
                      setEditingEntry(null);
                      setAddingEntry(false);
                    }}
                    className={`min-h-9 rounded-full px-3 text-sm font-bold transition-colors ${
                      activeYearId === year.id
                        ? "bg-red text-white"
                        : "bg-offwhite text-charcoal hover:bg-line"
                    }`}
                  >
                    {year.label}
                  </button>
                  <span className="text-xs text-muted">
                    {count} result{count === 1 ? "" : "s"}
                  </span>
                  {!year.visible && (
                    <span className="rounded bg-offwhite px-2 py-0.5 text-[11px] font-bold text-muted">
                      Hidden
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingYear(open ? null : year.id)}
                    className="btn-ghost ml-auto text-xs"
                  >
                    {open ? "Close" : "Rename / hide"}
                  </button>
                </div>

                {open && (
                  <form
                    action={(fd) => run(() => saveResultYear(year.id, fd), () => setEditingYear(null))}
                    className="space-y-4 border-t border-line bg-offwhite/50 p-4"
                  >
                    <YearFields year={year} />
                    <div className="flex flex-wrap gap-2">
                      <SaveButton />
                      <button
                        type="button"
                        onClick={() => setEditingYear(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !window.confirm(
                              `Delete ${year.label} and all ${count} result(s) in it? This can't be undone.`,
                            )
                          ) {
                            return;
                          }
                          run(() => deleteResultYear(year.id), () => setEditingYear(null));
                        }}
                        className="btn-ghost ml-auto text-red hover:bg-red/5"
                      >
                        Delete year
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* --- Entries for the selected year ----------------------------- */}
      {activeYear && (
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold">Students in {activeYear.label}</h2>
            {!addingEntry && (
              <button
                type="button"
                onClick={() => {
                  setAddingEntry(true);
                  setEditingEntry(null);
                }}
                className="btn-primary"
              >
                + Add a student
              </button>
            )}
          </div>

          {addingEntry && (
            <form
              action={(fd) =>
                run(() => saveResultEntry(activeYear.id, null, fd), () => setAddingEntry(false))
              }
              className="mt-4 space-y-4 rounded-lg border border-line bg-offwhite/60 p-4"
            >
              <EntryFields />
              <div className="flex gap-2">
                <SaveButton label="Add student" />
                <button type="button" onClick={() => setAddingEntry(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {yearEntries.length === 0 && !addingEntry ? (
            <p className="mt-4 rounded-lg border border-dashed border-line bg-offwhite px-5 py-8 text-center text-sm text-body">
              No results added for {activeYear.label} yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {yearEntries.map((entry) => {
                const open = editingEntry === entry.id;
                return (
                  <li key={entry.id} className="rounded-lg border border-line">
                    <div className="flex items-center gap-3 p-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded border border-line bg-offwhite">
                        {entry.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={entry.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-muted">No photo</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-charcoal">
                          {entry.student_name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {[entry.air && `AIR ${entry.air}`, entry.branch, entry.university]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingEntry(open ? null : entry.id)}
                        className="btn-secondary shrink-0"
                      >
                        {open ? "Close" : "Edit"}
                      </button>
                    </div>

                    {open && (
                      <form
                        action={(fd) =>
                          run(
                            () => saveResultEntry(activeYear.id, entry.id, fd),
                            () => setEditingEntry(null),
                          )
                        }
                        className="space-y-4 border-t border-line bg-offwhite/50 p-4"
                      >
                        <EntryFields entry={entry} />
                        <div className="flex flex-wrap gap-2">
                          <SaveButton />
                          <button
                            type="button"
                            onClick={() => setEditingEntry(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!window.confirm(`Delete ${entry.student_name}?`)) return;
                              run(() => deleteResultEntry(entry.id), () => setEditingEntry(null));
                            }}
                            className="btn-ghost ml-auto text-red hover:bg-red/5"
                          >
                            Delete
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function YearFields({ year }: { year?: ResultYear }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Name shown on the tab</label>
          <input
            name="label"
            defaultValue={year?.label ?? ""}
            placeholder="GATE 2027"
            className="field"
          />
        </div>
        <div>
          <label className="field-label">Year</label>
          <input
            name="year"
            type="number"
            min="2000"
            max="2100"
            defaultValue={year?.year ?? new Date().getFullYear() + 1}
            className="field"
          />
        </div>
      </div>
      <div>
        <label className="field-label">Display order</label>
        <input
          name="sort_order"
          type="number"
          defaultValue={year?.sort_order ?? 0}
          className="field"
        />
        <p className="mt-1.5 text-xs text-muted">Lower numbers appear first. Newest year first is usual.</p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3.5">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={year?.visible ?? true}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#E31E24]"
        />
        <span>
          <span className="block text-sm font-semibold text-charcoal">Show this year on the website</span>
          <span className="mt-0.5 block text-xs text-muted">
            Turn every year on when you want to show your full multi-year track record.
          </span>
        </span>
      </label>
    </>
  );
}

function EntryFields({ entry }: { entry?: ResultEntry }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">
            Student name <span className="text-red">*</span>
          </label>
          <input name="student_name" defaultValue={entry?.student_name ?? ""} className="field" />
        </div>
        <div>
          <label className="field-label">All India Rank</label>
          <input name="air" defaultValue={entry?.air ?? ""} placeholder="128" className="field" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">Branch</label>
          <input name="branch" defaultValue={entry?.branch ?? ""} placeholder="Mechanical" className="field" />
        </div>
        <div>
          <label className="field-label">University</label>
          <input
            name="university"
            defaultValue={entry?.university ?? ""}
            placeholder="MSU Baroda"
            className="field"
          />
        </div>
      </div>

      <ImageField
        name="image_url"
        label="Student photo"
        value={entry?.image_url ?? ""}
        folder="results"
      />

      <div>
        <label className="field-label">Photo description</label>
        <input
          name="alt_text"
          defaultValue={entry?.alt_text ?? ""}
          placeholder="Leave blank and we'll use the name and rank"
          className="field"
        />
      </div>

      <input type="hidden" name="sort_order" value={entry?.sort_order ?? 0} />

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3.5">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={entry?.visible ?? true}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[#E31E24]"
        />
        <span className="text-sm font-semibold text-charcoal">Show this student on the website</span>
      </label>
    </>
  );
}
