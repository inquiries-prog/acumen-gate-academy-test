"use client";

import Image from "next/image";
import { useSiteUI } from "@/components/site/SiteUI";
import type { GalleryImage } from "@/lib/types";

/**
 * Auto-scrolling result / press carousel (SRS 7.1.2).
 *
 * Two rows counter-scrolling at different speeds, tilted a couple of degrees
 * and set on charcoal. The client's posts are bright, busy squares; on white
 * they compete with the page, and on a dark ground with a warm wash behind them
 * they read as a wall of proof instead of a filmstrip.
 *
 * Everything the SRS requires is preserved:
 *   - slow and continuous, never fast or jarring (the client explicitly asked
 *     for this to be slowed down from an earlier version, so both rows run well
 *     over a minute per lap);
 *   - clicking any image pauses the scroll and opens it enlarged in the shared
 *     lightbox; closing resumes;
 *   - the pause is driven by `lightboxOpen` from the site-wide provider, which
 *     is also why this keeps working across route changes.
 *
 * Renders nothing until the client has uploaded images through the admin panel.
 */
export default function Carousel({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  // Two rows. With a single image the second row would duplicate it, so fall
  // back to one row until there is enough to split.
  const split = Math.ceil(images.length / 2);
  const rowA = images.length > 3 ? images.slice(0, split) : images;
  const rowB = images.length > 3 ? images.slice(split) : [];

  return (
    <section
      aria-label="Student results and press coverage"
      className="relative isolate overflow-hidden bg-charcoal py-14 md:py-16"
    >
      {/* Static wash - the two marquees are already animating in this band, so
          no drifting glow here, to keep the compositor budget sensible. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(65%_120%_at_50%_-10%,rgba(227,30,36,0.28),transparent_65%)]"
      />

      {/* The tilt. Scaled up so the rotated rows still cover the full width. */}
      <div className="relative -rotate-[1.5deg] scale-[1.06] space-y-4 md:space-y-5">
        <MarqueeRow images={rowA} all={images} offset={0} speed="slow" />
        {rowB.length > 0 && (
          <MarqueeRow images={rowB} all={images} offset={rowA.length} speed="reverse" />
        )}
      </div>

      {/* Cards dissolve at both ends rather than being sliced off mid-image. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-charcoal to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-charcoal to-transparent sm:w-32" />
    </section>
  );
}

function MarqueeRow({
  images,
  all,
  offset,
  speed,
}: {
  images: GalleryImage[];
  /** The full library, so the lightbox can page through every image. */
  all: GalleryImage[];
  /** Index of this row's first image within `all`. */
  offset: number;
  speed: "slow" | "reverse";
}) {
  const { push, lightboxOpen } = useSiteUI();

  // Duplicated once so the 50% translation loops seamlessly.
  const track = [...images, ...images];

  return (
    <div className="group/row relative overflow-hidden">
      <ul
        className={`marquee-track flex w-max gap-4 md:gap-5 ${
          speed === "slow" ? "animate-marquee-slow" : "animate-marquee-reverse"
        } ${lightboxOpen ? "[animation-play-state:paused]" : ""}`}
      >
        {track.map((img, i) => {
          const indexInRow = i % images.length;
          return (
            <li key={`${img.id}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => push({ kind: "lightbox", images: all, index: offset + indexInRow })}
                aria-label={`Enlarge: ${img.alt_text || "result image"}`}
                className="relative block h-32 w-32 overflow-hidden rounded-2xl border border-white/10
                           bg-charcoal shadow-lifted transition-all duration-500 ease-smooth
                           hover:z-20 hover:scale-[1.12] hover:-rotate-[1.5deg] hover:border-red
                           sm:h-40 sm:w-40 md:h-44 md:w-44
                           group-hover/row:opacity-55 hover:!opacity-100"
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || "Acumen Gate Academy student result"}
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 176px"
                  loading="lazy"
                  className="object-cover"
                />
                {/* Press clippings are tall pages; a scrim keeps the crop from
                    looking like an accident next to the square result posts. */}
                {img.kind === "press" && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
