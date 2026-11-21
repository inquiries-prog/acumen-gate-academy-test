"use client";

import { useState } from "react";
import type { CourseSubject } from "@/lib/types";
import { toLines } from "@/lib/utils";
import { useInView } from "./useInView";

/** The upper number in a weightage like "≈ 8–10 marks", for the bar length. */
function weight(text: string): number {
  const numbers = (text.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  return numbers.length ? Math.max(...numbers) : 0;
}

/**
 * The syllabus, subject by subject. Each row shows the subject, its typical
 * marks as a bar (so the heavy sections stand out at a glance) and a topic
 * count; opening a row lays the topics out as chips.
 *
 * Every topic is in the HTML whether a row is open or not, so the full
 * syllabus is crawlable - the closed rows are hidden with `hidden`, not left
 * unrendered.
 */
export default function SyllabusAccordion({ subjects }: { subjects: CourseSubject[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(subjects[2] ? [subjects[2].id] : []));
  const { ref, inView } = useInView<HTMLDivElement>();
  const maxWeight = Math.max(1, ...subjects.map((s) => weight(s.weightage)));
  const allOpen = open.size === subjects.length;

  function toggle(id: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const totalTopics = subjects.reduce((n, s) => n + toLines(s.topics).length, 0);

  return (
    <div ref={ref}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-body">
          <span className="font-bold text-charcoal">{subjects.length} subjects</span> ·{" "}
          <span className="font-bold text-charcoal">{totalTopics} topics</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(subjects.map((s) => s.id)))}
          className="text-sm font-bold text-red underline-offset-4 hover:underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <ol className="mt-4 space-y-2.5">
        {subjects.map((subject, i) => {
          const isOpen = open.has(subject.id);
          const topics = toLines(subject.topics);
          const w = weight(subject.weightage);
          return (
            <li
              key={subject.id}
              className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 ease-smooth ${
                isOpen ? "border-red/30 shadow-card" : "border-line hover:border-red/20"
              }`}
            >
              <h3>
                <button
                  type="button"
                  onClick={() => toggle(subject.id)}
                  aria-expanded={isOpen}
                  aria-controls={`syllabus-${subject.id}`}
                  className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-sm font-extrabold transition-colors duration-300 ${
                      isOpen ? "bg-red text-white" : "bg-offwhite text-charcoal"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-bold leading-snug text-charcoal sm:text-base">
                      {subject.subject}
                    </span>
                    <span className="mt-1.5 flex items-center gap-3">
                      {w > 0 && (
                        <span className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-line">
                          <span
                            className="block h-full rounded-full bg-red-sheen transition-[width] duration-[1200ms] ease-smooth"
                            style={{ width: inView ? `${(w / maxWeight) * 100}%` : "0%", transitionDelay: `${i * 60}ms` }}
                          />
                        </span>
                      )}
                      <span className="shrink-0 text-xs font-semibold text-muted">
                        {subject.weightage ? `${subject.weightage} · ` : ""}
                        {topics.length} topics
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                      isOpen ? "rotate-45 border-red text-red" : "border-line text-charcoal"
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              </h3>
              <div id={`syllabus-${subject.id}`} hidden={!isOpen} className="px-4 pb-5 sm:px-5 sm:pl-[4.25rem]">
                <ul className="flex flex-wrap gap-2">
                  {topics.map((topic, j) => (
                    <li
                      key={topic}
                      className="rounded-full border border-line bg-offwhite px-3 py-1.5 text-[13px] font-medium text-charcoal animate-pop"
                      style={{ animationDelay: `${j * 35}ms` }}
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
