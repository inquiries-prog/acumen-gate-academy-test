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
          <p className="mt-8 rounded-xl border border-dashed border-line bg-offwhite px-5 py-10 text-center text-sm text-body">
            {activeYear
              ? `Results for ${activeYear.label} will be published here shortly.`
              : "Results will be published here shortly."}
          </p>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((e) => (
              <li key={e.id} className="card-interactive group overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden bg-offwhite">
                  <MediaImage
                    src={e.image_url}
                    alt={e.alt_text || `${e.student_name}, AIR ${e.air}`}
                    placeholderLabel="Student photo"
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
