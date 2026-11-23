import AmbientGlow from "@/components/ui/AmbientGlow";
import Reveal from "@/components/ui/Reveal";
import { bestAir, resultStats, sortByRank } from "@/lib/results";
import type { ResultEntry } from "@/lib/types";
import FaceCrop from "./FaceCrop";

/**
 * Results hero: the year's three best ranks standing on a podium with their
 * own faces, and a ladder of rank milestones - best AIR, top 100 / 500 /
 * 1000, and everyone who qualified - the way the big national institutes
 * present a results year, but worked out live from the entries, so it can
 * never disagree with the list below it.
 *
 * Every figure is a count of named students on this page; the one site-wide
 * marketing number (the stat line) is shown separately, unchanged.
 */
export default function ResultsHero({
  entries,
  yearLabel,
  statLine,
}: {
  entries: ResultEntry[];
  yearLabel: string;
  statLine: string;
}) {
  const stats = resultStats(entries);
  const top = sortByRank(entries).filter((e) => bestAir(e) !== null).slice(0, 3);
  // Podium order: 2nd, 1st, 3rd.
  const podium = [top[1], top[0], top[2]].filter(Boolean) as ResultEntry[];

  const ladder = [
    stats.best !== null && { value: `AIR ${stats.best}`, label: "Best rank" },
    stats.top100 > 0 && { value: String(stats.top100), label: "In the top 100" },
    stats.top500 > 0 && { value: String(stats.top500), label: "In the top 500" },
    stats.top1000 > 0 && { value: String(stats.top1000), label: "In the top 1000" },
    stats.total > 0 && { value: String(stats.total), label: `Qualified ${yearLabel}` },
  ].filter(Boolean) as Array<{ value: string; label: string }>;

  return (
    <section className="relative isolate overflow-hidden bg-charcoal bg-dark-sheen text-white">
      <AmbientGlow tone="dark" />
      <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.05]" />

      <div className="container-site relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              {yearLabel} results
            </p>
            <h1 className="mt-6 text-display-xl text-white">
              Every rank, <span className="text-gradient-red">a name we know.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">
              {statLine} These are {yearLabel}&apos;s champions, each with the rank they earned.
            </p>
          </Reveal>

          {ladder.length > 0 && (
            <dl className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ladder.map((item, i) => (
                <Reveal key={item.label} delay={150 + i * 80} variant="pop">
                  <div
                    className={`h-full rounded-2xl px-4 py-4 ring-1 ${
                      i === 0 ? "bg-red text-white ring-red shadow-red-glow" : "bg-white/[0.06] ring-white/10"
                    }`}
                  >
                    <dd className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{item.value}</dd>
                    <dt className={`mt-1 text-[11px] font-bold uppercase tracking-[0.12em] ${i === 0 ? "text-white/80" : "text-white/50"}`}>
                      {item.label}
                    </dt>
                  </div>
                </Reveal>
              ))}
            </dl>
          )}
        </div>

        {podium.length > 0 && (
          <div className="relative mx-auto w-full max-w-[520px]">
            <div aria-hidden="true" className="absolute inset-x-6 bottom-6 top-1/4 rounded-full bg-red/25 blur-3xl" />
            <ol className="relative grid grid-cols-3 items-end gap-3 sm:gap-4">
              {podium.map((entry) => {
                const place = top.indexOf(entry) + 1;
                const first = place === 1;
                const heights = { 1: "h-36 sm:h-44", 2: "h-24 sm:h-32", 3: "h-16 sm:h-24" } as const;
                return (
                  <Reveal
                    as="li"
                    key={entry.id}
                    delay={first ? 350 : place === 2 ? 200 : 500}
                    variant="up"
                    distance="lg"
                    className="flex flex-col items-center text-center"
                  >
                    <div className={`relative ${first ? "w-[88%]" : "w-[76%]"}`}>
                      {first && (
                        <span aria-hidden="true" className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl animate-bob">
                          👑
                        </span>
                      )}
                      <span
                        className={`absolute -inset-1.5 rounded-full ${first ? "bg-red-sheen animate-pulse" : "bg-white/20"}`}
                        aria-hidden="true"
                      />
                      <FaceCrop src={entry.image_url} alt={entry.alt_text || entry.student_name} size={170} priority className="relative ring-4 ring-charcoal" />
                    </div>
                    <p className="mt-3 truncate font-display text-sm font-bold text-white sm:text-base">{entry.student_name}</p>
                    <p className={`font-display text-lg font-extrabold sm:text-xl ${first ? "text-red" : "text-white"}`}>
                      AIR {entry.air}
                    </p>
                    <div
                      className={`mt-3 flex w-full items-start justify-center rounded-t-2xl pt-3 font-display text-3xl font-extrabold ${
                        heights[place as 1 | 2 | 3]
                      } ${first ? "bg-red text-white shadow-red-glow" : "bg-white/[0.08] text-white/80 ring-1 ring-white/10"}`}
                    >
                      {place}
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}
