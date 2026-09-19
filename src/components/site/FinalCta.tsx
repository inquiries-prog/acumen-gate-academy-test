"use client";

import AmbientGlow from "@/components/ui/AmbientGlow";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppLink from "./WhatsAppLink";
import { telHref } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";

/**
 * Final CTA band (SRS 7.1.8) - dark charcoal, full width, white text, red
 * button. Also reused as the closing CTA on About, News and Results
 * (SRS 7.2.9, 7.3, 7.4).
 */
export default function FinalCta({
  heading,
  buttonLabel,
  source,
}: {
  heading?: string;
  buttonLabel?: string;
  source: string;
}) {
  const { settings, openEnquiry } = useSiteUI();

  return (
    /*
     * Flat charcoal, and every decorative layer below fades out before the
     * bottom edge.
     *
     * The footer sits immediately under this band and is the same flat
     * charcoal. Anything that paints this section's lower edge - a gradient
     * highlight, a drifting glow, a grid - stops dead at the boundary and reads
     * as a seam between two panels. Fading them out means the two sections meet
     * as one continuous surface.
     */
    <section className="relative overflow-hidden bg-charcoal">
      <AmbientGlow tone="dark" fadeBottom />
      {/*
        Faint grid for texture. Masked to nothing at the bottom edge so it
        dissolves rather than stopping dead where the footer begins - the two
        are meant to read as one continuous dark surface.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]
                   [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
                   [background-size:56px_56px]
                   [mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,transparent_100%)]
                   [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_55%,transparent_100%)]"
      />

      <div className="container-site relative">
        {/* Tighter bottom padding than top: the footer continues this same dark
            surface, so a full section gap here reads as two separate panels
            rather than one region (SRS 3.3 flags gappy spacing). */}
        <div className="flex flex-col items-center gap-8 pb-12 pt-16 text-center md:flex-row md:justify-between md:gap-10 md:pb-14 md:pt-20 md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-display-sm text-white">
              {heading || settings.final_cta_heading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-white/65">
              Tell us your branch and where you are in your preparation — a counsellor will call
              you back within 24 hours.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => openEnquiry(source)}
              className="btn-primary w-full px-8 sm:w-auto"
            >
              {buttonLabel || settings.final_cta_button}
            </button>
            <a
              href={telHref(settings.phone)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl
                         border border-white/20 px-6 text-[15px] font-semibold text-white
                         transition-colors duration-200 hover:bg-white/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 014 5.2 2 2 0 016 3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              {settings.phone}
            </a>
            <WhatsAppLink className="btn-whatsapp min-h-12 px-6 text-[15px]">
              <WhatsAppIcon size={20} />
              WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
