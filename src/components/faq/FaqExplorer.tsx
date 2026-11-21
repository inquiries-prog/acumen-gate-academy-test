"use client";

import { useMemo, useState } from "react";
import { useSiteUI } from "@/components/site/SiteUI";
import type { Faq, FaqCategory } from "@/lib/types";
import FaqList from "./FaqList";

interface Category {
  key: FaqCategory;
  label: string;
  blurb: string;
}

const ICONS: Record<FaqCategory, string> = {
  gate: "📝",
  courses: "📚",
  demo: "🎓",
  fees: "💳",
  online: "💻",
  about: "🏫",
};

/**
 * The FAQ page body: a search box, category tabs (with counts), and the
 * questions grouped under their category. Searching looks across every
 * category at once and highlights the matching words.
 *
 * On wide screens the categories are a sticky side list; on phones they are a
 * sideways-scrolling row of pills.
 */
export default function FaqExplorer({ faqs, categories }: { faqs: Faq[]; categories: Category[] }) {
  const { openDemo, openEnquiry } = useSiteUI();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<FaqCategory | "all">("all");

  const present = categories.filter((c) => faqs.some((f) => f.category === c.key));
  const term = query.trim().toLowerCase();

  const matches = useMemo(
    () =>
      faqs.filter(
        (f) =>
          (active === "all" || term || f.category === active) &&
          (!term || f.question.toLowerCase().includes(term) || f.answer.toLowerCase().includes(term)),
      ),
    [faqs, active, term],
  );

  const groups = present
    .map((c) => ({ ...c, items: matches.filter((f) => f.category === c.key) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
      <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
        <label htmlFor="faq-search" className="sr-only">
          Search the FAQs
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search: fees, eligibility, demo…"
            className="field pl-11"
          />
        </div>

        <div
          role="group"
          aria-label="FAQ categories"
          className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {[{ key: "all" as const, label: "All questions", blurb: "" }, ...present].map((c) => {
            const count = c.key === "all" ? faqs.length : faqs.filter((f) => f.category === c.key).length;
            const on = active === c.key && !term;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setActive(c.key);
                  setQuery("");
                }}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm font-bold transition-all duration-300 ease-smooth lg:w-full ${
                  on
                    ? "border-charcoal bg-charcoal text-white shadow-lifted"
                    : "border-line bg-white text-charcoal hover:border-red/40 hover:text-red"
                }`}
              >
                <span aria-hidden="true">{c.key === "all" ? "✨" : ICONS[c.key]}</span>
                <span className="flex-1 whitespace-nowrap">{c.label}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${on ? "bg-white/20" : "bg-offwhite text-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 hidden rounded-2xl border border-line bg-offwhite p-5 lg:block">
          <p className="font-display text-base font-bold text-charcoal">Can&apos;t find your answer?</p>
          <p className="mt-1 text-sm text-body">Our counsellors answer every question personally.</p>
          <button type="button" onClick={() => openEnquiry("FAQ sidebar")} className="btn-secondary btn-sm mt-4 w-full">
            Ask us directly
          </button>
        </div>
      </aside>

      <div aria-live="polite" className="min-w-0">
        {term && (
          <p className="mb-5 text-sm text-body">
            {matches.length === 0 ? (
              <>No questions match &ldquo;{query}&rdquo;.</>
            ) : (
              <>
                <span className="font-bold text-charcoal">{matches.length}</span> question
                {matches.length === 1 ? "" : "s"} match &ldquo;{query}&rdquo;
              </>
            )}
          </p>
        )}

        {matches.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line bg-offwhite px-6 py-12 text-center">
            <p className="font-display text-lg font-bold text-charcoal">Ask us instead</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-body">
              We&apos;ll call you back within 24 hours - or see a class for yourself first.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
              <button type="button" onClick={() => openEnquiry(`FAQ search: ${query}`)} className="btn-primary">
                Ask a question
              </button>
              <button type="button" onClick={() => openDemo("FAQ search")} className="btn-secondary">
                Book a free demo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {groups.map((g) => (
              <section key={`${g.key}-${term}-${active}`} aria-labelledby={`faq-group-${g.key}`}>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <h2 id={`faq-group-${g.key}`} className="flex items-center gap-2.5 font-display text-display-sm">
                    <span aria-hidden="true" className="text-2xl">
                      {ICONS[g.key]}
                    </span>
                    {g.label}
                  </h2>
                  <span className="hidden text-sm text-muted sm:block">{g.blurb}</span>
                </div>
                <FaqList faqs={g.items} initiallyOpen={term ? "first" : g === groups[0] ? "first" : "none"} highlight={term} />
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
