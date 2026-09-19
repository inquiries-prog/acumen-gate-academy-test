"use client";

import { useEffect, useRef } from "react";

/**
 * A soft red light that follows the cursor across a card.
 *
 * Drop it in as the first child of any card that is `group relative
 * overflow-hidden`. It attaches its listeners to the parent, so the sections
 * that render these cards can stay server components - only this small span
 * is client-side.
 *
 * Desktop only, twice over: the effect bails unless the device has a fine
 * pointer that can hover, and the `group-hover` reveal is already wrapped in
 * `@media (hover: hover)` by Tailwind. Nothing here fires on a touch screen.
 * Position is written as one transform per animation frame from a rect cached
 * on enter - no layout reads while the cursor moves.
 */
export default function Spotlight({ size = 360, alpha = 0.12 }: { size?: number; alpha?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rect: DOMRect | null = null;
    let x = 0;
    let y = 0;
    let frame = 0;
    const half = size / 2;

    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`;
    };
    const onEnter = () => {
      rect = host.getBoundingClientRect();
    };
    const onMove = (e: MouseEvent) => {
      if (!rect) rect = host.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      rect = null;
    };

    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    return () => {
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [size]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-[1] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(227,30,36,${alpha}) 0%, rgba(227,30,36,0) 60%)`,
        transform: "translate3d(-9999px, 0, 0)",
      }}
    />
  );
}
