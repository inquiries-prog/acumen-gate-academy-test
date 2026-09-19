"use client";

import { useState } from "react";
import MediaImage from "@/components/ui/MediaImage";
import type { ResultEntry, ResultYear } from "@/lib/types";

/**
 * GATE Results grid with year tabs (SRS 7.4).
 *
 * Years come from the database and can be added indefinitely - there is no
 * hardcoded list of years anywhere in this component, and each year's
 * visibility is controlled independently from the admin panel.
 *
 * The tab strip scrolls horizontally rather than cramming, so it stays readable
 * once there are many years (SRS 3.4 flags this explicitly).
 *
 * Denser and more data-forward than the homepage teaser: less narrative, more
 * scannable proof.
 */
export default function ResultsTabs({
  years,
  entries,
}: {
  years: ResultYear[];
  entries: ResultEntry[];
}) {
  const [activeId, setActiveId] = useState(years[0]?.id ?? "");

  if (years.length === 0) return null;

  const visible = entries.filter((e) => e.year_id === activeId);
  const activeYear = years.find((y) => y.id === activeId);

  return (
    <section className="section">
      <div className="container-site">
        <p className="eyebrow">Results</p>
        <h2 className="h-section mt-4">GATE Results</h2>

        <div
          role="tablist"
          aria-label="GATE result years"
          className="mt-8 flex gap-2.5 overflow-x-auto pb-2 no-scrollbar"
        >
          {years.map((y) => {
            const active = y.id === activeId;
            return (
              <button
                key={y.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveId(y.id)}
                className={`min-h-12 shrink-0 rounded-full border px-6 text-sm font-bold transition-all duration-300 ease-smooth ${
                  active
                    ? "border-red bg-red text-white shadow-red-glow"
                    : "border-line bg-white text-charcoal shadow-chip hover:-translate-y-0.5 hover:border-red/40 hover:text-red"
                }`}
              >
                {y.label}
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          // Not a dead end: point at the archive that sits just below.
          <div className="mt-8 rounded-2xl border border-line bg-offwhite p-6 text-center sm:p-10">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-red/[0.08] text-red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 4h10v5a5 5 0 01-10 0V4zM12 14v4m-3.5 2.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">
              We&apos;re adding {activeYear?.label ?? "these"} results
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body">
              Meanwhile, every result we&apos;ve celebrated is just below.
            </p>
            <a href="#archive" className="btn-secondary mt-5">
              See every result
            </a>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((e) => (
              <li key={e.id} className="card-interactive group overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden bg-offwhite">
                  <MediaImage
                    src={e.image_url}
                    alt={e.alt_text || `${e.student_name}, AIR ${e.air}`}
                    placeholderLabel="Student photo"
                    placeholder={{ kind: "person", name: e.student_name }}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {e.air && (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-red px-2.5 py-1 text-[11px] font-bold text-white shadow-red-glow">
                      AIR {e.air}
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-bold text-charcoal" title={e.student_name}>
                    {e.student_name}
                  </p>
                  {e.branch && <p className="text-xs font-semibold text-red">{e.branch}</p>}
                  {e.university && (
                    <p className="mt-0.5 truncate text-xs text-muted" title={e.university}>
                      {e.university}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
