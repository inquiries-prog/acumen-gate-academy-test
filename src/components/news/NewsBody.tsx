"use client";

import Image from "next/image";
import { useSiteUI } from "@/components/site/SiteUI";
import type { GalleryImage } from "@/lib/types";
import { toBodyBlocks } from "@/lib/utils";

/**
 * A news post's text with its images where the admin placed them. Each image
 * has an optional caption, and tapping one opens it full screen with the
 * post's other images a swipe away.
 */
export default function NewsBody({ content, title }: { content: string; title: string }) {
  const { push } = useSiteUI();
  const blocks = toBodyBlocks(content);

  const gallery: GalleryImage[] = blocks.flatMap((b, i) =>
    b.type === "image"
      ? [
          {
            id: `news-img-${i}`,
            image_url: b.url,
            alt_text: b.caption || title,
            kind: "press" as const,
            show_in_carousel: false,
            show_in_news_strip: false,
            sort_order: 0,
          },
        ]
      : [],
  );

  let n = -1;
  return (
    <div className="mt-6 space-y-4">
      {blocks.map((b, i) => {
        if (b.type === "text") {
          return (
            <p key={i} className="text-[15px] leading-relaxed text-body sm:text-base">
              {b.text}
            </p>
          );
        }
        const index = ++n;
        return (
          <figure key={i} className="!my-8">
            <button
              type="button"
              onClick={() => push({ kind: "lightbox", images: gallery, index })}
              className="group block w-full overflow-hidden rounded-2xl border border-line bg-offwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red"
              aria-label={`View image full screen${b.caption ? `: ${b.caption}` : ""}`}
            >
              <Image
                src={b.url}
                alt={b.caption || title}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 768px"
                className="mx-auto h-auto max-h-[70vh] w-auto max-w-full object-contain transition-transform duration-500 ease-smooth group-hover:scale-[1.01]"
              />
            </button>
            {b.caption && (
              <figcaption className="mt-2 text-center text-sm text-muted">{b.caption}</figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
