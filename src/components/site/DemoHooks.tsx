"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_BOOKED_KEY } from "./DemoDrawer";
import { useSiteUI } from "./SiteUI";

const NUDGE_DISMISSED_KEY = "acumen-demo-nudge-dismissed";

function read(storage: "local" | "session", key: string): boolean {
  try {
    return (storage === "local" ? localStorage : sessionStorage).getItem(key) === "1";
  } catch {
    return false;
  }
}

function write(storage: "local" | "session", key: string) {
  try {
    (storage === "local" ? localStorage : sessionStorage).setItem(key, "1");
  } catch {
    /* storage blocked - the prompt may appear again next visit, which is harmless */
  }
}

/**
 * The always-there way in: a tab fixed to the right edge of the screen on
 * desktop, reading "Free Demo Class". Phones get the same action as the main
 * button in the sticky bottom bar instead, where a side tab would cover text.
 *
 * Hidden while any popup, the chat or the demo panel itself is open.
 */
export function DemoEdgeTab() {
  const { openDemo, demo, current, chatOpen } = useSiteUI();
  const [ready, setReady] = useState(false);

  // Arrives a moment after the page, so it registers as something new.
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const hidden = !ready || demo.open || current !== null || chatOpen;

  return (
    <button
      type="button"
      onClick={() => openDemo("Edge tab")}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : 0}
      className={`group fixed right-0 top-1/2 z-[70] hidden -translate-y-1/2 lg:block
                  transition-transform duration-500 ease-smooth ${hidden ? "translate-x-full" : "translate-x-0"}`}
    >
      <span
        className="relative flex flex-col items-center gap-2.5 overflow-hidden rounded-l-2xl bg-red-sheen px-3 py-5
                   text-white shadow-red-glow transition-all duration-300 ease-smooth
                   group-hover:-translate-x-1 group-hover:pr-4 group-hover:shadow-lifted"
      >
        <span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-b from-transparent via-white/25 to-transparent animate-sweep-y" />
        <span aria-hidden="true" className="relative grid h-7 w-7 place-items-center rounded-full bg-white/15 animate-wiggle">
          <GiftIcon />
        </span>
        <span className="relative font-display text-[13px] font-extrabold uppercase tracking-[0.14em] [writing-mode:vertical-rl] rotate-180">
          Free Demo Class
        </span>
      </span>
    </button>
  );
}

/**
 * A one-time, gentle prompt: a small card that slides in after the visitor has
 * spent a while on the site, or (on desktop) when the pointer heads for the
 * tab bar to leave. Shown at most once per browser session, never after the
 * visitor has booked, and never over a popup, the chat or the demo panel.
 *
 * The delay and an on/off switch are in admin (site settings), so the client
 * can tone it down without a code change.
 */
export function DemoNudge() {
  const { settings, openDemo, demo, current, chatOpen } = useSiteUI();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  const enabled = settings.demo_nudge_enabled !== false;
  const seconds = Math.max(5, Number(settings.demo_nudge_seconds) || 25);
  const busy = demo.open || current !== null || chatOpen;

  useEffect(() => {
    if (!enabled || pathname?.startsWith("/enroll")) return;
    if (read("local", DEMO_BOOKED_KEY) || read("session", NUDGE_DISMISSED_KEY)) return;

    const timer = window.setTimeout(() => setShow(true), seconds * 1000);

    // Exit intent: the pointer leaving through the top of the window.
    function onLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !e.relatedTarget) setShow(true);
    }
    const canHover = window.matchMedia("(hover: hover)").matches;
    if (canHover) document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.clearTimeout(timer);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, seconds, pathname]);

  function dismiss() {
    setShow(false);
    write("session", NUDGE_DISMISSED_KEY);
  }

  function book() {
    dismiss();
    openDemo("Demo prompt");
  }

  const visible = show && !busy;

  return (
    <div
      role="dialog"
      aria-label="Free demo class"
      aria-hidden={!visible}
      className={`fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[85] sm:left-5 sm:right-auto sm:w-[360px]
                  lg:bottom-5 transition-all duration-500 ease-smooth
                  ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-4 shadow-lifted">
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-red-sheen" />
        <button
          type="button"
          onClick={dismiss}
          tabIndex={visible ? 0 : -1}
          aria-label="Dismiss"
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-offwhite hover:text-charcoal"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex items-start gap-3.5 pl-1.5 pr-6">
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red text-white shadow-red-glow">
            <span aria-hidden="true" className="absolute inset-0 rounded-xl bg-red animate-pulse-ring" />
            <span className="relative">
              <GiftIcon />
            </span>
          </span>
          <div className="min-w-0">
            <p className="font-display text-[15px] font-bold leading-snug text-charcoal">
              Try a class before you decide
            </p>
            <p className="mt-1 text-[13px] leading-snug text-body">
              Book a free GATE demo class with an Acumen mentor. It takes 30 seconds.
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex gap-2 pl-1.5">
          <button type="button" onClick={book} tabIndex={visible ? 0 : -1} className="btn-primary btn-sm flex-1">
            Book free demo
          </button>
          <button type="button" onClick={dismiss} tabIndex={visible ? 0 : -1} className="btn-ghost btn-sm">
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export function GiftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="9" width="17" height="11.5" rx="1.5" stroke="currentColor" strokeWidth="1.9" />
      <path d="M2.5 9h19M12 9v11.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path
        d="M12 9c-1.5-3.5-5.5-4-5.5-1.5S10 9 12 9zm0 0c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
