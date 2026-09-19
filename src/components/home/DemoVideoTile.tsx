"use client";

import Image from "next/image";
import { useState } from "react";
import { useSiteUI } from "@/components/site/SiteUI";
import { formatTimestamp, youtubeThumb } from "@/lib/utils";

/**
 * A video poster with a play button that opens the inline player.
 *
 * Video is the most persuasive thing an institute can show, and until now the
 * demo lecture was reachable only from inside the batches popup. This puts a
 * real poster frame on the page; the video itself still plays in the site's
 * own popup, never on YouTube (SRS 7.1.6).
 *
 * The poster comes from YouTube's thumbnail CDN. `maxresdefault` is sharp but
 * not every video has one, so a failed load swaps to `hqdefault`, which always
 * exists (4:3 with letterbox bars - `object-cover` in a 16:9 box crops them).
 */
export default function DemoVideoTile({
  videoId,
  start = 0,
  title,
  caption,
  compact = false,
}: {
  videoId: string;
  start?: number;
  title: string;
  caption: string;
  /** Smaller treatment for inside a sheet. */
  compact?: boolean;
}) {
  const { push } = useSiteUI();
  const [src, setSrc] = useState(() => youtubeThumb(videoId));

  return (
    <button
      type="button"
      data-demo-tile
      onClick={() => push({ kind: "video", videoId, start, title })}
      aria-label={`Play: ${title}`}
      className="group relative block w-full overflow-hidden rounded-2xl bg-charcoal text-left
                 shadow-card transition-all duration-300 ease-smooth
                 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]"
    >
      <span
        className={`relative block w-full ${
          compact ? "aspect-video max-h-[200px]" : "aspect-video max-h-[220px] sm:max-h-none"
        }`}
      >
        <Image
          src={src}
          alt=""
          fill
          sizes={compact ? "(max-width: 640px) 100vw, 640px" : "(max-width: 1024px) 100vw, 720px"}
          loading="lazy"
          onError={() => setSrc(youtubeThumb(videoId, "hqdefault"))}
          className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105"
        />
        {/* Scrim: keeps the caption legible over any frame. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/30 to-charcoal/10"
        />

        {/* Play button with a soft expanding ring behind it. */}
        <span
          className={`absolute inset-0 grid place-items-center ${compact ? "-translate-y-4" : ""}`}
        >
          <span className="relative grid place-items-center">
            <span
              aria-hidden="true"
              className={`absolute rounded-full bg-red/40 animate-pulse-ring ${
                compact ? "h-14 w-14" : "h-16 w-16 sm:h-20 sm:w-20"
              }`}
            />
            <span
              className={`relative grid place-items-center rounded-full bg-red text-white shadow-red-glow
                          transition-transform duration-300 ease-smooth group-hover:scale-110 ${
                            compact ? "h-14 w-14" : "h-16 w-16 sm:h-20 sm:w-20"
                          }`}
            >
              <svg
                width={compact ? 22 : 26}
                height={compact ? 22 : 26}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="ml-1"
              >
                <path d="M8 5.5l11 6.5-11 6.5v-13z" />
              </svg>
            </span>
          </span>
        </span>

        {/* Caption block. */}
        <span className={`absolute inset-x-0 bottom-0 flex flex-col gap-1.5 ${compact ? "p-4" : "p-5 sm:p-6"}`}>
          {!compact && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              Demo class
            </span>
          )}
          <span
            className={`font-display font-bold text-white ${compact ? "text-base" : "text-lg sm:text-xl"}`}
          >
            {caption}
            {compact && start > 0 && (
              <span className="font-sans text-sm font-medium text-white/65"> · {formatTimestamp(start)}</span>
            )}
          </span>
          {!compact && (
            <span className="text-sm text-white/65">
              {start > 0 ? `Starts at ${formatTimestamp(start)} · ` : ""}Plays right here, not on
              YouTube
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
