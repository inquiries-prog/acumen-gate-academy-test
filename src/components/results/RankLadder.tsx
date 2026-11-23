"use client";

import { useInView } from "@/components/courses/useInView";
import Reveal from "@/components/ui/Reveal";
import { useSiteUI } from "@/components/site/SiteUI";
import { bestAir } from "@/lib/results";
import type { ResultEntry } from "@/lib/types";
import FaceCrop from "./FaceCrop";

const BANDS = [
  { label: "Top 100", max: 100 },
  { label: "101 – 500", max: 500 },
  { label: "501 – 1000", max: 1000 },
  { label: "1001 – 1500", max: 1500 },
  { label: "1501 +", max: Infinity },
];

/**
 * "Where our students landed": every ranked student plotted as a face on a
 * scale from AIR 1 to the year's last rank.
 *
 * The scale is logarithmic, the way rank actually feels - the gap between
 * AIR 50 and 100 matters as much as the gap between 1000 and 2000 - so the
 * top ranks get room instead of being squashed into the corner. Faces that
 * would overlap are stacked into lanes above and below the line.
 *
 * Desktop draws the line and the faces pop onto it in rank order. Phones get
 * the same data as rank bands (Top 100, 101-500, ...). Tapping a face opens
 * that student's success post.
 */
export default function RankLadder({ entries, yearLabel }: { entries: ResultEntry[]; yearLabel: string }) {
  const { push } = useSiteUI();
  const { ref, inView } = useInView<HTMLDivElement>();

  const ranked = entries
    .map((e) => ({ entry: e, air: bestAir(e) }))
    .filter((r): r is { entry: ResultEntry; air: number } => r.air !== null)
    .sort((a, b) => a.air - b.air);
  if (ranked.length < 3) return null;

  const scaleMax = Math.max(2000, Math.ceil(ranked[ranked.length - 1].air / 500) * 500);
  // Start just below the best rank, so the faces use the whole width rather
  // than leaving the AIR 1-50 stretch empty when nobody ranked there.
  const scaleMin = [1, 10, 25, 40, 75, 150].filter((m) => m < ranked[0].air).pop() ?? 1;
  const span = Math.log10(scaleMax) - Math.log10(scaleMin);
  const pos = (air: number) => ((Math.log10(air) - Math.log10(scaleMin)) / span) * 100;
  const ticks = [scaleMin, 10, 50, 100, 250, 500, 1000, 1500, 2000, scaleMax].filter(
    (t, i, a) => t >= scaleMin && t <= scaleMax && a.indexOf(t) === i,
  ).filter((t, i, a) => i === 0 || pos(t) - pos(a[i - 1]) > 6);

  // Greedy lanes: 0 and 2 above the line, 1 and 3 below.
  const MIN_GAP = 4.2;
  const laneEnds: number[] = [];
  const placed = ranked.map((r) => {
    const x = pos(r.air);
    let lane = laneEnds.findIndex((end) => x - end >= MIN_GAP);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(x);
    } else {
      laneEnds[lane] = x;
    }
    return { ...r, x, lane };
  });
  const lanes = Math.max(2, laneEnds.length);
  const above = Math.ceil(lanes / 2);
  const below = lanes - above;
  const LANE_H = 84;
  const AV = 52; // avatar diameter
  const LINE_Y = above * LANE_H + 24; // centre of the line, from the top
  const HEIGHT = LINE_Y + below * LANE_H + 40;

  const gallery = ranked.map((r) => ({
    id: r.entry.id,
    image_url: r.entry.image_url,
    alt_text: r.entry.alt_text,
    kind: "result" as const,
    show_in_carousel: false,
    show_in_news_strip: false,
    sort_order: 0,
  }));
  const open = (i: number) => push({ kind: "lightbox", images: gallery, index: i });

  return (
    <section className="section overflow-hidden">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
            The rank ladder
          </p>
          <h2 className="h-section mt-5">Where our {yearLabel} students landed</h2>
          <p className="lede mt-4">
            {ranked.length} All India Ranks, from AIR {ranked[0].air} to AIR {ranked[ranked.length - 1].air}. Every face
            is a student who sat in our classes. Tap one to see their result.
          </p>
        </Reveal>

        {/* ---------------------------------------------- desktop ladder */}
        <div ref={ref} className="relative mt-14 hidden md:block" style={{ height: HEIGHT }}>
          <div className="absolute inset-x-0" style={{ top: LINE_Y - 4 }}>
            <div className="relative h-2 rounded-full bg-line">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red via-red/70 to-red/20 transition-[width] duration-[1600ms] ease-smooth"
                style={{ width: inView ? "100%" : "0%" }}
              />
            </div>
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute top-4 -translate-x-1/2 text-[11px] font-bold tabular-nums text-muted"
                style={{ left: `${pos(t)}%` }}
              >
                {t === scaleMin ? `AIR ${t}` : t}
              </span>
            ))}
          </div>

          {placed.map((p, i) => {
            const up = p.lane % 2 === 0;
            const depth = Math.floor(p.lane / 2) + 1;
            const stalk = depth * LANE_H - AV;
            const top = up ? LINE_Y - depth * LANE_H : LINE_Y + depth * LANE_H - AV;
            return (
              <button
                key={p.entry.id}
                type="button"
                onClick={() => open(i)}
                aria-label={`${p.entry.student_name}, AIR ${p.entry.air}`}
                className="group absolute -translate-x-1/2 transition-[opacity,transform] duration-700 ease-smooth"
                style={{
                  left: `${p.x}%`,
                  top,
                  opacity: inView ? 1 : 0,
                  transform: `translate(-50%, ${inView ? 0 : up ? 16 : -16}px) scale(${inView ? 1 : 0.6})`,
                  transitionDelay: `${300 + i * 70}ms`,
                }}
              >
                {/* Stalk to the line. */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 w-px -translate-x-1/2 bg-red/30"
                  style={up ? { top: AV, height: stalk } : { bottom: AV, height: stalk }}
                />
                <span className="relative block h-[52px] w-[52px] rounded-full ring-[3px] ring-white shadow-card transition-transform duration-300 group-hover:scale-125 group-hover:shadow-lifted">
                  <FaceCrop src={p.entry.image_url} alt="" size={52} />
                </span>
                <span
                  className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 font-display text-[11px] font-extrabold ${
                    p.air <= 100 ? "bg-red text-white" : "bg-charcoal text-white"
                  } ${up ? "-top-5" : "-bottom-5"}`}
                >
                  {p.air}
                </span>
                {/* Name on hover. */}
                <span
                  className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-charcoal opacity-0 shadow-lifted transition-opacity duration-200 group-hover:opacity-100 ${
                    up ? "-top-12" : "-bottom-12"
                  }`}
                >
                  {p.entry.student_name}
                  {p.entry.branch ? ` · ${p.entry.branch}` : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* ---------------------------------------------- phone bands */}
        <div className="mt-10 space-y-4 md:hidden">
          {BANDS.map((band, bi) => {
            const min = bi === 0 ? 1 : BANDS[bi - 1].max + 1;
            const inBand = ranked
              .map((r, i) => ({ ...r, i }))
              .filter((r) => r.air >= min && r.air <= band.max);
            if (inBand.length === 0) return null;
            return (
              <Reveal key={band.label} delay={bi * 60}>
                <div className="rounded-2xl border border-line bg-white p-4 shadow-chip">
                  <div className="flex items-baseline justify-between">
                    <p className={`font-display text-base font-extrabold ${bi === 0 ? "text-red" : "text-charcoal"}`}>
                      AIR {band.label}
                    </p>
                    <p className="text-xs font-bold text-muted">
                      {inBand.length} student{inBand.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-3">
                    {inBand.map((r) => (
                      <li key={r.entry.id}>
                        <button type="button" onClick={() => open(r.i)} className="flex w-14 flex-col items-center gap-1">
                          <FaceCrop src={r.entry.image_url} alt="" size={56} className="w-14 ring-2 ring-line" />
                          <span className="w-full truncate text-center text-[10.5px] font-semibold text-charcoal">
                            {r.entry.student_name.split(" ")[0]}
                          </span>
                          <span className="rounded bg-charcoal px-1 font-display text-[10px] font-extrabold text-white">{r.air}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
