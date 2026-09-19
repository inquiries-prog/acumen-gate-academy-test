"use client";

import { useEffect, useState } from "react";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { telHref } from "@/lib/utils";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteUI } from "./SiteUI";

/**
 * Mobile-only action bar pinned to the bottom of the viewport.
 *
 * On a phone the header CTA scrolls away within a screen or two, which leaves
 * the two things a visitor actually wants - call, or ask us to call them -
 * unreachable without scrolling back. This keeps both one thumb-reach away.
 *
 * Hidden until the visitor has scrolled past the hero, so it never covers the
 * hero's own buttons, and hidden whenever a popup or the chat panel is open so
 * it cannot sit on top of them (SRS 3.4).
 */
export default function StickyMobileCta() {
  const { openEnquiry, settings, current, chatOpen } = useSiteUI();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Roughly one viewport: past the hero on any phone.
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hidden = !visible || current !== null || chatOpen;

  return (
    <div
      aria-hidden={hidden}
      className={`fixed inset-x-0 bottom-0 z-[80] border-t border-line bg-white/95 px-3 pb-[env(safe-area-inset-bottom)] pt-3 backdrop-blur-xl
                  transition-transform duration-300 ease-smooth lg:hidden ${
                    hidden ? "translate-y-full" : "translate-y-0"
                  }`}
    >
      {/* Three controls at 390px: Call ~138px, WhatsApp 48px, Enquire ~180px. */}
      <div className="flex gap-2.5 pb-3">
        <a
          href={telHref(settings.phone)}
          tabIndex={hidden ? -1 : 0}
          className="btn-secondary flex-1 px-3"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 014 5.2 2 2 0 016 3z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          Call
        </a>
        <WhatsAppLink
          ariaLabel="Message us on WhatsApp"
          className={`btn-secondary w-12 shrink-0 px-0 ${hidden ? "pointer-events-none" : ""}`}
        >
          <WhatsAppIcon size={20} />
        </WhatsAppLink>
        <button
          type="button"
          tabIndex={hidden ? -1 : 0}
          onClick={() => openEnquiry("Sticky mobile bar")}
          className="btn-primary flex-[1.4] px-3"
        >
          Enquire Now
        </button>
      </div>
    </div>
  );
}
