"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/lib/useFocusTrap";
import AmbientGlow from "./AmbientGlow";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<Size, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  // The batches modal must be "large, spacious" and never cramped (SRS 7.1.6).
  xl: "sm:max-w-4xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  size?: Size;
  /** Bare frame with no chrome - used by the video and image lightboxes. */
  bare?: boolean;
  /** Small label above the title, e.g. "Free counselling". */
  eyebrow?: string;
  /** An animated line icon shown beside the title (components/art). */
  icon?: React.ReactNode;
  /** Optional content pinned under the title inside the header (e.g. a stepper). */
  headerExtra?: React.ReactNode;
  /** False hides the close button (e.g. while a payment is being set up). */
  dismissible?: boolean;
  children: React.ReactNode;
}

/** Swipe further than this on the handle and the sheet dismisses. */
const DISMISS_THRESHOLD_PX = 80;

const isPhone = () => window.matchMedia("(max-width: 639px)").matches;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * One modal implementation for every popup on the site (SRS 3.4 requires all of
 * them to behave on mobile, so they share a single responsive shell).
 *
 * On a phone it is a true bottom sheet: it rises from below the viewport, has a
 * drag handle, and can be swiped down to dismiss. From `sm` up it is a centred
 * dialog with the original short fade. Both are pure CSS animations; the swipe
 * writes one inline transform and never touches React state per frame.
 *
 * The decorative layers - drifting glow on the backdrop, a slow conic halo
 * around the panel edge on desktop - animate transform and opacity only, and
 * are frozen entirely under reduced motion.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  bare = false,
  eyebrow,
  icon,
  headerExtra,
  dismissible = true,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startY: 0, dy: 0, active: false });

  useFocusTrap(panelRef, open, onClose);

  useEffect(() => {
    if (!open) return;

    // Lock the background without the layout shifting as the scrollbar goes.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Desktop: focus the first field so keyboard users can type at once.
    // Phone: focus the panel itself. Focusing a field would summon the keyboard
    // over the sheet while it is still rising, which feels broken.
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = isPhone()
        ? panel
        : panel.querySelector<HTMLElement>(
            'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          );
      target?.focus({ preventScroll: true });
    }, 40);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // --- Swipe-to-dismiss. Listeners live on the grab region only (handle +
  // header), so scrolling the sheet's body can never trigger a dismiss.
  function onTouchStart(e: React.TouchEvent) {
    if (!isPhone() || e.touches.length !== 1 || !panelRef.current) return;
    drag.current = { startY: e.touches[0].clientY, dy: 0, active: true };
    panelRef.current.style.transition = "none";
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!drag.current.active || !panelRef.current) return;
    const dy = Math.max(0, e.touches[0].clientY - drag.current.startY);
    drag.current.dy = dy;
    // Under reduced motion the sheet does not follow the finger; the gesture
    // still dismisses at the threshold, because it is an interaction, not a
    // decoration.
    if (!reducedMotion()) panelRef.current.style.transform = `translateY(${dy}px)`;
  }

  function onTouchEnd() {
    if (!drag.current.active || !panelRef.current) return;
    drag.current.active = false;
    const panel = panelRef.current;

    if (drag.current.dy > DISMISS_THRESHOLD_PX) {
      if (reducedMotion()) {
        onClose();
        return;
      }
      panel.style.transition = "transform .2s ease-in";
      panel.style.transform = "translateY(100%)";
      window.setTimeout(onClose, 200);
    } else {
      panel.style.transition = "transform .25s cubic-bezier(0.16,1,0.3,1)";
      panel.style.transform = "";
    }
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop: dim, blur, and a slow red drift behind everything.
          touch-none stops iOS scrolling the page through it. */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default touch-none bg-charcoal/70 backdrop-blur-md animate-fadeIn"
      />
      <AmbientGlow tone="dark" className="animate-fadeIn" />

      <div className={`relative z-10 w-full ${sizeClass[size]}`}>
        {/* Conic halo, sweeping slowly around the panel edge. Desktop only -
            on a phone the sheet is edge-to-edge and has no border to travel. */}
        {!bare && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px hidden overflow-hidden rounded-2xl sm:block"
          >
            <span
              className="absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow opacity-70"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(227,30,36,0.55) 40deg, transparent 110deg, transparent 250deg, rgba(227,30,36,0.35) 300deg, transparent 360deg)",
              }}
            />
          </span>
        )}

        <div
          ref={panelRef}
          tabIndex={-1}
          className={`relative flex w-full flex-col overflow-hidden bg-white outline-none
                      max-h-sheet animate-sheetUp sm:animate-slideUp
                      rounded-t-3xl sm:rounded-2xl
                      ${bare ? "bg-transparent" : "shadow-lifted"}`}
        >
          {!bare && (
            // Grab region: the only place a swipe-down is read from.
            <div
              className="shrink-0 select-none touch-pan-x"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              {/* Drag handle - the cue that this sheet can be pulled down. */}
              <div className="flex justify-center bg-charcoal pt-2.5 sm:hidden" aria-hidden="true">
                <span className="h-1.5 w-10 rounded-full bg-white/25" />
              </div>

              {(title || subtitle) && (
                // Dark header band: charcoal with a slow red glow and a faint
                // grid, the same treatment as the free demo panel, so every
                // form on the site opens with the same confident header.
                <div className="relative isolate overflow-hidden bg-charcoal bg-dark-sheen px-5 pb-5 pt-4 text-white sm:px-7 sm:pt-6">
                  <span aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.05]" />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-red/40 blur-3xl animate-glow-a"
                  />
                  <div className="relative flex items-start gap-4">
                    {icon && (
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                        {icon}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      {eyebrow && (
                        <p className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-red">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red" />
                          </span>
                          {eyebrow}
                        </p>
                      )}
                      {title && (
                        <h2 className="font-display text-xl font-bold leading-snug text-white sm:text-[1.45rem]">
                          {title}
                        </h2>
                      )}
                      {subtitle && (
                        <p className="mt-1.5 text-sm leading-relaxed text-white/65">{subtitle}</p>
                      )}
                    </div>
                    {dismissible && <CloseButton onClose={onClose} onDark />}
                  </div>
                  {headerExtra && <div className="relative mt-5">{headerExtra}</div>}
                </div>
              )}
            </div>
          )}

          {bare && (
            <div className="absolute right-2 top-2 z-20">
              <CloseButton onClose={onClose} onDark />
            </div>
          )}

          {/* overscroll-contain: reaching the end of the form never scrolls
              the page behind the sheet. pb-safe-6 clears the home indicator. */}
          <div
            className={
              bare
                ? "overflow-y-auto overscroll-contain"
                : "overflow-y-auto overscroll-contain px-5 py-6 pb-safe-6 sm:px-7 sm:pb-6"
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function CloseButton({ onClose, onDark = false }: { onClose: () => void; onDark?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      // 44px target - SRS 3.4 calls out cramped close buttons specifically.
      className={`group grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all
                  duration-200 ease-smooth active:scale-95 ${
                    onDark
                      ? "bg-white/10 text-white ring-1 ring-white/15 hover:bg-red hover:ring-red"
                      : "text-body hover:bg-red hover:text-white"
                  }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        className="transition-transform duration-300 ease-smooth group-hover:rotate-90"
      >
        <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
