import Reveal from "@/components/ui/Reveal";
import Spotlight from "@/components/ui/Spotlight";
import { PEDAGOGY_INTRO } from "@/lib/defaults";
import type { PedagogyPoint } from "@/lib/types";

/**
 * Our Pedagogy (SRS 7.2.4) - the full nine-point list.
 *
 * This is the complete version. The homepage deliberately has no pedagogy
 * section at all: it was tried there and removed for making the page too heavy,
 * so do not reintroduce it (SRS 7.2.4).
 *
 * Presented as a journey rather than a grid of nine boxes, because that is what
 * the nine points describe: the order a student actually moves through them,
 * from the first offline hour to placement. On a phone a spine runs down the
 * left and draws in as the section reveals; from `lg` the steps sit three to a
 * row with a connecting line that draws across as each step appears. The nine
 * strings are the SRS text, untouched.
 */
export default function PedagogySection({ points }: { points: PedagogyPoint[] }) {
  if (points.length === 0) return null;

  return (
    <section className="section">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal variant="left" distance="lg" className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              How We Teach
            </p>
            <h2 className="h-section mt-5">Our Pedagogy</h2>
            <p className="lede mt-4">{PEDAGOGY_INTRO}</p>

            <p className="mt-8 rounded-2xl border border-line bg-offwhite p-5 text-sm leading-relaxed text-body">
              Every point below applies to both offline and live online batches. Nothing here is an
              upsell — it is what a student receives after enrolling.
            </p>
          </Reveal>

          {/* group/journey lets the phone spine key its draw-in off this
              wrapper's own reveal state. */}
          <Reveal className="group/journey relative">
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-[21px] top-3 w-px origin-top scale-y-0
                         bg-gradient-to-b from-red via-line to-line
                         transition-transform duration-[1200ms] ease-smooth
                         group-[.opacity-100]/journey:scale-y-100 lg:hidden"
            />

            <ol data-journey className="relative grid gap-4 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-12">
              {points.map((point, i) => (
                <Reveal
                  as="li"
                  key={point.id}
                  delay={i * 70}
                  className="relative pl-14 lg:pl-0 lg:pt-14
                             lg:before:absolute lg:before:left-0 lg:before:top-[22px] lg:before:h-px
                             lg:before:-right-6 lg:[&:nth-child(3n)]:before:right-0
                             lg:before:origin-left lg:before:scale-x-0 lg:before:bg-line
                             lg:before:transition-transform lg:before:duration-700 lg:before:delay-150
                             lg:before:ease-smooth lg:[&.opacity-100]:before:scale-x-100"
                >
                  {/* Node on the spine / line. */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 z-[1] grid h-11 w-11 place-items-center rounded-full
                               border-4 border-white bg-red font-display text-xs font-extrabold text-white
                               shadow-red-glow"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div
                    className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5
                               shadow-chip transition-all duration-300 ease-smooth
                               hover:-translate-y-1 hover:border-red/25 hover:shadow-card"
                  >
                    <Spotlight size={240} />
                    <p className="relative text-[15px] font-medium leading-snug text-charcoal">
                      {point.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
