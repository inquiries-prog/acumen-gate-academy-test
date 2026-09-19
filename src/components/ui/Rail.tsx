"use client";

import { Children, useEffect, useRef, useState } from "react";

/**
 * Horizontal snap rail on phones, ordinary grid from `sm` up.
 *
 * A row of three cards that stacks into a 1,200px column is the single biggest
 * reason a desktop layout feels wrong on a phone. Below `sm` this turns the
 * same cards into a swipeable row: each card is 78% of the screen so the next
 * one visibly peeks in from the right (the affordance that says "swipe"), the
 * ends dissolve with the existing `.edge-fade-x` mask, a "Swipe" pill with a
 * beckoning arrow sits under the row, and dots plus a "2 / 6" counter track
 * where you are. The peek used to be 15% and the cue a line of small grey
 * text; client testing showed people did not realise there was more.
 *
 * `stack` opts a rail out of all of that: below `sm` it is a plain vertical
 * list with no sideways scrolling, for content the visitor must see in full
 * (the three course cards). From `sm` up it is identical to a normal rail.
 *
 * Details that matter:
 *   - `-mx-5 px-5` bleeds the scroller to the screen edge, matching the
 *     `.container-site` gutter, and `scroll-pl-5` makes each card snap to the
 *     text edge rather than the screen edge.
 *   - `overflow-y-hidden` is mandatory. Cards inside are usually `Reveal`
 *     wrappers that start translated down 24px, and without it that offset
 *     becomes a vertical scrollbar inside the rail.
 *   - Dots use one IntersectionObserver rooted on the scroller, not CSS
 *     scroll-driven animation: iOS 17/18 is still common in this audience.
 *   - No `active:scale` on the cards themselves - a finger resting on a card
 *     before a swipe would trigger it and the card would jitter.
 */
export default function Rail({
  as: Tag = "div",
  children,
  grid,
  gap = "gap-5",
  itemWidth = "w-[78%]",
  hint,
  indicators = true,
  dark = false,
  stack = false,
  className = "",
}: {
  as?: "div" | "ul";
  children: React.ReactNode;
  /** Grid classes applied from `sm` up, e.g. "sm:grid-cols-2 lg:grid-cols-3". */
  grid: string;
  gap?: string;
  /** Card width on a phone. Anything under 100% leaves the next card peeking. */
  itemWidth?: string;
  /** Short nudge shown under the rail on phones, e.g. "Swipe to see all". */
  hint?: string;
  indicators?: boolean;
  /** Dot colours for a charcoal ground. */
  dark?: boolean;
  /** Below `sm`, a vertical list instead of a swipe row. */
  stack?: boolean;
  className?: string;
}) {
  const scrollerRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(0);
  const items = Children.toArray(children);
  const Item = Tag === "ul" ? "li" : "div";

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || stack || !indicators || typeof IntersectionObserver === "undefined") return;
    // Only a real rail needs tracking; the grid from `sm` up never scrolls.
    if (scroller.scrollWidth <= scroller.clientWidth) return;

    const slides = Array.from(scroller.children);
    const observer = new IntersectionObserver(
      (entries) => {
        // The slide with the most of itself on screen is the current one.
        const best = entries.reduce<IntersectionObserverEntry | null>(
          (top, entry) =>
            entry.isIntersecting && (!top || entry.intersectionRatio > top.intersectionRatio)
              ? entry
              : top,
          null,
        );
        if (best) setActive(slides.indexOf(best.target));
      },
      { root: scroller, threshold: 0.6 },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [indicators, stack, items.length]);

  return (
    <div className={className}>
      <Tag
        ref={(node: HTMLElement | null) => {
          scrollerRef.current = node;
        }}
        className={
          stack
            ? `flex flex-col ${gap} max-sm:gap-3 sm:grid ${grid}`
            : `flex snap-x snap-mandatory ${gap} overflow-x-auto overflow-y-hidden
               -mx-5 px-5 pb-6 scroll-pl-5 no-scrollbar max-sm:edge-fade-x
               sm:mx-0 sm:grid sm:overflow-visible sm:px-0 sm:pb-0 sm:scroll-pl-0 ${grid}`
        }
      >
        {items.map((child, i) => (
          <Item
            key={i}
            className={
              stack
                ? "flex w-full [&>*]:w-full"
                : `flex shrink-0 snap-start ${itemWidth} sm:w-auto [&>*]:w-full`
            }
          >
            {child}
          </Item>
        ))}
      </Tag>

      {!stack && (hint || indicators) && (
        <div className="mt-1 flex items-center justify-between gap-4 sm:hidden">
          {hint ? (
            <p
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                dark
                  ? "border-white/15 bg-white/[0.06] text-white/80"
                  : "border-line bg-white text-charcoal shadow-chip"
              }`}
            >
              {hint}
              <svg
                width="14"
                height="14"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
                className="animate-nudge-x text-red"
              >
                <path
                  d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
          ) : (
            <span />
          )}

          {indicators && items.length > 1 && (
            <div className="flex shrink-0 items-center gap-2.5" aria-hidden="true">
              <div className="flex gap-1.5">
                {items.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ease-smooth ${
                      i === active ? "w-6 bg-red" : `w-2 ${dark ? "bg-white/30" : "bg-line"}`
                    }`}
                  />
                ))}
              </div>
              <span
                className={`text-[11px] font-semibold tabular-nums ${dark ? "text-white/50" : "text-muted"}`}
              >
                {active + 1} / {items.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
