"use client";

import { useState } from "react";
import { GPSC_TRACKS } from "@/lib/gpsc";

/**
 * The GPSC exam pattern as a stage timeline, with a switch between the two
 * patterns an engineer usually meets: the Assistant Engineer / Deputy
 * Executive Engineer test, and the Gujarat Engineering Service exam.
 */
export default function GpscPattern() {
  const [key, setKey] = useState(GPSC_TRACKS[0].key);
  const track = GPSC_TRACKS.find((t) => t.key === key) ?? GPSC_TRACKS[0];
  const index = GPSC_TRACKS.indexOf(track);

  return (
    <div>
      <div
        role="group"
        aria-label="Exam"
        className="relative mx-auto grid max-w-3xl rounded-2xl border border-line bg-white p-1.5 shadow-card"
        style={{ gridTemplateColumns: `repeat(${GPSC_TRACKS.length}, minmax(0, 1fr))` }}
      >
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 top-1.5 rounded-xl bg-charcoal shadow-lifted transition-transform duration-500 ease-smooth"
          style={{
            width: `calc((100% - 0.75rem) / ${GPSC_TRACKS.length})`,
            left: "0.375rem",
            transform: `translateX(${index * 100}%)`,
          }}
        />
        {GPSC_TRACKS.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={t.key === key}
            onClick={() => setKey(t.key)}
            className={`relative z-10 rounded-xl px-1.5 py-2.5 text-center transition-colors duration-300 sm:px-3 ${
              t.key === key ? "text-white" : "text-charcoal hover:text-red"
            }`}
          >
            <span className="block font-display text-[13px] font-extrabold leading-tight sm:text-base">{t.short}</span>
            <span className={`mt-0.5 block text-[11px] leading-tight ${t.key === key ? "text-white/65" : "text-muted"}`}>
              {t.sub}
            </span>
          </button>
        ))}
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center font-display text-base font-bold text-charcoal sm:text-lg">{track.label}</p>

      <ol
        key={track.key}
        className={`mt-8 grid gap-4 ${track.stages.length === 3 ? "lg:grid-cols-[1fr_1.25fr_0.75fr]" : "lg:grid-cols-[1.5fr_0.75fr]"}`}
      >
        {track.stages.map((stage, i) => (
          <li
            key={stage.stage}
            className="relative flex flex-col rounded-3xl border border-line bg-white p-5 shadow-card animate-reveal sm:p-6"
            style={{ animationDelay: `${i * 110}ms` }}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red font-display text-base font-extrabold text-white shadow-red-glow">
                {i + 1}
              </span>
              <div>
                <p className="font-display text-lg font-extrabold leading-tight text-charcoal">{stage.stage}</p>
                <p className="text-xs font-semibold text-muted">{stage.kind}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2.5">
              {stage.papers.map((paper) => (
                <li key={paper.name} className="rounded-2xl bg-offwhite p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-bold leading-snug text-charcoal">{paper.name}</p>
                    {paper.marks !== "-" && (
                      <span className="shrink-0 rounded-full bg-charcoal px-2.5 py-0.5 font-display text-xs font-extrabold text-white">
                        {paper.marks.replace(" each", "")} marks{paper.marks.endsWith(" each") ? " each" : ""}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-body">{paper.detail}</p>
                </li>
              ))}
            </ul>
            {i < track.stages.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -bottom-3.5 left-1/2 z-10 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full border border-line bg-white text-red shadow-chip lg:-right-3.5 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0"
              >
                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="rotate-90 lg:rotate-0">
                  <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mx-auto mt-8 flex max-w-3xl flex-col items-center gap-2 text-center">
        <p className="rounded-2xl bg-charcoal px-5 py-2.5 font-display text-sm font-bold text-white shadow-lifted">{track.merit}</p>
        <p className="rounded-full bg-red/[0.07] px-4 py-1.5 text-sm font-semibold text-red">
          Objective (OMR) sections: 0.3 mark is deducted for every wrong answer
        </p>
        <p className="text-xs leading-relaxed text-muted">
          {track.source} Patterns differ between notices, so always read the advertisement for your post.
        </p>
      </div>
    </div>
  );
}
