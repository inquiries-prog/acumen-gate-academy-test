"use client";

import { useEffect, useRef, useState } from "react";

export type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "pop";
export type RevealDistance = "sm" | "md" | "lg";

/**
 * Reveals its children as they scroll into view - and hides them again as
 * they scroll out, so the page animates in both directions.
 *
 * No library: CSS transitions run backwards for free, so all this component
 * does is toggle a class. Two IntersectionObservers give it hysteresis:
 *   - "enter" fires a little before the element reaches the fold, so it is
 *     already settling when the reader gets to it;
 *   - "exit" fires only once the element is COMPLETELY out of the viewport,
 *     so nothing flickers while it is being read.
 *
 * The hidden state is direction-aware. When an element leaves through the top
 * it drifts up and fades; scrolling back up brings it down into place - a
 * rewind of what the reader just saw, not a jump to the wrong side. Leaving
 * through the bottom does the reverse. `left`/`right` keep their axis.
 *
 * Entrances take 700ms plus any stagger `delay`; exits are quicker (450ms)
 * and never delayed, so things get out of the way promptly.
 *
 * Every hidden state is a Tailwind transform utility, which composes through
 * Tailwind's transform variables. That matters: a card's own `hover:` lift
 * keeps working once it is shown, which an arbitrary `[transform:...]` value
 * would clobber.
 *
 * Fails open three ways, because content that never appears is far worse than
 * content that appears without animation:
 *   - no IntersectionObserver, or reduced motion preferred -> visible at once,
 *     and never hidden again;
 *   - JavaScript disabled -> the `.js-reveal` rule in globals.css forces it
 *     visible, since this effect would never run;
 *   - either way the markup is always present in the server HTML.
 */
export default function Reveal({
  children,
  delay = 0,
  variant = "up",
  distance = "md",
  as: Tag = "div",
  className = "",
}: {
  children: React.ReactNode;
  /** Stagger on the way in, in ms. Keep small - long chains feel sluggish. */
  delay?: number;
  variant?: RevealVariant;
  /** How far `up`/`down`/`left`/`right` travel: 16 / 32 / 56 px. */
  distance?: RevealDistance;
  as?: "div" | "li" | "section" | "article" | "p";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  // Which side the element is hidden on. Starts below (the reader scrolls
  // down to it); updated on every exit from where it actually went.
  const [side, setSide] = useState<"above" | "below">("below");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const enter = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true);
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    const exit = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) return;
        setSide(entry.boundingClientRect.top < 0 ? "above" : "below");
        setShown(false);
      },
      { rootMargin: "0px", threshold: 0 },
    );

    enter.observe(node);
    exit.observe(node);
    return () => {
      enter.disconnect();
      exit.disconnect();
    };
  }, []);

  return (
    <Tag
      // One ref serves every tag this renders as, so it is assigned through a
      // callback rather than a element-typed RefObject.
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      style={shown && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`js-reveal transition-[opacity,transform] ease-smooth motion-reduce:transition-none ${
        shown ? "duration-700" : "duration-[450ms]"
      } ${shown ? SHOWN : hiddenClass(variant, distance, side)} ${className}`}
    >
      {children}
    </Tag>
  );
}

const SHOWN = "translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100";

const Y = {
  sm: { below: "translate-y-4", above: "-translate-y-4" },
  md: { below: "translate-y-8", above: "-translate-y-8" },
  lg: { below: "translate-y-14", above: "-translate-y-14" },
} as const;

const X = {
  sm: { left: "-translate-x-4", right: "translate-x-4" },
  md: { left: "-translate-x-8", right: "translate-x-8" },
  lg: { left: "-translate-x-14", right: "translate-x-14" },
} as const;

function hiddenClass(variant: RevealVariant, distance: RevealDistance, side: "above" | "below") {
  switch (variant) {
    case "down":
      // Drops in from above by default; mirrors like `up` once it has left.
      return `opacity-0 ${Y[distance][side === "below" ? "above" : "below"]}`;
    case "left":
      return `opacity-0 ${X[distance].left} rotate-1`;
    case "right":
      return `opacity-0 ${X[distance].right} -rotate-1`;
    case "scale":
      return `opacity-0 scale-90 ${Y.sm[side]}`;
    case "pop":
      return "opacity-0 scale-75";
    case "up":
    default:
      return `opacity-0 ${Y[distance][side]}`;
  }
}
