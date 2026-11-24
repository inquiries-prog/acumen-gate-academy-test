"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSiteUI } from "@/components/site/SiteUI";
import type { KeyDate, NewsCategory, NewsPost } from "@/lib/types";
import { formatDate, readingMinutes } from "@/lib/utils";
import NewsCover from "./NewsCover";

const LABEL: Record<NewsCategory, string> = {
  gate: "GATE Exam",
  psu: "PSU & Jobs",
  results: "Results",
  acumen: "Acumen News",
};

const TAG: Record<NewsCategory, string> = {
  gate: "bg-red text-white",
  psu: "bg-charcoal text-white",
  results: "bg-amber-400 text-charcoal",
  acumen: "bg-white text-red ring-1 ring-red/30",
};


/**
 * News & Updates as a magazine (the featured story sits in the page hero):
 * category tabs, a search box and a grid of cards, with the important dates
 * tracker beside the grid (above it on phones).
 *
 * Every card has a cover - the uploaded image, or its category's animated
 * illustration - a category tag, the date and a reading time.
 */
export default function NewsMagazine({
  posts,
  dates,
  featuredId,
}: {
  posts: NewsPost[];
  dates: KeyDate[];
  /** The story shown in the page hero; left out of the grid until filtering. */
  featuredId?: string;
}) {
  const [category, setCategory] = useState<NewsCategory | "all">("all");
  const [query, setQuery] = useState("");

  const rest = posts.filter((p) => p.id !== featuredId);
  const present = (Object.keys(LABEL) as NewsCategory[]).filter((c) => posts.some((p) => p.category === c));
  const term = query.trim().toLowerCase();

  const list = useMemo(
    () =>
      (term || category !== "all" ? posts : rest).filter(
        (p) =>
          (category === "all" || p.category === category) &&
          (!term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term)),
      ),
    [posts, rest, category, term],
  );

  if (posts.length === 0) {
    return (
      <div className="container-site py-16 text-center text-body">No updates have been published yet. Check back soon.</div>
    );
  }

  const filtering = Boolean(term) || category !== "all";

  return (
    <div className="container-site py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
        <div className="min-w-0">
          {/* ------------------------------------------- tabs + search */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Category" className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
              {[{ key: "all" as const, label: "All updates" }, ...present.map((c) => ({ key: c, label: LABEL[c] }))].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  aria-pressed={category === c.key}
                  onClick={() => setCategory(c.key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                    category === c.key ? "bg-charcoal text-white shadow-lifted" : "border border-line bg-white text-charcoal hover:border-red/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="relative block sm:w-60">
              <span className="sr-only">Search updates</span>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search updates"
                className="field !min-h-11 !py-2 pl-10"
              />
            </label>
          </div>

          {/* Phones: the dates tracker sits here, before the stories. */}
          <div className="mt-8 lg:hidden">
            <DatesTracker dates={dates} />
          </div>

          {/* ------------------------------------------------ the grid */}
          {list.length === 0 && !filtering ? null : list.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-line bg-offwhite px-6 py-10 text-center text-sm text-body">
              {term ? <>No updates match &ldquo;{query}&rdquo;.</> : "No updates in this category yet."}
            </p>
          ) : (
            <ul key={`${category}-${term}`} className="mt-8 grid gap-6 sm:grid-cols-2">
              {list.map((post, i) => (
                <li key={post.id} className="animate-reveal" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                  <Link
                    href={`/news/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-chip transition-all duration-500 ease-smooth hover:-translate-y-1.5 hover:border-red/25 hover:shadow-card-hover"
                  >
                    <div className="relative">
                      <NewsCover
                        category={post.category}
                        coverUrl={post.cover_url}
                        alt={post.title}
                        sizes="(max-width: 640px) 100vw, 380px"
                        className="aspect-[16/9] transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                      />
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide shadow-chip ${TAG[post.category]}`}>
                        {LABEL[post.category]}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <p className="text-xs font-semibold text-muted">
                        {formatDate(post.published_at)} · {readingMinutes(post.content)} min read
                      </p>
                      <h3 className="mt-2 text-lg leading-snug transition-colors group-hover:text-red">{post.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">{post.excerpt}</p>
                      <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-bold text-red">
                        Read more
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                          <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Desktop: the tracker as a sticky sidebar. */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <DatesTracker dates={dates} />
          </div>
        </aside>
      </div>
    </div>
  );
}

const KIND: Record<KeyDate["kind"], { label: string; dot: string }> = {
  exam: { label: "GATE", dot: "bg-red" },
  psu: { label: "PSU", dot: "bg-charcoal" },
  acumen: { label: "Acumen", dot: "bg-amber-400" },
};

/**
 * Upcoming deadlines with a live day count. Days are worked out in the
 * visitor's browser after it loads (the server doesn't know their date), so
 * the count is never stale on a cached page.
 */
export function DatesTracker({ dates }: { dates: KeyDate[] }) {
  const { openDemo } = useSiteUI();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const upcoming = dates.filter((d) => now === null || Date.parse(`${d.date}T23:59:59+05:30`) >= now).slice(0, 6);

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      <div className="relative isolate overflow-hidden bg-charcoal bg-dark-sheen px-5 py-4 text-white">
        <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-red/40 blur-2xl animate-glow-a" />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-red">Don&apos;t miss</p>
        <h2 className="relative mt-1 font-display text-lg font-bold text-white">Important dates</h2>
      </div>

      {upcoming.length === 0 ? (
        <p className="px-5 py-6 text-sm text-body">No upcoming dates right now. New notifications appear here.</p>
      ) : (
        <ol className="divide-y divide-line">
          {upcoming.map((d, i) => {
            const days = now === null ? null : Math.max(0, Math.ceil((Date.parse(`${d.date}T00:00:00+05:30`) - now) / 86_400_000));
            const [y, m, day] = d.date.split("-").map(Number);
            const month = new Date(Date.UTC(y, m - 1, day)).toLocaleString("en-IN", { month: "short", timeZone: "UTC" });
            return (
              <li key={d.id} className="flex gap-3.5 px-5 py-4 animate-reveal" style={{ animationDelay: `${i * 70}ms` }}>
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-offwhite text-center">
                  <span className="block font-display text-xl font-extrabold leading-none text-charcoal">{day}</span>
                  <span className="block text-[10px] font-bold uppercase tracking-wide text-red">{month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${KIND[d.kind].dot}`} aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted">{KIND[d.kind].label}</span>
                    {!d.confirmed && (
                      <span className="rounded bg-amber-100 px-1.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-900">Expected</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm font-bold leading-snug text-charcoal">{d.title}</p>
                  {d.detail && <p className="mt-0.5 text-xs leading-snug text-body">{d.detail}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {days !== null && (
                      <span className={`text-xs font-extrabold tabular-nums ${days <= 14 ? "text-red" : "text-charcoal"}`}>
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `in ${days} days`}
                      </span>
                    )}
                    {d.link_url && (
                      <a href={d.link_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-red underline-offset-4 hover:underline">
                        {d.link_label || "Details"} ↗
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="border-t border-line bg-offwhite px-5 py-4">
        <p className="text-sm font-bold text-charcoal">Preparing for these dates?</p>
        <p className="mt-0.5 text-xs text-body">See how we teach before you decide.</p>
        <button type="button" onClick={() => openDemo("News dates tracker")} className="btn-primary btn-sm mt-3 w-full">
          🎓 Book a free demo class
        </button>
      </div>
    </div>
  );
}
