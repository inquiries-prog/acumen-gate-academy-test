"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element has scrolled into view (and stays true). For one-off
 * entrance effects such as a chart drawing itself or bars filling - unlike
 * Reveal, these should not rewind when scrolled past.
 *
 * Fails open: no IntersectionObserver or reduced motion means "in view" at once.
 */
export function useInView<T extends HTMLElement>(margin = "0px 0px -15% 0px") {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);

  return { ref, inView };
}
