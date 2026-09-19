"use client";

import { useEffect, useRef } from "react";

/**
 * A 2px red line along the bottom of the sticky header that grows with scroll.
 *
 * On a phone there is no scrollbar, so this is the only sense of "how much is
 * left". On desktop it doubles as a natural cap to the header. One passive
 * scroll listener, coalesced into a single rAF, writing `scaleX` directly -
 * no React state, no layout reads beyond the two scroll metrics.
 *
 * Scroll-driven rather than time-based, so it is left running under reduced
 * motion: it only ever moves as far as the reader has scrolled.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bar = ref.current;
    if (!bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      bar.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-red"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
