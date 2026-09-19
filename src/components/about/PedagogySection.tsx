import Reveal from "@/components/ui/Reveal";
import { PEDAGOGY_INTRO } from "@/lib/defaults";
import type { PedagogyPoint } from "@/lib/types";

/**
 * Our Pedagogy (SRS 7.2.4) - the full nine-point list.
 *
 * This is the complete version. The homepage deliberately has no pedagogy
 * section at all: it was tried there and removed for making the page too heavy,
 * so do not reintroduce it (SRS 7.2.4).
 *
 * Laid out as a two-column split - a sticky intro against a numbered list -
 * rather than another card grid, so the About page does not read as five
 * variations of the same block.
 */
export default function PedagogySection({ points }: { points: PedagogyPoint[] }) {
  if (points.length === 0) return null;

  return (
    <section className="section">
      <div className="container-site">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
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

          <ol className="grid gap-3 sm:grid-cols-2">
            {points.map((point, i) => (
              <Reveal
                as="li"
                key={point.id}
                delay={(i % 2) * 70}
                className="group flex items-start gap-4 rounded-2xl border border-line bg-white p-5
                           shadow-chip transition-all duration-300 ease-smooth
                           hover:-translate-y-1 hover:border-red/25 hover:shadow-card"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-red/[0.08] font-display text-sm font-bold text-red transition-colors duration-300 group-hover:bg-red group-hover:text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pt-1.5 text-[15px] font-medium leading-snug text-charcoal">
                  {point.text}
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
