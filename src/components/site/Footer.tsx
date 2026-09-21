"use client";

import Image from "next/image";
import Link from "next/link";
import type { Center, EcosystemCard } from "@/lib/types";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { WHATSAPP_DISPLAY } from "@/lib/defaults";
import { displayPhone, telHref } from "@/lib/utils";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteUI } from "./SiteUI";

/**
 * Global footer (SRS 6.3). Four columns on desktop, stacking to a single
 * column on mobile without dropping any content (SRS 3.4).
 *
 * Carries id="contact", which is what the header's "Contact Us" nav item
 * anchors to - it is not a separate page.
 */
export default function Footer({
  centers,
  ecosystem,
}: {
  centers: Center[];
  ecosystem: EcosystemCard[];
}) {
  const { settings, openEnquiry } = useSiteUI();
  const year = new Date().getFullYear();

  const socials = [
    { label: "Instagram", url: settings.instagram_url, icon: <InstagramIcon /> },
    { label: "YouTube", url: settings.youtube_url, icon: <YouTubeIcon /> },
    { label: "Facebook", url: settings.facebook_url, icon: <FacebookIcon /> },
  ].filter((s) => s.url);

  // Acumen Gate Academy is the site's own brand - the badges are the other two.
  const partnerBadges = ecosystem.filter((c) => !c.highlighted);

  return (
    <footer
      id="contact"
      /*
       * Flat charcoal on purpose - NOT bg-dark-sheen.
       *
       * That gradient lightens the top of whatever it is applied to and fades
       * out by 60%. The final CTA band sits directly above this and already
       * uses it, so applying it here too restarted the highlight and produced a
       * visible horizontal seam between the two dark sections. Leaving the
       * footer flat lets the CTA's gradient settle into it as one surface.
       */
      className="relative overflow-hidden bg-charcoal pb-[calc(5rem+env(safe-area-inset-bottom))] text-white/70 lg:pb-0"
    >
      <div className="container-site relative grid gap-12 pb-16 pt-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div>
          {/* Logo sits on a white chip so its real colours show on dark (SRS 3.2). */}
          <div className="inline-flex items-center rounded-xl bg-white px-4 py-2.5 shadow-lifted">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt="Acumen Gate Academy"
                width={170}
                height={46}
                className="h-9 w-auto"
              />
            ) : (
              <span className="flex flex-col leading-none">
                <span className="text-lg font-extrabold tracking-tight text-charcoal">acumen</span>
                <span className="mt-0.5 rounded bg-red px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-white">
                  Gate Academy
                </span>
              </span>
            )}
          </div>

          <p className="mt-4 max-w-xs text-sm leading-relaxed">{settings.footer_tagline}</p>

          {socials.length > 0 && (
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.08] text-white ring-1 ring-white/10 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:bg-red hover:ring-red"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          )}

          <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            Part of the Acumen Ecosystem
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {partnerBadges.map((card) => (
              <div
                key={card.id}
                className="flex items-center rounded-lg bg-white px-3.5 py-2.5 shadow-chip"
                title={card.name}
              >
                {card.logo_url ? (
                  <Image
                    src={card.logo_url}
                    alt={card.name}
                    width={110}
                    height={30}
                    className="h-6 w-auto"
                  />
                ) : (
                  // Logo files are pending from the client (SRS 3.2 / 12).
                  <span className="text-xs font-bold text-charcoal">{card.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/90">Quick Links</h2>
          <ul className="mt-4 space-y-1">
            <FooterLink href="/about">About us</FooterLink>
            <FooterLink href="/#courses">Courses</FooterLink>
            <FooterLink href="/results">Results</FooterLink>
            <FooterLink href="/news">News &amp; Updates</FooterLink>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/90">Our Centers</h2>
          <ul className="mt-4 space-y-4">
            {centers.map((c) => (
              <li key={c.id} className="text-sm leading-relaxed">
                <p className="font-semibold text-white">
                  {c.name}
                  {c.label && <span className="font-normal text-white/60"> — {c.label}</span>}
                </p>
                {/* Vidyanagar deliberately shows no address (SRS 6.3 / 15.8). */}
                {c.show_address && c.address && <p className="mt-1">{c.address}</p>}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-white/90">Get in Touch</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={telHref(settings.phone)}
                className="inline-flex min-h-11 items-center font-semibold text-white transition-colors hover:text-red"
              >
                {displayPhone(settings.phone)}
              </a>
            </li>
            <li>
              <WhatsAppLink className="group/wa inline-flex min-h-11 items-center gap-2.5 font-semibold text-white transition-colors hover:text-whatsapp">
                <span className="whatsapp-badge h-7 w-7 group-hover/wa:scale-[1.08]">
                  <WhatsAppIcon size={15} />
                </span>
                {displayPhone(WHATSAPP_DISPLAY)}
              </WhatsAppLink>
            </li>
            {settings.email && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="inline-flex min-h-11 items-center break-all transition-colors hover:text-white"
                >
                  {settings.email}
                </a>
              </li>
            )}
          </ul>
          {/* The footer converts too, not just informs (SRS 6.3). */}
          <button
            type="button"
            onClick={() => openEnquiry("Footer")}
            className="btn-primary mt-3 w-full sm:w-auto"
          >
            Enquire Now
          </button>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-site flex flex-col items-center gap-4 py-5 text-xs sm:flex-row sm:justify-between">
          <p className="order-3 text-center sm:order-1 sm:text-left">
            © {year} Acumen Gate Academy. All rights reserved.
          </p>

          {settings.google_rating && (
            <GoogleBadge
              rating={settings.google_rating}
              count={settings.google_reviews_count}
              url={settings.google_reviews_url}
            />
          )}

          <p className="order-2 flex items-center gap-3 sm:order-3">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-white/30">
              |
            </span>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms &amp; Conditions
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="inline-flex min-h-10 items-center text-sm transition-colors hover:text-white"
      >
        {children}
      </Link>
    </li>
  );
}

function GoogleBadge({ rating, count, url }: { rating: string; count: string; url: string }) {
  const content = (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2 ring-1 ring-white/10">
      <span className="text-sm font-bold text-white">{rating}</span>
      {/* Deliberate exception to the SRS 3.1 palette: these are Google review
          stars, and gold is the universally recognised convention for them.
          Rendering them in brand red would read as decoration, not a rating. */}
      <span className="text-amber-400" aria-hidden="true">
        ★★★★★
      </span>
      {count && <span className="text-white/70">{count} Google Reviews</span>}
    </span>
  );

  return (
    <span className="order-1 sm:order-2">
      {url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-85">
          {content}
        </a>
      ) : (
        content
      )}
    </span>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5v-5z" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.5 8.5h2.2V5.6h-2.4c-2.3 0-3.7 1.4-3.7 3.8v1.7H8.4v3h2.2V21h3.1v-6.9h2.3l.4-3h-2.7v-1.3c0-.9.3-1.3 1.3-1.3z"
        fill="currentColor"
      />
    </svg>
  );
}
