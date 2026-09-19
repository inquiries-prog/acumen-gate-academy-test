"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveals its children once they scroll into view.
 *
 * Deliberately tiny: one IntersectionObserver, no animation library, and it
 * disconnects the moment an element has been shown. SRS 3.5 caps the JS budget
 * and rules out heavy animation, so this is the whole motion system.
 *
 * It fails open three ways, because content that never appears is far worse
 * than content that appears without animation:
 *   - no IntersectionObserver, or reduced motion preferred -> visible at once;
 *   - JavaScript disabled entirely -> the `.js-reveal` rule in globals.css
 *     forces it visible, since this component's effect would never run;
 *   - either way the markup is always present in the server HTML, so crawlers
 *     and screen readers see the content regardless.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Stagger, in ms. Keep small - long chains feel sluggish, not premium. */
  delay?: number;
  as?: "div" | "li" | "section" | "article";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      // Fire slightly before the element reaches the fold, so it is already
      // settling by the time the reader gets to it.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // One ref serves every tag this renders as, so it is assigned through a
      // callback rather than a element-typed RefObject.
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`js-reveal transition-[opacity,transform] duration-700 ease-smooth motion-reduce:transition-none ${
        shown ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
