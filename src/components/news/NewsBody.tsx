"use client";

import { useSiteUI } from "@/components/site/SiteUI";
import type { GalleryImage } from "@/lib/types";

/**
 * A news post's formatted body. `html` must already be sanitised on the
 * server (renderPostHtml). Tapping a photo opens it full screen, with the
 * post's other photos a swipe away.
 */
export default function NewsBody({ html, title }: { html: string; title: string }) {
  const { push } = useSiteUI();

  function onClick(e: React.MouseEvent<HTMLDivElement>) {
    // Only our own photos (served from this site) can open in the viewer, which
    // uses next/image; a photo pasted in from another website just stays put.
    const ours = (el: Element) => el.getAttribute("src")?.startsWith("/") ?? false;
    const img = (e.target as HTMLElement).closest("figure img");
    if (!img || !ours(img)) return;
    const all = Array.from(e.currentTarget.querySelectorAll<HTMLImageElement>("figure img")).filter(ours);
    const images: GalleryImage[] = all.map((el, i) => ({
      id: `news-img-${i}`,
      image_url: el.dataset.full || el.src,
      alt_text: el.alt || title,
      kind: "press",
      show_in_carousel: false,
      show_in_news_strip: false,
      sort_order: 0,
    }));
    push({ kind: "lightbox", images, index: Math.max(0, all.indexOf(img as HTMLImageElement)) });
  }

  return (
    // Clicks are delegated to the photos inside; the photos are not focusable
    // links, so this is a pointer convenience on top of readable content.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className="post-body mt-6 [&_figure_img[src^='/']]:cursor-zoom-in"
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
