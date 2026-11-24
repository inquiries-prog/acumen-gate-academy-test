"use client";

import { useMemo, useState } from "react";
import { Hourglass } from "@/components/art/Scenes";
import { useSiteUI } from "@/components/site/SiteUI";
import Reveal from "@/components/ui/Reveal";
import { bestAir, parseAirs, sortByRank } from "@/lib/results";
import type { ResultEntry, ResultYear } from "@/lib/types";
import FaceCrop from "./FaceCrop";

type Filter = "all" | "ranked" | "top500" | "qualified";

const PAGE = 24;

/**
 * The Wall of Champions - every student of the year as a face card, ranked
 * students first in rank order, then everyone who qualified. Replaces the
 * plain grid of posts: a year switcher, rank filters and a name search on
 * top (the pattern GATE institutes use for their topper archives), and the
 * original success post a tap away in the lightbox.
 *
 * Ends with an open "your name here" card that books the free demo - the
 * page's call to action, in the place a reader's eye already is.
 */
export default function ChampionsWall({ years, entries }: { years: ResultYear[]; entries: ResultEntry[] }) {
  const { push, openDemo } = useSiteUI();
  const withEntries = years.filter((y) => entries.some((e) => e.year_id === y.id));
  // "all" (every year together) is the default view.
  const [yearId, setYearId] = useState<string>(withEntries.length > 1 ? "all" : (withEntries[0] ?? years[0])?.id ?? "");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE);

  const year = years.find((y) => y.id === yearId);
  const labelOf = (id: string) => years.find((y) => y.id === id)?.label ?? "";
  const ofYear = useMemo(
    () =>
      sortByRank(
        entries.filter((e) => (yearId === "all" ? withEntries.some((y) => y.id === e.year_id) : e.year_id === yearId)),
      ),
    [entries, yearId, withEntries],
  );
  const counts = {
    all: ofYear.length,
    ranked: ofYear.filter((e) => bestAir(e) !== null).length,
    top500: ofYear.filter((e) => (bestAir(e) ?? Infinity) <= 500).length,
    qualified: ofYear.filter((e) => bestAir(e) === null).length,
  };
  const term = query.trim().toLowerCase();
  const list = ofYear.filter((e) => {
    const air = bestAir(e);
    if (filter === "ranked" && air === null) return false;
    if (filter === "top500" && (air === null || air > 500)) return false;
    if (filter === "qualified" && air !== null) return false;
    return !term || e.student_name.toLowerCase().includes(term) || (e.air ?? "").includes(term);
  });
  const visible = list.slice(0, shown);

  const filters: Array<{ key: Filter; label: string }> = [
    { key: "all", label: "Everyone" },
    { key: "ranked", label: "With AIR" },
    { key: "top500", label: "Top 500" },
    { key: "qualified", label: "Qualified" },
  ];

  function open(index: number) {
    push({
      kind: "lightbox",
      images: list.map((e) => ({
        id: e.id,
        image_url: e.image_url,
        alt_text: e.alt_text,
        kind: "result" as const,
        show_in_carousel: false,
        show_in_news_strip: false,
        sort_order: 0,
      })),
      index,
    });
  }

  return (
    <section id="champions" className="section section-alt scroll-mt-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              Wall of champions
            </p>
            <h2 className="h-section mt-5">Every student, every rank</h2>
            <p className="lede mt-4">Ranked students first, in rank order. Tap anyone to see their success post.</p>
          </Reveal>

          {years.length > 1 && withEntries.length > 0 && (
            <div role="group" aria-label="Year" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {withEntries.length > 1 && (
                <button
                  type="button"
                  aria-pressed={yearId === "all"}
                  onClick={() => {
                    setYearId("all");
                    setShown(PAGE);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    yearId === "all" ? "bg-red text-white shadow-red-glow" : "border border-line bg-white text-charcoal hover:border-red/40"
                  }`}
                >
                  All years
                </button>
              )}
              {years.map((y) => (
                <button
                  key={y.id}
                  type="button"
                  aria-pressed={y.id === yearId}
                  onClick={() => {
                    setYearId(y.id);
                    setShown(PAGE);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    y.id === yearId ? "bg-red text-white shadow-red-glow" : "border border-line bg-white text-charcoal hover:border-red/40"
                  }`}
                >
                  {y.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {ofYear.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-line bg-white p-8 text-center sm:p-12">
            <Hourglass className="mx-auto h-20 w-20" />
            <h3 className="mt-4 text-lg">We&apos;re adding the {year?.label} results</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-body">
              Check back soon, or see this year&apos;s champions in the meantime.
            </p>
            {withEntries[0] && (
              <button
                type="button"
                onClick={() => setYearId(withEntries[0].id)}
                className="btn-secondary btn-sm mt-5"
              >
                See {withEntries[0].label}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div role="group" aria-label="Filter" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                {filters
                  .filter((f) => counts[f.key] > 0)
                  .map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={filter === f.key}
                      onClick={() => {
                        setFilter(f.key);
                        setShown(PAGE);
                      }}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        filter === f.key ? "bg-charcoal text-white shadow-lifted" : "border border-line bg-white text-charcoal hover:border-red/40"
                      }`}
                    >
                      {f.label}
                      <span className={`rounded-full px-1.5 text-[11px] ${filter === f.key ? "bg-white/20" : "bg-offwhite text-muted"}`}>
                        {counts[f.key]}
                      </span>
                    </button>
                  ))}
              </div>
              <label className="relative block sm:w-64">
                <span className="sr-only">Search by name or rank</span>
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search a name or rank"
                  className="field !min-h-11 !py-2 pl-10"
                />
              </label>
            </div>

            <ul key={`${yearId}-${filter}-${term}`} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">
              {visible.map((e, i) => {
                const airs = parseAirs(e.air);
                const best = airs.length ? Math.min(...airs) : null;
                const tier = best === null ? null : best <= 100 ? "Top 100" : best <= 500 ? "Top 500" : best <= 1000 ? "Top 1000" : null;
                return (
                  <li
                    key={e.id}
                    className="animate-reveal"
                    style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => open(i)}
                      className="group relative flex h-full w-full flex-col items-center overflow-hidden rounded-2xl border border-line bg-white px-3 pb-4 pt-5 text-center shadow-chip
                                 transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-red/30 hover:shadow-card-hover"
                    >
                      {tier && (
                        <span className="absolute right-2 top-2 rounded-full bg-red/[0.08] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wide text-red">
                          {tier}
                        </span>
                      )}
                      <span className="relative w-[72%]">
                        <span
                          aria-hidden="true"
                          className={`absolute -inset-1 rounded-full transition-transform duration-500 group-hover:scale-105 ${
                            best !== null && best <= 500 ? "bg-red-sheen" : "bg-line"
                          }`}
                        />
                        <FaceCrop isPost={e.photo_is_post !== false} src={e.image_url} alt={e.alt_text || e.student_name} size={130} className="relative ring-[3px] ring-white" />
                      </span>
                      <span className="mt-3 line-clamp-1 font-display text-[15px] font-bold text-charcoal">{e.student_name}</span>
                      {airs.length ? (
                        <span className="mt-1 font-display text-lg font-extrabold leading-tight text-red">
                          AIR {airs.join(" & ")}
                        </span>
                      ) : (
                        <span className="mt-1.5 rounded-full bg-offwhite px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted">
                          Qualified
                        </span>
                      )}
                      {e.branch && <span className="mt-1 line-clamp-1 text-[11px] text-muted">{e.branch}</span>}
                      {yearId === "all" && labelOf(e.year_id) && (
                        <span className="mt-1.5 rounded-full bg-offwhite px-2 py-0.5 text-[10px] font-bold text-charcoal">
                          {labelOf(e.year_id)}
                        </span>
                      )}
                      {airs.length > 1 && <span className="mt-1 text-[10.5px] font-semibold text-body">Two papers</span>}
                    </button>
                  </li>
                );
              })}

              {/* The open seat. */}
              {shown >= list.length && !term && filter === "all" && (
                <li className="animate-reveal">
                  <button
                    type="button"
                    onClick={() => openDemo("Results wall: your name here")}
                    className="group flex h-full w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red/40 bg-white px-3 py-5 text-center
                               transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-red hover:bg-red/[0.03]"
                  >
                    <span className="grid aspect-square w-[60%] place-items-center rounded-full bg-red/[0.07] font-display text-3xl font-extrabold text-red transition-transform duration-500 group-hover:scale-105">
                      ?
                    </span>
                    <span className="mt-3 font-display text-[15px] font-bold text-charcoal">Your name here</span>
                    <span className="mt-1 text-xs text-body">Next year&apos;s wall starts with a free demo class</span>
                    <span className="mt-3 rounded-full bg-red px-3 py-1 text-[11px] font-bold text-white">Book free demo</span>
                  </button>
                </li>
              )}
            </ul>

            {list.length === 0 && (
              <p className="mt-8 text-center text-sm text-body">No one matches &ldquo;{query}&rdquo;.</p>
            )}

            {shown < list.length && (
              <div className="mt-8 text-center">
                <button type="button" onClick={() => setShown((n) => n + PAGE)} className="btn-secondary">
                  Show {Math.min(PAGE, list.length - shown)} more
                </button>
                <p className="mt-2 text-xs text-muted">
                  Showing {shown} of {list.length}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
