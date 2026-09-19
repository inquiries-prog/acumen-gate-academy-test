import ComparisonTable from "@/components/home/ComparisonTable";
import AmbientGlow from "@/components/ui/AmbientGlow";
import CursorGlow from "@/components/ui/CursorGlow";
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
 * Icons are chosen by position with a fallback, because the card text is
 * admin-editable and may be reworded or reordered at any time.
 */
export default function WhyChooseSection({ cards }: { cards: WhyChooseCard[] }) {
  return (
    <section className="relative overflow-hidden bg-charcoal bg-dark-sheen">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-texture opacity-[0.05]" />
      <AmbientGlow tone="dark" />
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
              className="group h-full rounded-2xl border border-white/10 bg-white/[0.045] p-7
                         transition-all duration-300 ease-smooth
                         hover:-translate-y-1.5 hover:border-red/40 hover:bg-white/[0.08]"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red/15 text-red transition-colors duration-300 group-hover:bg-red group-hover:text-white">
                {ICONS[i] ?? ICONS[ICONS.length - 1]}
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

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Ordered to match the six default cards in SRS 7.1.5. */
const ICONS = [
  <svg key="trophy" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 4h10v5a5 5 0 01-10 0V4z" {...stroke} />
    <path d="M7 6H4.5A2.5 2.5 0 007 9M17 6h2.5A2.5 2.5 0 0117 9" {...stroke} />
    <path d="M12 14v4m-3.5 2.5h7" {...stroke} />
  </svg>,
  <svg key="mentor" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="9" cy="8" r="3.2" {...stroke} />
    <path d="M3.5 20a5.5 5.5 0 0111 0" {...stroke} />
    <path d="M16 5.5a3 3 0 010 5.6M18 15.5a5 5 0 013 4.5" {...stroke} />
  </svg>,
  <svg key="reach" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6.5 3.5h2.2l1.4 3.6-1.8 1.4a11.5 11.5 0 005.4 5.4l1.4-1.8 3.6 1.4v2.2a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.7a2 2 0 012-2.2z"
      {...stroke}
    />
  </svg>,
  <svg key="calendar" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...stroke} />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" {...stroke} />
    <path d="M8.5 14l2 2 4-4.5" {...stroke} />
  </svg>,
  <svg key="library" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 5.5A1.5 1.5 0 015.5 4H11v16H5.5A1.5 1.5 0 014 18.5v-13z" {...stroke} />
    <path d="M20 5.5A1.5 1.5 0 0018.5 4H13v16h5.5a1.5 1.5 0 001.5-1.5v-13z" {...stroke} />
  </svg>,
  <svg key="briefcase" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" {...stroke} />
    <path d="M9 7.5V5.8A1.8 1.8 0 0110.8 4h2.4A1.8 1.8 0 0115 5.8v1.7M3 12.5h18" {...stroke} />
  </svg>,
];
