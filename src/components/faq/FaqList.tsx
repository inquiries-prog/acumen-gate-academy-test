"use client";

import { useState } from "react";
import type { Faq } from "@/lib/types";

/**
 * An accordion of questions. Shared by the About page, course pages and the
 * FAQ page so they behave identically.
 *
 * Every answer is in the HTML (hidden, not unrendered) so crawlers and AI
 * answer engines can read them all (SRS 13). `highlight` marks matches from
 * the FAQ page's search.
 */
export default function FaqList({
  faqs,
  initiallyOpen = "first",
  highlight = "",
}: {
  faqs: Faq[];
  initiallyOpen?: "first" | "none";
  highlight?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(initiallyOpen === "first" ? (faqs[0]?.id ?? null) : null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const open = openId === faq.id;
        return (
          <div
            key={faq.id}
            className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ease-smooth animate-reveal ${
              open ? "border-red/30 shadow-card" : "border-line hover:border-red/20"
            }`}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : faq.id)}
                aria-expanded={open}
                aria-controls={`faq-panel-${faq.id}`}
                className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6"
              >
                <span className="text-[15px] font-bold leading-snug text-charcoal sm:text-base">
                  <Highlighted text={faq.question} term={highlight} />
                </span>
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-charcoal transition-all duration-300 ${
                    open ? "rotate-45 border-red bg-red text-white" : ""
                  }`}
                  aria-hidden="true"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${faq.id}`}
              hidden={!open}
              className="px-5 pb-6 pr-10 text-[15px] leading-relaxed text-body animate-slideUp sm:px-6"
            >
              <Highlighted text={faq.answer} term={highlight} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Highlighted({ text, term }: { text: string; term: string }) {
  const t = term.trim();
  if (t.length < 2) return <>{text}</>;
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === t.toLowerCase() ? (
          <mark key={i} className="rounded bg-red/15 px-0.5 text-charcoal">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
