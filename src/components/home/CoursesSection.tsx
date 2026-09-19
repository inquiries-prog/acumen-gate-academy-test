"use client";

import MediaImage from "@/components/ui/MediaImage";
import Rail from "@/components/ui/Rail";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSiteUI } from "@/components/site/SiteUI";
import type { CourseCard } from "@/lib/types";

/**
 * Our Courses (SRS 7.1.4) - three cards.
 *
 * The third card is GPSC Coaching, a fixed card, not a generic admin-addable
 * slot: that idea was considered and dropped (SRS 15.3). Each card's button
 * target is stored per card, so what a card opens stays admin-controlled.
 *
 * Cards reveal on scroll with a short stagger, which is what stops a row of
 * three landing as one flat block.
 */
export default function CoursesSection({ cards }: { cards: CourseCard[] }) {
  const { push, openEnquiry } = useSiteUI();

  function handleClick(card: CourseCard) {
    if (card.action === "batches_offline") push({ kind: "batches", mode: "offline" });
    else if (card.action === "batches_online") push({ kind: "batches", mode: "online" });
    else openEnquiry(`Course card: ${card.title}`);
  }

  return (
    <section id="courses" className="section scroll-mt-28">
      <div className="container-site">
        <SectionHeading
          eyebrow="Our Courses"
          title="GATE and GPSC programmes built around how you actually study"
          lede="Pick your branch and mode. Every batch runs on the same nine-point structure, whether you sit in our Vadodara classroom or join live online."
        />

        <Rail
          className="mt-10 sm:mt-14"
          gap="gap-6"
          grid="sm:grid-cols-2 lg:grid-cols-3"
          hint="Swipe to see all courses"
        >
          {cards.map((card, i) => (
            <Reveal
              key={card.id}
              as="article"
              delay={i * 90}
              className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-line
                          bg-white shadow-card transition-all duration-300 ease-smooth
                          hover:-translate-y-1.5 hover:border-red/25 hover:shadow-card-hover`}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-offwhite">
                <MediaImage
                  src={card.image_url}
                  alt={card.alt_text || card.title}
                  placeholderLabel={`${card.title} photo`}
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  className="transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent"
                />
                {card.banner_label && (
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-red shadow-chip backdrop-blur">
                    {card.banner_label}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <h3 className="font-display text-xl font-bold text-charcoal">{card.title}</h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body">
                  {card.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleClick(card)}
                  className="mt-7 inline-flex min-h-12 items-center justify-between gap-3 rounded-xl
                             border border-line px-5 text-left text-sm font-semibold text-charcoal
                             transition-all duration-300 ease-smooth active:scale-[0.98]
                             group-hover:border-red group-hover:bg-red group-hover:text-white"
                >
                  <span>{card.button_label || "Know more"}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red/10 text-red transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/20 group-hover:text-white">
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </div>
            </Reveal>
          ))}
        </Rail>
      </div>
    </section>
  );
}
