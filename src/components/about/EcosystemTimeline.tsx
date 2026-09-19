import Reveal from "@/components/ui/Reveal";
import type { EcosystemCard } from "@/lib/types";

/**
 * "Not Just Coaching — An Ecosystem" (SRS 7.2.3).
 *
 * The three ventures are dated 2008, 2014 and 2020, so they are laid out as a
 * timeline rather than three equal cards - it shows the sequence the copy is
 * actually describing.
 *
 * Acumen Gate Academy is visually distinguished as the lead entity, which the
 * SRS requires in both 1.2 and 7.2.3; the other two are styled identically to
 * each other. Sorting is by the stored order, so the highlight follows the data
 * rather than a hardcoded position.
 */
export default function EcosystemTimeline({ cards }: { cards: EcosystemCard[] }) {
  if (cards.length === 0) return null;

  return (
    <section className="section section-alt">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
            The Ecosystem
          </p>
          <h2 className="h-section mt-5">Not Just Coaching — An Ecosystem</h2>
          <p className="lede mt-4">
            Three ventures built over sixteen years. Students preparing for GATE are connected to
            the same industrial, HR and leadership network built across all of them.
          </p>
        </Reveal>

        <div className="relative mt-14">
          {/* The spine. Vertical on mobile, horizontal from lg up. */}
          <div
            aria-hidden="true"
            className="absolute left-[22px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-line via-line to-transparent lg:left-0 lg:top-[26px] lg:h-px lg:w-full lg:bg-gradient-to-r"
          />

          <ol className="relative grid gap-8 lg:grid-cols-3 lg:gap-8">
            {cards.map((card, i) => (
              <Reveal
                as="li"
                key={card.id}
                delay={i * 110}
                className="relative pl-14 lg:pl-0 lg:pt-16"
              >
                {/* Node on the spine. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1 grid h-11 w-11 place-items-center rounded-full
                              border-4 border-offwhite lg:left-0 lg:top-0 ${
                                card.highlighted ? "bg-red shadow-red-glow" : "bg-charcoal"
                              }`}
                >
                  <span className="h-2 w-2 rounded-full bg-white" />
                </span>

                <div
                  className={`h-full rounded-2xl border-2 bg-white p-7 transition-all duration-300 ease-smooth hover:-translate-y-1.5 ${
                    card.highlighted
                      ? "border-red shadow-card-hover"
                      : "border-line shadow-card hover:shadow-card-hover"
                  }`}
                >
                  {card.year && (
                    <span
                      className={`inline-block rounded-full px-3 py-1 font-display text-xs font-bold ${
                        card.highlighted ? "bg-red text-white" : "bg-offwhite text-muted"
                      }`}
                    >
                      {card.year}
                    </span>
                  )}
                  <h3 className="mt-4 font-display text-xl font-bold text-charcoal">{card.name}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-body">{card.description}</p>

                  {card.highlighted && (
                    <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-red/[0.07] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-red">
                      You are here
                    </p>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
