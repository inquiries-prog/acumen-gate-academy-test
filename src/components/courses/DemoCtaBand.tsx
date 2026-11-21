"use client";

import { useSiteUI } from "@/components/site/SiteUI";
import WhatsAppLink from "@/components/site/WhatsAppLink";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { GiftIcon } from "@/components/site/DemoHooks";
import GateCountdown from "./GateCountdown";

/**
 * The big "book a free demo class" band, used between sections on the course
 * pages and the FAQ. Red, with drifting glow and a live countdown: the most
 * visible call to action on these pages, so it is the free one.
 */
export default function DemoCtaBand({
  source,
  heading = "See how we teach before you decide.",
  branch,
}: {
  source: string;
  heading?: string;
  /** Pre-selects the branch in the demo form on a course page. */
  branch?: string;
}) {
  const { openDemo, settings } = useSiteUI();

  return (
    <section className="container-site py-12 md:py-16">
      <Reveal variant="scale">
        <div className="relative isolate overflow-hidden rounded-[2rem] bg-red-sheen px-6 py-10 text-white shadow-red-glow sm:px-10 md:px-14 md:py-14">
          <AmbientGlow tone="dark" />
          <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.07]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full border-[18px] border-white/10 animate-float" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ring-1 ring-white/20">
                <span className="animate-wiggle">
                  <GiftIcon size={14} />
                </span>
                Free demo class
              </p>
              <h2 className="mt-5 text-display-md text-white">{heading}</h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
                A live lecture from your branch, a doubt-clearing slot and a study plan - free, with no
                obligation to enroll.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Magnetic>
                  <button
                    type="button"
                    onClick={() => openDemo(source, branch ? { branch } : undefined)}
                    className="btn-onDark w-full text-base sm:w-auto"
                  >
                    Book my free demo
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-nudge-x text-red">
                      <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </Magnetic>
                <WhatsAppLink className="btn border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                  <WhatsAppIcon /> Ask on WhatsApp
                </WhatsAppLink>
              </div>
            </div>
            <div className="lg:justify-self-end">
              <GateCountdown date={settings.gate_exam_date} label={settings.gate_exam_label} tone="dark" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
