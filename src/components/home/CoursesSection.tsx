"use client";

import BranchPicker from "@/components/home/BranchPicker";
import DemoVideoTile from "@/components/home/DemoVideoTile";
import MediaImage from "@/components/ui/MediaImage";
import Rail from "@/components/ui/Rail";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSiteUI } from "@/components/site/SiteUI";
import { DEMO_VIDEO_ID, DEMO_VIDEO_START } from "@/lib/defaults";
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
 *
 * On phones the three cards are not a swipe rail but a vertical stack of
 * compact rows - thumbnail on the left, label, title, two lines of copy and
 * the action - so all three are on screen at once. Same DOM, `max-sm:`
 * variants; from `sm` up they are the tall image-led cards.
 *
 * Above the cards: the demo-class video and the branch picker. Both live
 * INSIDE this section rather than as sections of their own, because the
 * homepage order is finalised in SRS 7.1. The demo video is whichever the
 * admin has set on the first offline batch, so per-branch uploads take over
 * from the placeholder automatically.
 */
export default function CoursesSection({ cards }: { cards: CourseCard[] }) {
  const { push, openEnquiry, offline } = useSiteUI();

  const demoBatch = offline.find((row) => row.batch?.video_id)?.batch;
  const demo = {
    id: demoBatch?.video_id || DEMO_VIDEO_ID,
    start: demoBatch?.video_id ? demoBatch.video_start : DEMO_VIDEO_START,
  };

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

        {/* Demo class + branch picker. Picker first on phones (act, then
            watch); side by side from lg with the video leading. */}
        {/* min-w-0 on both cells: the picker's nowrap chip row would otherwise
            set the column's min-content width past the phone viewport. */}
        <div className="mt-10 grid gap-6 sm:mt-12 lg:grid-cols-[1.45fr_1fr] lg:items-stretch">
          <Reveal className="min-w-0">
            <DemoVideoTile
              videoId={demo.id}
              start={demo.start}
              title="Acumen Gate Academy — demo lecture"
              caption="Watch a demo class"
            />
          </Reveal>
          <Reveal delay={90} className="group/picker order-first min-w-0 lg:order-none">
            <BranchPicker />
          </Reveal>
        </div>

        <Rail stack className="mt-8 sm:mt-10" gap="gap-6" grid="sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <Reveal
              key={card.id}
              as="article"
              delay={i * 90}
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line
                          bg-white shadow-card transition-all duration-300 ease-smooth
                          hover:-translate-y-1.5 hover:border-red/25 hover:shadow-card-hover
                          max-sm:flex-row max-sm:items-stretch`}
            >
              <Spotlight />
              <div
                className="relative aspect-[16/10] w-full overflow-hidden bg-offwhite
                           max-sm:aspect-auto max-sm:w-[104px] max-sm:shrink-0 max-sm:[&_span]:hidden"
              >
                <MediaImage
                  src={card.image_url}
                  alt={card.alt_text || card.title}
                  placeholderLabel={`${card.title} photo`}
                  sizes="(max-width: 640px) 104px, (max-width: 1024px) 50vw, 33vw"
                  className="transition-transform duration-700 ease-smooth group-hover:scale-105"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent max-sm:hidden"
                />
                {card.banner_label && (
                  <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-red shadow-chip backdrop-blur max-sm:hidden">
                    {card.banner_label}
                  </span>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col p-6 max-sm:p-4 sm:p-7">
                {/* On phones the label moves off the (now tiny) image to an eyebrow. */}
                {card.banner_label && (
                  <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-red sm:hidden">
                    {card.banner_label}
                  </span>
                )}
                <h3 className="font-display text-xl font-bold text-charcoal max-sm:text-base">
                  {card.title}
                </h3>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-body max-sm:mt-1 max-sm:line-clamp-2 max-sm:text-[13px] max-sm:leading-snug">
                  {card.description}
                </p>

                <button
                  type="button"
                  onClick={() => handleClick(card)}
                  className="mt-7 inline-flex min-h-12 items-center justify-between gap-3 rounded-xl
                             border border-line px-5 text-left text-sm font-semibold text-charcoal
                             transition-all duration-300 ease-smooth active:scale-[0.98]
                             group-hover:border-red group-hover:bg-red group-hover:text-white
                             max-sm:mt-2.5 max-sm:min-h-0 max-sm:justify-start max-sm:gap-2
                             max-sm:rounded-none max-sm:border-0 max-sm:px-0 max-sm:text-[13px]
                             max-sm:text-red max-sm:group-hover:bg-transparent max-sm:group-hover:text-red"
                >
                  <span>{card.button_label || "Know more"}</span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red/10 text-red transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-white/20 group-hover:text-white max-sm:h-6 max-sm:w-6 max-sm:group-hover:bg-red/10 max-sm:group-hover:text-red">
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
