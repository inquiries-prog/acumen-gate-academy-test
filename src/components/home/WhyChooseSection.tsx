import { WhyIcon } from "@/components/art/Icons";
import ComparisonTable from "@/components/home/ComparisonTable";
import AmbientGlow from "@/components/ui/AmbientGlow";
import CursorGlow from "@/components/ui/CursorGlow";
import Parallax from "@/components/ui/Parallax";
import Rail from "@/components/ui/Rail";
import Reveal from "@/components/ui/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { WhyChooseCard } from "@/lib/types";

/**
 * Why Choose Acumen (SRS 7.1.5).
 *
 * Six cards of EQUAL visual weight - no card is highlighted or styled
 * differently from the others. Every card gets the identical tile, border,
 * padding, hover and text sizing; only the icon glyph differs, which
 * distinguishes without ranking.
 *
 * The section sits on the dark ground deliberately. It is the argument for
 * paying more for offline than a big national online platform, so it should
 * feel like the page pausing to make a case rather than another row of white
 * cards. Copy stays factual and confident, never defensive.
 *
 * Icons are animated line drawings (components/art/Icons.tsx) that draw
 * themselves as the cards scroll in, then keep one small loop. They are
 * chosen by position with a fallback, because the card text is
 * admin-editable and may be reworded or reordered at any time.
 */
export default function WhyChooseSection({ cards }: { cards: WhyChooseCard[] }) {
  return (
    <section className="relative overflow-hidden bg-charcoal bg-dark-sheen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-texture opacity-[0.05]" />
      <Parallax speed={0.18} className="pointer-events-none absolute inset-x-0 -inset-y-1/4">
        <AmbientGlow tone="dark" />
      </Parallax>
      <CursorGlow />

      <div className="container-site relative py-16 md:py-24 lg:py-28">
        <SectionHeading
          eyebrow="Why Acumen"
          tone="dark"
          title="Why Choose Acumen as Your GATE Partner"
          lede="Six reasons students choose a Vadodara classroom over an anonymous national platform."
        />

        <Rail
          dark
          className="mt-10 sm:mt-14"
          grid="sm:grid-cols-2 lg:grid-cols-3"
          hint="Swipe for all six reasons"
        >
          {cards.map((card, i) => (
            <Reveal
              key={card.id}
              as="article"
              delay={(i % 3) * 80}
              variant="scale"
              className="group h-full rounded-2xl border border-white/10 bg-white/[0.045] p-7
                         transition-all duration-300 ease-smooth
                         hover:-translate-y-1.5 hover:border-red/40 hover:bg-white/[0.08]"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-red/15 text-red transition-all duration-300 group-hover:scale-105 group-hover:bg-red group-hover:text-white">
                <WhyIcon index={i} className="h-9 w-9" />
              </span>
              <h3 className="mt-6 font-display text-[17px] font-bold leading-snug text-white">
                {card.heading}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/60">{card.body}</p>
            </Reveal>
          ))}
        </Rail>

        {/* Kept INSIDE this section rather than added as a new one: the
            homepage section order in SRS 7.1 is finalised, and this is the
            evidence for the argument the six cards above are making. */}
        <ComparisonTable />
      </div>
    </section>
  );
}
