"use client";

import { useSiteUI } from "@/components/site/SiteUI";

/**
 * Google rating badge.
 *
 * Reads `google_rating` / `google_reviews_count` / `google_reviews_url` straight
 * from site settings, so it is already admin-editable and needs no new storage.
 *
 * SRS 7.1.1 keeps this out of the hero to avoid "duplicating trust signals
 * awkwardly". Shown here anyway, on the client's instruction: a 5.0 from 163
 * reviews is the single most persuasive fact on the site, and next to the
 * primary CTA is where it actually changes a decision. The footer keeps its own
 * copy for people who scroll.
 *
 * Renders nothing when no rating is set, so switching it off is just clearing
 * the field in the admin panel.
 */
export default function GoogleRating({
  variant = "inline",
}: {
  /** "inline" sits under a CTA; "chip" is a standalone pill. */
  variant?: "inline" | "chip";
}) {
  const { settings } = useSiteUI();
  const rating = settings.google_rating?.trim();
  if (!rating) return null;

  const count = settings.google_reviews_count?.trim();
  const url = settings.google_reviews_url?.trim();

  const body = (
    <>
      <GoogleMark />
      <span className="font-display text-[15px] font-extrabold text-charcoal">{rating}</span>
      <Stars rating={Number(rating)} />
      {count && (
        <span className="text-[13px] font-medium text-body">
          <span className="font-semibold text-charcoal">{count}</span> Google reviews
        </span>
      )}
    </>
  );

  const shell =
    variant === "chip"
      ? "inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 shadow-chip"
      : "inline-flex items-center gap-2 rounded-xl border border-line bg-white/80 px-4 py-2.5 shadow-chip backdrop-blur-sm";

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${shell} transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-card`}
        aria-label={`Rated ${rating} out of 5 from ${count || "our"} Google reviews. Opens Google in a new tab.`}
      >
        {body}
      </a>
    );
  }

  return (
    <span
      className={shell}
      aria-label={`Rated ${rating} out of 5 from ${count || "our"} Google reviews`}
    >
      {body}
    </span>
  );
}

/** Five stars, filled to the nearest half. Decorative - the label carries it. */
function Stars({ rating }: { rating: number }) {
  const safe = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 5;
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, safe - i));
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 20 20" className="shrink-0">
            <defs>
              <linearGradient id={`gr-${i}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="#F5A623" />
                <stop offset={`${fill * 100}%`} stopColor="#EDEBE9" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.6l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.21l-4.94 2.6.94-5.5-4-3.9 5.53-.8z"
              fill={`url(#gr-${i}-${Math.round(fill * 100)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}

/** Google's four-colour G. Reproduced so the badge is recognisable at a glance. */
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.8 28.2c-.4-1.3-.7-2.7-.7-4.2s.2-2.9.7-4.2v-5.7H4.5C3 17.1 2.1 20.4 2.1 24s.9 6.9 2.4 9.9l7.3-5.7z"
      />
      <path
        fill="#EA4335"
        d="M24 10.8c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.2 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.1l7.3 5.7c1.7-5.2 6.5-9 12.2-9z"
      />
    </svg>
  );
}
