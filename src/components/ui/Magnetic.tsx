"use client";

import { useEffect, useRef } from "react";

/**
 * Makes a button lean toward the cursor.
 *
 * Wrap one control. While the pointer is within the wrapper's hit area the
 * wrapper translates toward it by up to `pull` pixels, and springs back when
 * the pointer leaves. The hit area is the wrapper's own box, so the button
 * starts leaning as the cursor approaches its edge, not only once it is over
 * the label - which is what makes the effect read as "magnetic".
 *
 * Desktop only: bails without a fine hovering pointer or under reduced
 * motion. One transform per animation frame from a rect cached on enter, so
 * nothing is measured while the pointer moves. Layout is never touched - the
 * wrapper is `inline-block` and the child keeps its own size.
 */
export default function Magnetic({
  children,
  pull = 6,
  className = "",
}: {
  children: React.ReactNode;
  pull?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rect: DOMRect | null = null;
    let dx = 0;
    let dy = 0;
    let frame = 0;

    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    };
    const onEnter = () => {
      rect = el.getBoundingClientRect();
      // Snap to the cursor while it is inside; ease back out on leave.
      el.style.transitionDuration = "120ms";
    };
    const onMove = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect();
      // -1..1 across the box, scaled to the pull distance.
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      dx = Math.max(-1, Math.min(1, nx)) * pull;
      dy = Math.max(-1, Math.min(1, ny)) * pull;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      rect = null;
      dx = 0;
      dy = 0;
      el.style.transitionDuration = "";
      if (!frame) frame = requestAnimationFrame(paint);
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [pull]);

  return (
    <span
      ref={ref}
      className={`inline-block transition-transform duration-[420ms] ease-smooth [&>*]:w-full ${className}`}
    >
      {children}
    </span>
  );
}
