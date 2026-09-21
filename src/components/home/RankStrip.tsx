import { HERO_RANKS, HERO_RANKS_LABEL } from "@/lib/defaults";

/**
 * "Top ranks, GATE 2026" - the All India Ranks from the press clippings, as a
 * row of static chips.
 *
 * Social proof that costs nothing to believe: every rank here is printed in a
 * newspaper the site also shows. Ranks only, no names, no totals - the stat
 * line is the site's one headline number (SRS 15.7) and this is not a second.
 *
 * The chips do not move (an earlier version floated them; the client found it
 * distracting next to the headline). The row reveals with the rest of the hero.
 */
export default function RankStrip({ delay = 0, className = "" }: { delay?: number; className?: string }) {
  if (HERO_RANKS.length === 0) return null;

  return (
    <div className={`animate-reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{HERO_RANKS_LABEL}</p>
      <ul className="mt-2.5 flex flex-wrap gap-2" aria-label={HERO_RANKS_LABEL}>
        {HERO_RANKS.map((rank) => (
          <li key={rank}>
            <span className="inline-flex items-baseline gap-1 rounded-full border border-red/15 bg-white px-3 py-1.5 shadow-chip">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">AIR</span>
              <span className="font-display text-base font-extrabold leading-none text-red">{rank}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
