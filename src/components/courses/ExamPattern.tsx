"use client";

import Reveal from "@/components/ui/Reveal";
import { GATE_MARKS_SPLIT, GATE_PATTERN_FACTS, GATE_QUESTION_TYPES } from "@/lib/gate-info";
import { useInView } from "./useInView";

const TONE: Record<(typeof GATE_MARKS_SPLIT)[number]["tone"], string> = {
  red: "#E31E24",
  charcoal: "#231F20",
  muted: "#C9C6C3",
};

/**
 * The GATE exam pattern: a donut showing how the 100 marks split, the four
 * headline facts, and the three question types with their marking.
 *
 * The donut draws itself segment by segment the first time it scrolls into
 * view (stroke-dashoffset on each arc - no layout work), and the legend
 * carries the same numbers as text, so nothing depends on seeing the chart.
 */
export default function ExamPattern({ paperName }: { paperName?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
      <div ref={ref} className="relative mx-auto w-full max-w-[340px]">
        <svg viewBox="0 0 200 200" className="w-full -rotate-90" aria-hidden="true">
          <circle cx="100" cy="100" r={radius} stroke="#EDEBE9" strokeWidth="22" fill="none" />
          {GATE_MARKS_SPLIT.map((segment, i) => {
            const length = (segment.marks / 100) * circumference;
            const gap = 3;
            const dash = `${Math.max(length - gap, 0)} ${circumference}`;
            const start = offsetSoFar;
            offsetSoFar += length;
            return (
              <circle
                key={segment.label}
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={TONE[segment.tone]}
                strokeWidth="22"
                strokeLinecap="butt"
                strokeDasharray={dash}
                strokeDashoffset={inView ? -start : -start + length}
                style={{
                  transition: `stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 220}ms, opacity .4s ${i * 220}ms`,
                  opacity: inView ? 1 : 0,
                }}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-5xl font-extrabold text-charcoal">100</p>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">marks</p>
          </div>
        </div>
      </div>

      <div>
        <ul className="space-y-3">
          {GATE_MARKS_SPLIT.map((segment, i) => (
            <Reveal as="li" key={segment.label} delay={i * 90} variant="right">
              <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-chip">
                <span className="h-10 w-2.5 shrink-0 rounded-full" style={{ background: TONE[segment.tone] }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-charcoal">{segment.label}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full transition-[width] duration-[1100ms] ease-smooth"
                      style={{
                        width: inView ? `${segment.marks}%` : "0%",
                        background: TONE[segment.tone],
                        transitionDelay: `${300 + i * 150}ms`,
                      }}
                    />
                  </div>
                </div>
                <p className="font-display text-2xl font-extrabold tabular-nums text-charcoal">
                  {segment.marks}
                  <span className="text-sm font-bold text-muted"> marks</span>
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {paperName ? `${paperName}: ` : ""}subject marks are approximate - engineering mathematics is
          usually about 13 of the 85 subject marks.
        </p>

        <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GATE_PATTERN_FACTS.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 70} variant="pop">
              <div className="rounded-2xl bg-offwhite px-3 py-4 text-center">
                <dt className="sr-only">{fact.label}</dt>
                <dd className="font-display text-2xl font-extrabold text-charcoal">{fact.value}</dd>
                <dd className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted">{fact.label}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2">
        {GATE_QUESTION_TYPES.map((q, i) => (
          <Reveal key={q.code} delay={i * 90}>
            <div className="card-interactive h-full p-5">
              <span className="inline-flex rounded-lg bg-charcoal px-2.5 py-1 font-display text-sm font-extrabold tracking-wide text-white">
                {q.code}
              </span>
              <p className="mt-3 font-display text-base font-bold text-charcoal">{q.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-body">{q.detail}</p>
              <p
                className={`mt-3 text-xs font-bold ${
                  q.negative.startsWith("No") ? "text-charcoal" : "text-red"
                }`}
              >
                {q.negative}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
