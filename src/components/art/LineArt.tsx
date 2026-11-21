"use client";

import type { ReactNode } from "react";
import { useInView } from "@/components/courses/useInView";

/**
 * The frame for every animated line illustration on the site.
 *
 * Adds `is-drawn` the first time the drawing scrolls into view; the CSS in
 * globals.css (.la / .la-d / .la-f) then draws the strokes and pops the
 * accents in, staggered by each element's --d. Decorative by default
 * (aria-hidden); pass `label` when the picture carries meaning.
 */
export default function LineArt({
  viewBox,
  className = "",
  label,
  children,
}: {
  viewBox: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInView<SVGSVGElement>("0px 0px -8% 0px");
  return (
    <svg
      ref={ref}
      viewBox={viewBox}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`la ${inView ? "is-drawn" : ""} ${className}`}
    >
      {children}
    </svg>
  );
}
