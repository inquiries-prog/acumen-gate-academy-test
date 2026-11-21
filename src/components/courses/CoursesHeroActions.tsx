"use client";

import { useSiteUI } from "@/components/site/SiteUI";
import Magnetic from "@/components/ui/Magnetic";
import Reveal from "@/components/ui/Reveal";
import GateCountdown from "./GateCountdown";

/** The /courses hero buttons: free demo first, then browse, plus the countdown. */
export default function CoursesHeroActions() {
  const { openDemo, settings } = useSiteUI();
  return (
    <Reveal delay={120} className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Magnetic>
          <button type="button" onClick={() => openDemo("Courses hero")} className="btn-primary w-full text-base sm:w-auto">
            🎓 Book a free demo class
          </button>
        </Magnetic>
        <a href="#all-courses" className="btn-secondary">
          Browse courses
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="rotate-90">
            <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <GateCountdown
        date={settings.gate_exam_date}
        label={settings.gate_exam_label}
        variant="chip"
        className="mt-5"
      />
    </Reveal>
  );
}
