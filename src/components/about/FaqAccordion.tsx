import Link from "next/link";
import FaqList from "@/components/faq/FaqList";
import Reveal from "@/components/ui/Reveal";
import type { Faq } from "@/lib/types";

/**
 * FAQ section (SRS 7.2.8) - the About page's questions, with a link through
 * to the full FAQ page.
 *
 * The answers are written as direct, factual statements so AI answer engines
 * can extract and cite them (SRS 13) - keep that style if they are edited.
 * The accordion itself is the shared FaqList, so this and the FAQ page behave
 * identically.
 */
export default function FaqAccordion({
  faqs,
  heading = "Questions students ask us",
  lede = "Straight answers on timing, branches, placement support and how our batches work around your college calendar.",
}: {
  faqs: Faq[];
  heading?: string;
  lede?: string;
}) {
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
            <h2 className="h-section mt-5">{heading}</h2>
            <p className="lede mt-4">{lede}</p>
            <Link href="/faq" className="btn-secondary btn-sm mt-6">
              See all FAQs
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </Reveal>

          <FaqList faqs={faqs} />
        </div>
      </div>
    </section>
  );
}
