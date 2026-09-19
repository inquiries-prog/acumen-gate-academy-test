"use client";

import { useRef } from "react";
import Image from "next/image";
import { useSiteUI } from "@/components/site/SiteUI";
import type { GalleryImage } from "@/lib/types";

/**
 * "In the News" strip (SRS 7.2.7).
 *
 * Manually controlled with left/right arrows - deliberately NOT auto-scrolling
 * like the homepage carousel. Clicking a clipping opens the same shared
 * lightbox the carousel uses; the SRS asks for reuse here, not a second
 * implementation.
 *
 * The strip is also a native touch-scroller, so swiping works on mobile.
 */
export default function PressStrip({ images }: { images: GalleryImage[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const { push } = useSiteUI();

  if (images.length === 0) return null;

  function scrollBy(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    // Roughly one card, so a click always lands on a card boundary.
    el.scrollBy({ left: direction * Math.max(260, el.clientWidth * 0.7), behavior: "smooth" });
  }

  return (
    <section id="press" className="section section-alt scroll-mt-28">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Press</p>
            <h2 className="h-section mt-4">In the News</h2>
          </div>
          <div className="flex gap-2">
            <ArrowButton direction={-1} onClick={() => scrollBy(-1)} />
            <ArrowButton direction={1} onClick={() => scrollBy(1)} />
          </div>
        </div>

        <ul
          ref={scrollerRef}
          className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 no-scrollbar"
        >
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => push({ kind: "lightbox", images, index: i })}
                aria-label={`Enlarge: ${img.alt_text || "press clipping"}`}
                className="block overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-card-hover"
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || "Newspaper coverage of Acumen Gate Academy students"}
                  width={300}
                  height={220}
                  loading="lazy"
                  className="h-52 w-auto object-cover sm:h-60"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ArrowButton({ direction, onClick }: { direction: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === -1 ? "Scroll left" : "Scroll right"}
      className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-white text-charcoal shadow-chip transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-red hover:text-red"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d={direction === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
