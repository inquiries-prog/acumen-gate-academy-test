import MediaImage from "@/components/ui/MediaImage";
import Rail from "@/components/ui/Rail";
import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import SectionHeading from "@/components/ui/SectionHeading";
import { MENTORS_CREDIBILITY, MENTORS_INTRO } from "@/lib/defaults";
import type { Mentor } from "@/lib/types";

/**
 * Meet the Mentors (SRS 7.1.9).
 *
 * This is the only place faculty content lives - a separate Faculty page was
 * explicitly decided against as duplicate content (SRS 2.2 / 15.1).
 *
 * On mobile the grid becomes a swipeable rail rather than a very long vertical
 * stack, which is the "carousel / prev-next navigation" the SRS asks for when
 * six cards don't fit on one row. The rail itself is the shared Rail component,
 * so it behaves exactly like the courses and testimonials rows.
 */
export default function MentorsSection({ mentors }: { mentors: Mentor[] }) {
  if (mentors.length === 0) return null;

  return (
    <section className="section section-alt">
      <div className="container-site">
        <SectionHeading eyebrow="Faculty" title={MENTORS_INTRO} lede={MENTORS_CREDIBILITY} />

        <Rail
          as="ul"
          className="mt-10 sm:mt-14"
          grid="sm:grid-cols-2 lg:grid-cols-3"
          hint="Swipe to see all mentors"
        >
          {mentors.map((m, i) => (
            <Reveal
              key={m.id}
              as="article"
              delay={(i % 3) * 80}
              distance="lg"
              className="group relative flex h-full flex-col overflow-hidden
                         rounded-2xl border border-line bg-white shadow-card
                         transition-all duration-300 ease-smooth hover:-translate-y-1.5
                         hover:border-red/25 hover:shadow-card-hover"
            >
              <Spotlight />
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-offwhite">
                <MediaImage
                  src={m.image_url}
                  alt={m.alt_text || `${m.name}, ${m.title}`}
                  placeholderLabel="Faculty photo"
                  placeholder={{ kind: "person", name: m.name }}
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                  className="transition-transform duration-500 ease-smooth group-hover:scale-105"
                />
                {m.image_url && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent"
                  />
                )}
                <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-red shadow-chip backdrop-blur">
                  {m.title}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-bold text-charcoal transition-colors duration-300 group-hover:text-red">{m.name}</h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-body">{m.bio}</p>
              </div>
            </Reveal>
          ))}
        </Rail>
      </div>
    </section>
  );
}
