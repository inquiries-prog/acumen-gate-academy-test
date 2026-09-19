"use client";

import { useSiteUI } from "@/components/site/SiteUI";
import type { Center } from "@/lib/types";
import { telHref } from "@/lib/utils";

/**
 * Our Centers (SRS 7.2.6).
 *
 * Both cards carry the SAME "Enquire Now" treatment - an earlier draft only had
 * the button on one card and that was fixed for consistency.
 *
 * Vidyanagar intentionally shows no address: it is a weekend centre, not a
 * permanent office, and no placeholder address may be shown in its place.
 */
export default function CentersSection({ centers }: { centers: Center[] }) {
  const { openEnquiry } = useSiteUI();

  return (
    <section className="section">
      <div className="container-site">
        <p className="eyebrow">Locations</p>
        <h2 className="h-section mt-4">Our Centers</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {centers.map((c) => (
            <article key={c.id} className="card-interactive flex flex-col p-7">
              <h3 className="font-display text-xl font-bold">
                {c.name}
                {c.label && <span className="font-normal text-muted"> — {c.label}</span>}
              </h3>

              {c.show_address && c.address ? (
                <address className="mt-3 text-sm not-italic leading-relaxed text-body">
                  {c.address}
                </address>
              ) : (
                c.description && (
                  <p className="mt-3 text-sm leading-relaxed text-body">{c.description}</p>
                )
              )}

              {c.show_address && c.description && (
                <p className="mt-2 text-sm leading-relaxed text-body">{c.description}</p>
              )}

              {c.phone && (
                <a
                  href={telHref(c.phone)}
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-charcoal transition-colors hover:text-red"
                >
                  {c.phone}
                </a>
              )}

              <div className="mt-auto pt-4">
                <button
                  type="button"
                  onClick={() => openEnquiry(`Centers — ${c.name}`)}
                  className="btn-primary w-full sm:w-auto"
                >
                  Enquire Now
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
