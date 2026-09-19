"use client";

import { Fragment } from "react";
import HeroQuickCapture from "@/components/home/HeroQuickCapture";
import PressRow from "@/components/home/PressRow";
import RankStrip from "@/components/home/RankStrip";
import EnquiryForm from "@/components/site/EnquiryForm";
import AmbientGlow from "@/components/ui/AmbientGlow";
import LiveDot from "@/components/ui/LiveDot";
import GoogleRating from "@/components/ui/GoogleRating";
import { useSiteUI } from "@/components/site/SiteUI";

/**
 * Hero (SRS 7.1.1).
 *
 * Headline sits ABOVE the tagline, charcoal and larger; the tagline is red and
 * bold below it. The two must not repeat the same claim - which is why the
 * supporting points avoid "since 2014", as that already appears in the tagline
 * (SRS 3.3 flags exactly that duplication).
 *
 * The right column is the enquiry form itself rather than decoration. This is a
 * lead-generation site (SRS 1.3), and the most valuable space on it was
 * previously spent on four arbitrary result posts that named no student and
 * proved no rank. An inline form removes a click from the only action that
 * matters; the proof lives where it belongs, in the carousel directly below and
 * on the Results page.
 *
 * DEVIATION from SRS 7.1.1, worth re-confirming with the client: that section
 * specifies two hero buttons, "Enquire now" and "Explore courses". The form now
 * *is* the enquire action, so a second button pointing at the same place would
 * split attention. "Explore courses" is kept. Restoring the button is a few
 * lines if the client prefers the original.
 *
 * PHONE vs DESKTOP. On a phone the full card would land a whole screen below
 * the fold, so below `lg` it is replaced by HeroQuickCapture (one number field)
 * placed straight under the tagline, and the three supporting points become a
 * wrapped chip row. Every split is CSS - the server HTML is identical on
 * all devices, the form exists exactly once in the DOM, and nothing swaps
 * after hydration.
 */

/**
 * Factual product detail, not a second headline statistic (SRS 7.1.3).
 * `short` fits a chip on a phone; `full` is the desktop bullet.
 */
const POINTS = [
  {
    short: "6 branches · offline & live online",
    full: "Six engineering branches, offline in Vadodara and live online",
  },
  {
    short: "Timetable built around your end-sems",
    full: "Schedules built around your college end-sems and internals",
  },
  {
    short: "Placement support via Acumen 360",
    full: "Placement support through Acumen 360, our HR consultancy",
  },
];

export default function Hero() {
  const { settings } = useSiteUI();

  // The headline arrives one word at a time. Spaces are kept as text nodes
  // BETWEEN the spans (an inline-block drops its own trailing space), so the
  // DOM text is byte-identical to the headline for crawlers and screen
  // readers - no aria-label needed, and the copy itself is untouched.
  const words = settings.hero_headline.trim().split(/\s+/);
  const lastWordDelay = 80 + (words.length - 1) * 60;
  // The underline draws once the last word has landed.
  const strokeDelay = lastWordDelay + 250;
  const taglineDelay = 200 + words.length * 60;
  const ranksDelay = taglineDelay + 150;

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <AmbientGlow />

      <div className="container-site relative">
        <div className="grid items-start gap-10 py-10 sm:py-14 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          {/* ---------------------------------------------------- copy ---- */}
          {/* A flex column, so the pieces can take a different order per
              breakpoint without existing twice. min-w-0 matters: a grid track
              defaults to a min-content minimum, and the nowrap chip rail below
              would otherwise widen this column past the phone's viewport. */}
          <div className="flex min-w-0 flex-col lg:pt-6">
            <p className="eyebrow self-start">
              <LiveDot />
              GATE &amp; GPSC Coaching · Vadodara
            </p>

            <h1 className="mt-6 text-display-xl text-charcoal">
              {words.map((word, i) => {
                const last = i === words.length - 1;
                return (
                  <Fragment key={i}>
                    {i > 0 && " "}
                    <span
                      className={`inline-block animate-reveal ${last ? "relative" : ""}`}
                      style={{ animationDelay: `${80 + i * 60}ms` }}
                    >
                      {word}
                      {/* A hand-drawn stroke under the last word, drawn in
                          after the words settle. Outside the text node, so the
                          headline's DOM text is untouched. */}
                      {last && (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 200 14"
                          preserveAspectRatio="none"
                          className="pointer-events-none absolute -bottom-1 left-0 h-[0.18em] w-full text-red sm:-bottom-1.5"
                        >
                          <path
                            d="M3 10.5C40 3.5 92 2.5 197 7.5M22 11.5C70 8.5 130 8 178 11"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.2"
                            strokeLinecap="round"
                            strokeDasharray="220"
                            className="animate-draw-stroke"
                            style={{ animationDelay: `${strokeDelay}ms` }}
                          />
                        </svg>
                      )}
                    </span>
                  </Fragment>
                );
              })}
            </h1>

            <p
              className="mt-5 max-w-xl text-lg font-bold leading-snug text-red animate-reveal sm:text-xl md:text-[1.45rem] lg:mt-6"
              style={{ animationDelay: `${taglineDelay}ms` }}
            >
              {settings.hero_tagline}
            </p>

            <RankStrip delay={ranksDelay} className="mt-6 lg:mt-7" />

            {/* Phone only: the primary action, above the fold. */}
            <HeroQuickCapture />

            {/* Wrapped chips on a phone and tablet (nothing scrolls sideways);
                vertical bullet list from lg. Sits after the rating on desktop. */}
            <ul
              className="mt-6 flex flex-wrap gap-2
                         lg:order-last lg:mt-8 lg:flex-col lg:gap-3"
            >
              {POINTS.map((point) => (
                <li
                  key={point.full}
                  className="chip gap-2 px-3.5 py-2 text-[13px]
                             lg:items-start lg:gap-3 lg:border-0 lg:bg-transparent
                             lg:px-0 lg:py-0 lg:text-[15px] lg:font-normal lg:leading-snug lg:shadow-none"
                >
                  <CheckIcon />
                  <span className="lg:hidden">{point.short}</span>
                  <span className="hidden lg:inline">{point.full}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 lg:mt-8">
              <GoogleRating />
              <a
                href="#courses"
                className="inline-flex min-h-12 items-center gap-2 text-[15px] font-semibold text-charcoal underline-offset-4 transition-colors hover:text-red hover:underline"
              >
                {settings.hero_secondary_cta}
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M10 4v11m0 0l-4.5-4.5M10 15l4.5-4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* ------------------------------------------------ enquiry ---- */}
          {/* Desktop only. On a phone HeroQuickCapture above is the entry point
              into the same form, opened as a bottom sheet. */}
          <div className="relative hidden min-w-0 lg:block">
            {/* Soft red bloom behind the card, so it lifts off the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-red/[0.07] blur-2xl"
            />

            <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-lifted">
              <div className="relative overflow-hidden bg-charcoal px-6 py-5 sm:px-7">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_160%_at_0%_0%,rgba(227,30,36,0.35),transparent_62%)]"
                />
                <div className="relative">
                  <h2 className="font-display text-lg font-bold text-white sm:text-xl">
                    Book a free counselling call
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                    Tell us your branch and we&apos;ll call you back within 24 hours.
                  </p>
                </div>
              </div>

              <div className="px-6 py-6 sm:px-7">
                <EnquiryForm source="Hero form" compact />
              </div>
            </div>
          </div>
        </div>

        <div className="pb-10 md:pb-16">
          <PressRow />
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red/10">
      <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 10.5l3.5 3.5L16 5.5"
          stroke="#E31E24"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
