"use client";

import { useEffect, useRef } from "react";

/**
 * Counts a figure up from zero the first time it scrolls into view.
 *
 * Built so the admin's exact text always wins (SRS 7.1.3 - one headline number,
 * reproduced identically everywhere):
 *   - the server renders the full string, so crawlers, screen readers and
 *     anyone without JavaScript see "10,000+" and never a zero;
 *   - the final frame writes the ORIGINAL string back verbatim, so grouping
 *     style, prefix and suffix end exactly as typed;
 *   - `aria-label` carries the full value and the animated text is hidden from
 *     assistive technology, so nothing announces intermediate numbers;
 *   - `tabular-nums` keeps every digit the same width, so nothing shifts.
 *
 * One rAF loop for ~1.4s, writing textContent only when the rounded value
 * changes. Skipped entirely under reduced motion or without IntersectionObserver.
 */
export default function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const match = value.match(/^(\D*)([\d,]+)(.*)$/);
    if (!match) return;
    const [, prefix, digits, suffix] = match;
    const target = Number(digits.replace(/,/g, ""));
    if (!Number.isFinite(target) || target <= 0) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        const duration = 1400;
        const start = performance.now();
        let last = -1;

        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // ease-out-expo: fast start, long settle - reads as the number
          // "arriving" rather than ticking.
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          const current = Math.round(target * eased);

          if (t >= 1) {
            node.textContent = value;
            return;
          }
          if (current !== last) {
            last = current;
            node.textContent = `${prefix}${current.toLocaleString("en-IN")}${suffix}`;
          }
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span className={`tabular-nums ${className}`} aria-label={value}>
      <span ref={ref} aria-hidden="true">
        {value}
      </span>
    </span>
  );
}
