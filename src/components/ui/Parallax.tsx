"use client";

import { useEffect, useRef } from "react";

/**
 * Moves a decorative layer at a different rate to the page as it scrolls -
 * the depth cue that makes a long page feel layered rather than flat.
 *
 * `speed` is a fraction of the element's distance from the viewport centre:
 * positive lags behind the content (background feel), negative runs ahead.
 * Keep it small; 0.1-0.2 is plenty.
 *
 * One passive scroll listener, one rAF per frame, one `translate3d` write.
 * Nothing is measured on scroll except the element's rect, which is cheap
 * and read once per frame. Desktop only: bails without a fine hovering
 * pointer (phones keep their battery and their scroll performance) or under
 * reduced motion. Only ever wrap decoration - never text or controls, since
 * the offset makes hit-testing feel wrong.
 */
export default function Parallax({
  children,
  speed = 0.15,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const paint = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      // Distance of the element's centre from the viewport's centre, in px.
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(offset * speed).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      el.style.transform = "";
    };
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
