"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BranchArt from "@/components/courses/BranchArt";
import { announceCoursesMode } from "@/components/courses/CoursesExplorer";
import GateCountdown from "@/components/courses/GateCountdown";
import { GiftIcon } from "./DemoHooks";
import { useSiteUI } from "./SiteUI";

/**
 * "Courses" in the header, with its dropdown (desktop, from `xl`).
 *
 * Opens on hover - with a short grace period on the way out, so moving the
 * pointer diagonally into the panel doesn't close it - and on keyboard focus
 * or a click on the chevron. The label itself is a link to /courses, so a
 * click always lands somewhere useful. Escape closes it and returns focus.
 *
 * Panel: the six GATE branches as tiles with their artwork, then the format
 * shortcuts (classroom / online), GPSC, and a free demo card with the
 * countdown - one place that answers "what do you teach, how, and how do I
 * try it".
 */
export default function CoursesMenu({ active }: { active: boolean }) {
  const { courses, openDemo, settings } = useSiteUI();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const gate = courses.filter((c) => c.category === "gate");
  const other = courses.filter((c) => c.category !== "gate");

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        wrapRef.current?.querySelector<HTMLElement>("a")?.focus();
      }
    }
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  function show() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function hide() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  }

  return (
    // Deliberately NOT position:relative - the panel is positioned against
    // the full-width header bar, so it centres on the page rather than on the
    // word "Courses" (which would push it off the left edge).
    <div
      ref={wrapRef}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) hide();
      }}
    >
      <div className="flex items-center">
        <Link
          href="/courses"
          aria-haspopup="true"
          aria-expanded={open}
          className={`relative flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200
                      after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-red
                      after:transition-transform after:duration-300 after:ease-smooth hover:text-red ${
                        active || open ? "text-red after:scale-x-100" : "text-charcoal after:scale-x-0"
                      }`}
        >
          Courses
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-300 ease-smooth ${open ? "rotate-180" : ""}`}
          >
            <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[min(860px,calc(100vw-48px))] -translate-x-1/2 pt-3">
          <div className="grid origin-top grid-cols-[1fr_260px] overflow-hidden rounded-3xl border border-line bg-white shadow-lifted animate-drop-in">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">GATE coaching by branch</p>
                <Link href="/courses" className="text-xs font-bold text-red hover:underline">
                  All courses →
                </Link>
              </div>
              <ul className="mt-3 grid grid-cols-2 gap-2">
                {gate.map((c, i) => (
                  <li key={c.slug} className="animate-reveal" style={{ animationDelay: `${40 + i * 35}ms` }}>
                    <Link
                      href={`/courses/${c.slug}`}
                      className="group/item flex items-center gap-3 rounded-2xl border border-transparent p-2 transition-all duration-200 hover:border-line hover:bg-offwhite"
                    >
                      <span className="relative grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-offwhite to-red/[0.07] transition-transform duration-300 ease-smooth group-hover/item:scale-105">
                        <BranchArt code={c.branch_code} className="h-full w-full" animated={false} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="rounded-md bg-charcoal px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white transition-colors group-hover/item:bg-red">
                            {c.branch_code}
                          </span>
                          <span className="truncate text-sm font-bold text-charcoal group-hover/item:text-red">
                            {c.short_title || c.title}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">Classroom &amp; live online</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
                <Link href="/courses?mode=offline" onClick={() => announceCoursesMode("offline")} className="rounded-xl bg-offwhite px-3 py-2.5 transition-colors hover:bg-red/[0.06]">
                  <span className="block text-sm font-bold text-charcoal">🏫 Classroom</span>
                  <span className="block text-[11px] text-muted">Vadodara centre</span>
                </Link>
                <Link href="/courses?mode=online" onClick={() => announceCoursesMode("online")} className="rounded-xl bg-offwhite px-3 py-2.5 transition-colors hover:bg-red/[0.06]">
                  <span className="block text-sm font-bold text-charcoal">💻 Live online</span>
                  <span className="block text-[11px] text-muted">Anywhere in India</span>
                </Link>
                {other.map((c) => (
                  <Link key={c.slug} href={`/courses/${c.slug}`} className="rounded-xl bg-offwhite px-3 py-2.5 transition-colors hover:bg-red/[0.06]">
                    <span className="block text-sm font-bold text-charcoal">🏛️ {c.short_title || c.title}</span>
                    <span className="block text-[11px] text-muted">State engineering posts</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative isolate flex flex-col overflow-hidden bg-charcoal bg-dark-sheen p-6 text-white">
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-red/40 blur-3xl animate-glow-b" />
              <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-red text-white shadow-red-glow animate-wiggle">
                <GiftIcon size={20} />
              </span>
              <p className="relative mt-4 font-display text-xl font-extrabold leading-tight">Not sure yet? Try a free class.</p>
              <p className="relative mt-2 text-sm leading-relaxed text-white/65">
                A live lecture from your branch with an Acumen mentor. No fee, no obligation.
              </p>
              <GateCountdown
                date={settings.gate_exam_date}
                label={settings.gate_exam_label}
                variant="chip"
                tone="dark"
                className="relative mt-4 self-start"
              />
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openDemo("Courses menu");
                }}
                className="btn-onDark btn-sm relative mt-auto w-full"
              >
                Book free demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** The same list inside the full-screen mobile menu. */
export function MobileCoursesList() {
  const { courses } = useSiteUI();
  return (
    <ul className="grid grid-cols-2 gap-2 pb-4 animate-slideUp">
      <li className="col-span-2">
        <Link href="/courses" className="flex items-center justify-between rounded-xl bg-red/[0.06] px-3.5 py-3 text-sm font-bold text-red">
          All courses <span aria-hidden="true">→</span>
        </Link>
      </li>
      {courses.map((c) => (
        <li key={c.slug}>
          <Link
            href={`/courses/${c.slug}`}
            className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 text-sm font-semibold text-charcoal active:bg-offwhite"
          >
            <span className="rounded-md bg-charcoal px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white">
              {c.category === "gpsc" ? "GPSC" : c.branch_code}
            </span>
            <span className="truncate">{c.short_title || c.title}</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href="/courses?mode=offline" onClick={() => announceCoursesMode("offline")} className="block rounded-xl bg-offwhite px-3 py-2.5 text-sm font-semibold text-charcoal">
          🏫 Classroom
        </Link>
      </li>
      <li>
        <Link href="/courses?mode=online" onClick={() => announceCoursesMode("online")} className="block rounded-xl bg-offwhite px-3 py-2.5 text-sm font-semibold text-charcoal">
          💻 Live online
        </Link>
      </li>
    </ul>
  );
}
