"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSiteUI } from "./SiteUI";

const DISMISS_KEY = "aga-banner-dismissed";

/**
 * Announcement banner (SRS 6.2).
 *
 * A thin strip below the header, rendered inline with the page - never a modal,
 * and it must not delay or block content. Two independent controls:
 *   - the admin master toggle (banner_enabled), which affects everyone;
 *   - a visitor's own dismiss, which is per-session only and affects nobody else.
 *
 * The text, link and toggle are the entire mechanism for reusing this strip for
 * future campaigns, so a new promotion never needs a code change.
 */
export default function AnnouncementBanner() {
  const { settings, push } = useSiteUI();
  const [dismissed, setDismissed] = useState(false);

  /**
   * SRS 6.2 requires this strip to be visible immediately on page load, so it
   * renders on the server and is hidden afterwards if this visitor already
   * dismissed it. Gating the first paint on a storage read would delay it,
   * which is the opposite of what the SRS asks for.
   */
  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      // Private browsing can throw on storage access - just show the banner.
    }
  }, []);

  if (!settings.banner_enabled || !settings.banner_text.trim()) return null;
  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* non-fatal */
    }
  }

  const action = settings.banner_link_action;
  const label = settings.banner_link_label.trim();

  return (
    <div className="border-b border-white/10 bg-red-sheen text-white">
      <div className="container-site flex items-center gap-3 py-2.5">
        <p className="flex-1 text-center text-[13px] leading-snug sm:text-sm">
          <span>{settings.banner_text}</span>
          {label && action !== "none" && (
            <>
              {" "}
              {action === "url" && settings.banner_link_url ? (
                <Link
                  href={settings.banner_link_url}
                  className="font-bold underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
                >
                  {label}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    push(action === "enquiry" ? { kind: "enquiry", source: "Announcement banner" } : { kind: "seminar" })
                  }
                  className="font-bold underline decoration-white/50 underline-offset-4 transition-colors hover:decoration-white"
                >
                  {label}
                </button>
              )}
            </>
          )}
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
