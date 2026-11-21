"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import CourseCard, { type CourseCardData } from "./CourseCard";

type Mode = "all" | "offline" | "online";

const MODE_EVENT = "acumen:courses-mode";

/**
 * Called by links to /courses?mode=... (header menu, homepage, chat). When the
 * visitor is already on /courses the page doesn't remount on such a link, so
 * the grid listens for this to switch format in place.
 */
export function announceCoursesMode(mode: Mode) {
  window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: mode }));
}

const MODES: Array<{ key: Mode; label: string; short: string; hint: string }> = [
  { key: "all", label: "All courses", short: "All", hint: "Every branch, every format" },
  { key: "offline", label: "Classroom · Vadodara", short: "Classroom", hint: "Small batches, in person" },
  { key: "online", label: "Live online", short: "Online", hint: "Live classes + recordings" },
];

/**
 * The course grid on /courses with an All / Classroom / Online switch.
 *
 * The switch is mirrored in the address (?mode=offline), which is what the
 * header menu, homepage cards and chat widget link to - replacing the old
 * "Offline Courses" / "Online Courses" popups with one page that can show
 * either. The address is read after mount rather than on the server, so the
 * page itself stays statically cached.
 *
 * The selected pill slides between options; cards re-filter with a short
 * staggered fade.
 */
export default function CoursesExplorer({ items }: { items: CourseCardData[] }) {
  const [mode, setMode] = useState<Mode>("all");

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("mode");
    if (param === "offline" || param === "online") setMode(param);

    function onAnnounce(e: Event) {
      const next = (e as CustomEvent<Mode>).detail;
      if (next === "all" || next === "offline" || next === "online") setMode(next);
    }
    window.addEventListener(MODE_EVENT, onAnnounce);
    return () => window.removeEventListener(MODE_EVENT, onAnnounce);
  }, []);

  function choose(next: Mode) {
    setMode(next);
    const url = new URL(window.location.href);
    if (next === "all") url.searchParams.delete("mode");
    else url.searchParams.set("mode", next);
    window.history.replaceState(null, "", url);
  }

  const visible =
    mode === "all" ? items : items.filter((item) => item.batches.some((b) => b.mode === mode));
  const activeIndex = MODES.findIndex((m) => m.key === mode);

  return (
    <div>
      <div
        role="group"
        aria-label="Course format"
        className="relative mx-auto grid max-w-2xl grid-cols-3 rounded-2xl border border-line bg-white p-1.5 shadow-card"
      >
        <span
          aria-hidden="true"
          className="absolute bottom-1.5 top-1.5 rounded-xl bg-charcoal shadow-lifted transition-transform duration-500 ease-smooth"
          style={{
            width: "calc((100% - 0.75rem) / 3)",
            left: "0.375rem",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            aria-pressed={mode === m.key}
            onClick={() => choose(m.key)}
            className={`relative z-10 rounded-xl px-2 py-2.5 text-center transition-colors duration-300 ${
              mode === m.key ? "text-white" : "text-charcoal hover:text-red"
            }`}
          >
            <span className="block text-[13px] font-bold leading-tight sm:text-sm">
              <span className="sm:hidden">{m.short}</span>
              <span className="hidden sm:inline">{m.label}</span>
            </span>
            <span className={`mt-0.5 hidden text-[11px] sm:block ${mode === m.key ? "text-white/65" : "text-muted"}`}>
              {m.hint}
            </span>
          </button>
        ))}
      </div>

      <div key={mode} className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item, i) => (
          <Reveal key={item.course.id} delay={(i % 3) * 90} distance="lg" className="h-full">
            <CourseCard data={item} mode={mode} />
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line bg-offwhite px-6 py-12 text-center text-sm text-body">
          No courses in this format right now - call us and we&apos;ll tell you what&apos;s coming up.
        </p>
      )}
    </div>
  );
}
