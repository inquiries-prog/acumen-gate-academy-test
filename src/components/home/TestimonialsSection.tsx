"use client";

import Link from "next/link";
import MediaImage from "@/components/ui/MediaImage";
import Rail from "@/components/ui/Rail";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import SectionHeading from "@/components/ui/SectionHeading";
import { useSiteUI } from "@/components/site/SiteUI";
import type { Testimonial } from "@/lib/types";
import { isPlaceholder, resolve } from "@/lib/utils";

/**
 * Success Stories and Testimonials (SRS 7.1.7).
 *
 * The section title is that exact wording - the client specifically asked for
 * "and Testimonials", not just "Success Stories".
 *
 * The universities named in SRS 7.1.7 run as a strip inside this section rather
 * than becoming a section of their own: the homepage section order is finalised
 * in SRS 7.1 and must not gain an item without checking with the client.
 */

const UNIVERSITIES = [
  "MSU Baroda",
  "Parul University",
  "Charusat University",
  "BVM Vallabh Vidyanagar",
  "DDU Nadiad",
  "Navrachana University",
  "GECS",
];

export default function TestimonialsSection({
  testimonials,
  showViewAll = true,
  showUniversities = true,
  title = "Success Stories and Testimonials",
  eyebrow = "Our Students",
}: {
  testimonials: Testimonial[];
  showViewAll?: boolean;
  showUniversities?: boolean;
  title?: string;
  eyebrow?: string;
}) {
  const { push } = useSiteUI();

  if (testimonials.length === 0) return null;

  return (
    <section className="section">
      <div className="container-site">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          action={
            showViewAll ? (
              <Link href="/results" className="btn-secondary">
                View all success stories
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : undefined
          }
        />

        {showUniversities && (
          <Reveal delay={60} className="mt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Students from across Gujarat&apos;s universities
            </p>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {UNIVERSITIES.map((u) => (
                <li
                  key={u}
                  className="rounded-full border border-line bg-offwhite px-4 py-2 text-[13px] font-semibold text-charcoal"
                >
                  {u}
                </li>
              ))}
            </ul>
          </Reveal>
        )}

        <Rail
          className="mt-10 sm:mt-12"
          gap="gap-6"
          grid="sm:grid-cols-2 lg:grid-cols-3"
          hint="Swipe for more stories"
        >
          {testimonials.map((t, i) => {
            const isVideo = t.media_type === "video" && Boolean(t.video_id);
            const name = resolve(t.student_name, "Acumen student");
            const quote = resolve(t.quote);

            return (
              <Reveal
                key={t.id}
                as="article"
                delay={(i % 3) * 80}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line
                           bg-white shadow-card transition-all duration-300 ease-smooth
                           hover:-translate-y-1.5 hover:border-red/25 hover:shadow-card-hover"
              >
                <Spotlight />
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-offwhite">
                  <MediaImage
                    src={t.image_url}
                    alt={t.alt_text || `${name}, ${t.university}`}
                    placeholderLabel={isVideo ? "Video thumbnail" : "Student photo"}
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                    className="transition-transform duration-700 ease-smooth group-hover:scale-105"
                  />
                  {isVideo && (
                    <button
                      type="button"
                      onClick={() =>
                        push({
                          kind: "video",
                          videoId: t.video_id,
                          title: `${name} — ${t.university}`,
                        })
                      }
                      aria-label={`Play video testimonial from ${name}`}
                      className="absolute inset-0 grid place-items-center bg-charcoal/25 transition-colors duration-300 hover:bg-charcoal/45"
                    >
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 shadow-lifted transition-transform duration-300 ease-smooth group-hover:scale-110">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M8 5.5l11 6.5-11 6.5v-13z" fill="#E31E24" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>

                <div className="relative flex flex-1 flex-col p-6 sm:p-7">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-1 font-display text-7xl font-extrabold leading-none text-red/[0.07]"
                  >
                    &rdquo;
                  </span>

                  {t.university && (
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red">
                      {t.university}
                    </p>
                  )}

                  {quote ? (
                    <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-body">
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ) : (
                    <div className="mt-3 flex-1" />
                  )}

                  <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red/[0.08] font-display text-sm font-bold text-red">
                      {name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-[15px] font-bold text-charcoal">
                        {name}
                      </span>
                      {!isPlaceholder(t.rank_branch) && (
                        <span className="block truncate text-xs text-muted">{t.rank_branch}</span>
                      )}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </Rail>
      </div>
    </section>
  );
}
