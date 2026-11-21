"use client";

import { useState } from "react";
import { useSiteUI } from "@/components/site/SiteUI";
import Magnetic from "@/components/ui/Magnetic";

import type { Batch, BatchMode } from "@/lib/types";
import { displayPhone, formatPrice, isPlaceholder, telHref } from "@/lib/utils";

/**
 * The price card beside a course page's hero: switch between classroom and
 * online, see the fee (GST included) and the next start date, then either
 * book the free demo - the primary action, deliberately - or jump to the
 * batches to enroll.
 *
 * On desktop it sticks while the hero scrolls; phones get CourseMobileBar.
 */
export default function CourseHeroCard({
  batches,
  courseTitle,
  branchOption,
}: {
  batches: Batch[];
  courseTitle: string;
  /** The branch as it appears in the forms, to pre-fill the demo form. */
  branchOption?: string;
}) {
  const { openDemo, openEnquiry, settings } = useSiteUI();
  const modes = Array.from(new Set(batches.map((b) => b.mode))) as BatchMode[];
  const [mode, setMode] = useState<BatchMode>(modes[0] ?? "offline");
  const ofMode = batches.filter((b) => b.mode === mode);
  const fees = ofMode.map((b) => Number(b.fees ?? 0)).filter((f) => f > 0);
  const fee = fees.length ? Math.min(...fees) : null;
  const next = ofMode.find((b) => b.start_date && !isPlaceholder(b.start_date));

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-lifted animate-reveal sm:p-7">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-red-sheen" />

      {modes.length > 1 && (
        <div role="group" aria-label="Course format" className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-offwhite p-1">
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={`min-h-10 rounded-lg text-sm font-bold transition-all duration-300 ease-smooth ${
                mode === m ? "bg-white text-charcoal shadow-chip" : "text-muted hover:text-charcoal"
              }`}
            >
              {m === "offline" ? "Classroom" : "Live online"}
            </button>
          ))}
        </div>
      )}

      <div className={modes.length > 1 ? "mt-5" : ""}>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
          {modes.length === 0 ? "Course fee" : mode === "offline" ? "Classroom · Vadodara" : "Live online"}
        </p>
        <p key={`${mode}-${fee}`} className="mt-1 font-display text-4xl font-extrabold text-charcoal animate-slideUp">
          {fee ? formatPrice(fee) : "Ask us"}
        </p>
        <p className="mt-1 text-xs text-muted">{fee ? "Full course fee, GST included" : "Call us for current fees"}</p>
      </div>

      <ul className="mt-5 space-y-2.5 text-sm">
        <li className="flex items-center gap-2.5">
          <Dot /> <span className="text-body">Next batch:</span>
          <span className="font-bold text-charcoal">{next ? next.start_date : "Starting soon"}</span>
        </li>
        {ofMode.length > 1 && (
          <li className="flex items-center gap-2.5">
            <Dot /> <span className="font-bold text-charcoal">{ofMode.length} batch timings</span>
            <span className="text-body">to choose from</span>
          </li>
        )}
        {settings.google_rating && (
          <li className="flex items-center gap-2.5">
            <Dot />
            <span className="text-amber-500">★★★★★</span>
            <span className="font-bold text-charcoal">{settings.google_rating}</span>
            <span className="text-body">on Google</span>
          </li>
        )}
      </ul>

      <div className="mt-6 grid gap-2.5">
        <Magnetic className="block">
          <button
            type="button"
            onClick={() =>
              openDemo(`Course hero: ${courseTitle}`, {
                branch: branchOption,
                mode: mode === "online" ? "Online" : "Offline at Vadodara",
              })
            }
            className="btn-primary w-full text-base"
          >
            🎓 Book a free demo class
          </button>
        </Magnetic>
        {modes.length > 0 ? (
          <a href="#batches" className="btn-secondary w-full">
            See batches &amp; enroll
          </a>
        ) : (
          <button type="button" onClick={() => openEnquiry(`Course hero: ${courseTitle}`)} className="btn-secondary w-full">
            Enquire now
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Questions?{" "}
        <a href={telHref(settings.phone)} className="font-bold text-charcoal hover:text-red">
          Call {displayPhone(settings.phone)}
        </a>
      </p>
    </div>
  );
}

function Dot() {
  return <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-red" />;
}
