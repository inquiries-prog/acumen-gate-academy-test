"use client";

import { useState } from "react";
import Image from "next/image";
import { useSiteUI } from "@/components/site/SiteUI";
import type { GalleryImage } from "@/lib/types";

/**
 * The full result-post archive (SRS 7.4).
 *
 * The Results page exists partly because "the client has ~84 real student
 * result images plus press clippings; the homepage only surfaces a curated
 * handful, so this page is where the rest actually gets used." This section is
 * that use - the homepage carousel shows a curated subset, and everything in
 * the library appears here.
 *
 * Loads a page at a time rather than all 84 at once, so opening the Results
 * page stays fast (SRS 3.5). Clicking any post opens the shared lightbox, the
 * same component the homepage carousel and the About press strip use.
 */
const PAGE_SIZE = 24;

export default function ResultsGallery({ images }: { images: GalleryImage[] }) {
  const [shown, setShown] = useState(PAGE_SIZE);
  const { push } = useSiteUI();

  if (images.length === 0) return null;

  const visible = images.slice(0, shown);
  const remaining = images.length - shown;

  return (
    <section id="archive" className="section scroll-mt-28">
      <div className="container-site">
        <p className="eyebrow">The full picture</p>
        <h2 className="h-section mt-4">Every result we&apos;ve celebrated</h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">
          {images.length} of our students&apos; results, exactly as we shared them. Tap any one to
          see it full size.
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((img, i) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => push({ kind: "lightbox", images, index: i })}
                aria-label={`Enlarge: ${img.alt_text || "student result"}`}
                className="group block w-full overflow-hidden rounded-2xl border border-line bg-offwhite shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-red/25 hover:shadow-card-hover"
              >
                <span className="relative block aspect-square w-full">
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || "Acumen Gate Academy student result"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <div className="mt-7 text-center">
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              className="btn-secondary px-7"
            >
              Show {Math.min(remaining, PAGE_SIZE)} more
            </button>
            <p className="mt-2 text-xs text-muted">
              Showing {visible.length} of {images.length}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
