"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/MediaImage";
import Spotlight from "@/components/ui/Spotlight";
import { useSiteUI } from "@/components/site/SiteUI";

import type { Batch, Course } from "@/lib/types";
import { formatPrice, isPlaceholder } from "@/lib/utils";
import BranchArt from "./BranchArt";

export interface CourseCardData {
  course: Course;
  batches: Batch[];
}

/**
 * One course in a grid. Artwork (or the uploaded photo) on top; then the
 * title, a two-line pitch, and the two facts students scan for first - when
 * the next batch starts and what it costs - for the selected mode.
 *
 * The whole card is one link to the course page. "Free demo" is a separate
 * button layered above the link, so it doesn't navigate.
 */
export default function CourseCard({
  data,
  mode = "all",
}: {
  data: CourseCardData;
  mode?: "all" | "offline" | "online";
}) {
  const { openDemo } = useSiteUI();
  const { course, batches } = data;
  const relevant = mode === "all" ? batches : batches.filter((b) => b.mode === mode);
  const fees = relevant.map((b) => Number(b.fees ?? 0)).filter((f) => f > 0);
  const fromFee = fees.length ? Math.min(...fees) : null;
  const next = relevant.find((b) => b.start_date && !isPlaceholder(b.start_date));
  const modes = Array.from(new Set(batches.map((b) => b.mode)));
  const code = course.category === "gpsc" ? "GPSC" : course.branch_code;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card
                 transition-all duration-500 ease-smooth hover:-translate-y-2 hover:border-red/25 hover:shadow-card-hover"
    >
      <Spotlight />
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-offwhite via-white to-red/[0.06]">
        {course.image_url ? (
          <MediaImage
            src={course.image_url}
            alt={course.alt_text || course.title}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="transition-transform duration-700 ease-smooth group-hover:scale-105"
          />
        ) : (
          <BranchArt
            code={code}
            className="absolute inset-0 h-full w-full p-3 transition-transform duration-700 ease-smooth group-hover:scale-[1.06]"
          />
        )}
        <span className="absolute left-4 top-4 rounded-xl bg-charcoal px-2.5 py-1 font-display text-sm font-extrabold tracking-wide text-white shadow-chip">
          {code}
        </span>
        <div className="absolute right-4 top-4 flex gap-1.5">
          {modes.map((m) => (
            <span
              key={m}
              className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-charcoal shadow-chip backdrop-blur"
            >
              {m === "offline" ? "Classroom" : "Live online"}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl leading-snug">
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 after:z-[1]">
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">{course.tagline}</p>

        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-left">
          <div className="bg-white px-3.5 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Next batch</dt>
            <dd className="mt-0.5 text-sm font-bold text-charcoal">
              {next ? next.start_date : course.category === "gpsc" ? "Call for dates" : "Starting soon"}
            </dd>
          </div>
          <div className="bg-white px-3.5 py-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-muted">Fee</dt>
            <dd className="mt-0.5 text-sm font-bold text-charcoal">
              {fromFee ? (
                <>
                  {fees.length > 1 && new Set(fees).size > 1 && <span className="font-semibold text-muted">from </span>}
                  {formatPrice(fromFee)}
                </>
              ) : (
                "Ask us"
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-3 pt-6">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-red">
            View course
            <span className="grid h-7 w-7 place-items-center rounded-full bg-red/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-red group-hover:text-white">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
          <button
            type="button"
            onClick={() => openDemo(`Course card: ${course.title}`)}
            className="relative z-[2] rounded-full border border-line px-3.5 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-red hover:text-red"
          >
            🎓 Free demo
          </button>
        </div>
      </div>
    </article>
  );
}
