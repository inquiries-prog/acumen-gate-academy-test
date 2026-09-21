"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import type { Faq } from "@/lib/types";

/**
 * FAQ accordion (SRS 7.2.8).
 *
 * The answers are written as direct, factual statements so AI answer engines
 * can extract and cite them (SRS 13) - keep that style if they are edited.
 * Built on native <details>/<summary> semantics via buttons so it stays
 * keyboard-usable, and the full answer text is always in the HTML for crawlers
 * rather than being fetched on expand.
 */
export default function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <section className="section section-alt">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Reveal variant="left" distance="lg" className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              FAQ
            </p>
            <h2 className="h-section mt-5">Questions students ask us</h2>
            <p className="lede mt-4">
              Straight answers on timing, branches, placement support and how our batches work
              around your college calendar.
            </p>
          </Reveal>

          <div className="space-y-3">
          {faqs.map((faq) => {
            const open = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ease-smooth ${
                  open ? "border-red/30 shadow-card" : "border-line hover:border-red/20"
                }`}
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
                      {faq.question}
                    </span>
                    <span
                      className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-charcoal transition-transform duration-200 ${
                        open ? "rotate-45 border-red text-red" : ""
                      }`}
                      aria-hidden="true"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </span>
                  </button>
                </h3>
                {/* Kept in the DOM and hidden, so the answer text is crawlable. */}
                <div
                  id={`faq-panel-${faq.id}`}
                  hidden={!open}
                  className="px-5 pb-6 pr-10 text-[15px] leading-relaxed text-body sm:px-6"
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
