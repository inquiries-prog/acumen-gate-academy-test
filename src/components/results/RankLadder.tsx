"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const DOT = 16; // dot diameter, px
const GAP = 3; // space kept between neighbouring dots
const LABEL_W = 132; // row label column
const ROW_PAD = 26; // space above and below a row's dots
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Ranked = { entry: ResultEntry; air: number; index: number };
type Placed = Ranked & { x: number; dy: number };

/**
 * "Where our students landed": a dot plot. One row per GATE year, every
 * ranked student a dot at their All India Rank.
 *
 * The rank axis is logarithmic, the way rank actually feels - the gap
 * between AIR 50 and 100 matters as much as the gap between 1000 and 2000.
 * Dots that would overlap are nudged up or down (a beeswarm), so every
 * student stays visible without the chart turning into a wall of faces: the
 * photo, name and branch appear on hover or keyboard focus, and a click opens
 * the student's result. Only the best rank in each row is labelled.
 *
 * Phones get the same data as rank bands (Top 100, 101-500, ...), and every
 * screen can switch to a plain list.
 */
export default function RankLadder({
  entries,
  yearLabel,
  yearOf = {},
}: {
  entries: ResultEntry[];
  yearLabel: string;
  /** year_id -> "GATE 2026". One row per year. */
  yearOf?: Record<string, string>;
}) {
  const { push } = useSiteUI();
  const { ref, inView } = useInView<HTMLDivElement>();
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  useIsoLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showList]);

  const ranked: Ranked[] = entries
    .map((e) => ({ entry: e, air: bestAir(e) }))
    .filter((r): r is { entry: ResultEntry; air: number } => r.air !== null)
    .sort((a, b) => a.air - b.air)
    .map((r, index) => ({ ...r, index }));
  if (ranked.length < 3) return null;

  // ---------------------------------------------------------------- scale
  const scaleMax = Math.max(2000, Math.ceil(ranked[ranked.length - 1].air / 500) * 500);
  const scaleMin = [1, 10, 25, 40].filter((m) => m < ranked[0].air).pop() ?? 1;
  const plotW = Math.max(0, width - LABEL_W);
  const lo = Math.log10(scaleMin);
  const span = Math.log10(scaleMax) - lo;
  const xOf = (air: number) => DOT / 2 + ((Math.log10(air) - lo) / span) * (plotW - DOT);
  const ticks = [10, 25, 50, 100, 250, 500, 1000, 2000, scaleMax]
    .filter((t, i, a) => t >= scaleMin && t <= scaleMax && a.indexOf(t) === i)
    .filter((t, i, a) => i === 0 || xOf(t) - xOf(a[i - 1]) > 44);

  // ----------------------------------------------------------------- rows
  const rowKeys = Array.from(new Set(ranked.map((r) => r.entry.year_id))).sort((a, b) =>
    (yearOf[b] ?? "").localeCompare(yearOf[a] ?? ""),
  );
  const rows = rowKeys.map((key) => {
    // Beeswarm: each dot takes the offset nearest the centre line that
    // doesn't touch a dot already placed.
    const placed: Placed[] = [];
    for (const r of ranked.filter((x) => x.entry.year_id === key)) {
      const x = xOf(r.air);
      const near = placed.filter((p) => Math.abs(p.x - x) < DOT + GAP);
      let dy = 0;
      for (let k = 0; k < 40; k++) {
        const cand = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (DOT * 0.62);
        if (near.every((p) => Math.hypot(p.x - x, p.dy - cand) >= DOT + GAP)) {
          dy = cand;
          break;
        }
      }
      placed.push({ ...r, x, dy });
    }
    const reach = Math.max(DOT, ...placed.map((p) => Math.abs(p.dy) + DOT / 2));
    return { key, label: yearOf[key] ?? "GATE", placed, height: Math.max(reach * 2 + ROW_PAD * 2, 132), reach };
  });
  const plotH = rows.reduce((n, r) => n + r.height, 0);
  const rowTop = (i: number) => rows.slice(0, i).reduce((n, r) => n + r.height, 0);

  // Density wave behind each row (a smoothed count of students along the
  // rank axis), drawn mirrored around the row's centre line like a violin.
  const BW = 26; // smoothing, px
  const samples = Array.from({ length: Math.max(2, Math.ceil(plotW / 4) + 1) }, (_, i) => Math.min(i * 4, plotW));
  const dens = rows.map((row) =>
    samples.map((x) => row.placed.reduce((n, p) => n + Math.exp(-0.5 * ((x - p.x) / BW) ** 2), 0)),
  );
  const densMax = Math.max(1e-6, ...dens.flat());
  const ridges = rows.map((row, ri) => {
    const mid = rowTop(ri) + row.height / 2;
    const amp = row.height / 2 - 10;
    const upper = samples.map((x, i) => `${x.toFixed(1)},${(mid - (dens[ri][i] / densMax) * amp).toFixed(1)}`);
    const lower = samples.map((x, i) => `${x.toFixed(1)},${(mid + (dens[ri][i] / densMax) * amp).toFixed(1)}`).reverse();
    return { area: `M${upper.join(" L")} L${lower.join(" L")} Z`, edge: `M${upper.join(" L")}`, edgeLow: `M${lower.join(" L")}`, mid };
  });

  const within = (n: number) => ranked.filter((r) => r.air <= n).length;
  const activeDot = rows.flatMap((r, ri) => r.placed.map((p) => ({ p, ri, row: r }))).find((d) => d.p.entry.id === active);

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
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden="true" />
              The rank map
            </p>
            <h2 className="h-section mt-5">Where our {yearLabel} students landed</h2>
            <p className="lede mt-4">
              {ranked.length} All India Ranks, from AIR {ranked[0].air} to AIR {ranked[ranked.length - 1].air}. Every
              dot is a student who sat in our classes - point at one to meet them.
            </p>
          </Reveal>
          <button
            type="button"
            onClick={() => setShowList((v) => !v)}
            aria-expanded={showList}
            className="btn-secondary btn-sm"
          >
            {showList ? "Show the chart" : "See every rank as a list"}
          </button>
        </div>

        {showList ? (
          <ul className="mt-10 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 animate-reveal">
            {ranked.map((r) => (
              <li key={r.entry.id}>
                <button
                  type="button"
                  onClick={() => open(r.index)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-2.5 text-left shadow-chip transition-colors hover:border-red/30"
                >
                  <FaceCrop isPost={r.entry.photo_is_post !== false} src={r.entry.image_url} alt={r.entry.student_name} size={40} className="w-10" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-charcoal">{r.entry.student_name}</span>
                    <span className="block truncate text-xs text-muted">
                      {[yearOf[r.entry.year_id], r.entry.branch].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-sm font-extrabold tabular-nums text-charcoal">AIR {r.air}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            {/* ------------------------------------------ desktop dot plot */}
            <div ref={ref} className="mt-12 hidden md:block">
              <div className="relative isolate overflow-hidden rounded-[2rem] bg-charcoal bg-dark-sheen p-8 text-white shadow-lifted lg:p-10">
                <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.05]" />
                <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-red/25 blur-3xl animate-glow-b" />

                {/* Headline numbers */}
                <dl className="relative flex flex-wrap items-center gap-x-10 gap-y-3">
                  {[
                    { k: "In the top 100", v: within(100) },
                    { k: "In the top 500", v: within(500) },
                    { k: "In the top 1000", v: within(1000) },
                  ].map((f, i) => (
                    <div key={f.k} className="flex items-baseline gap-2.5">
                      <dd
                        className={`font-display text-4xl font-extrabold tabular-nums transition-all duration-700 ease-smooth ${i === 0 ? "text-red" : "text-white"}`}
                        style={{ opacity: inView ? 1 : 0, transform: `translateY(${inView ? 0 : 12}px)`, transitionDelay: `${i * 120}ms` }}
                      >
                        {f.v}
                      </dd>
                      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">{f.k}</dt>
                    </div>
                  ))}
                </dl>

                <div
                  ref={plotRef}
                  className="relative mt-10"
                  style={{ height: plotH + 40 }}
                  onMouseLeave={() => setActive(null)}
                >
                  {width > 0 && (
                    <>
                      {/* Top 100 band */}
                      <div
                        aria-hidden="true"
                        className="absolute top-0 rounded-2xl bg-gradient-to-r from-red/30 via-red/15 to-red/[0.04] ring-1 ring-inset ring-red/25"
                        style={{ left: LABEL_W, width: Math.max(0, xOf(100)), height: plotH }}
                      >
                        <span className="absolute bottom-2.5 left-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/70">
                          Top 100
                        </span>
                      </div>

                      {/* Grid and axis */}
                      {ticks.map((t) => (
                        <div key={t} aria-hidden="true" className="absolute top-0" style={{ left: LABEL_W + xOf(t), height: plotH + 26 }}>
                          <div className="absolute top-0 w-px -translate-x-1/2 bg-white/[0.08]" style={{ height: plotH }} />
                          <span className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold tabular-nums text-white/45">
                            {t === ticks[0] ? `AIR ${t}` : t.toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                      <p className="absolute bottom-0 left-0 text-[11px] text-white/40">All India Rank (log scale) →</p>

                      {/* Density waves, revealed left to right */}
                      <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute top-0 transition-[clip-path] duration-[1800ms] ease-smooth"
                        style={{
                          left: LABEL_W,
                          width: plotW,
                          height: plotH,
                          clipPath: inView ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                        }}
                        viewBox={`0 0 ${plotW} ${plotH}`}
                      >
                        <defs>
                          <linearGradient id="rank-ridge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#E31E24" stopOpacity="0.04" />
                            <stop offset="0.5" stopColor="#E31E24" stopOpacity="0.32" />
                            <stop offset="1" stopColor="#E31E24" stopOpacity="0.04" />
                          </linearGradient>
                        </defs>
                        {ridges.map((r, i) => (
                          <g key={rows[i].key}>
                            <path d={r.area} fill="url(#rank-ridge)" />
                            <path d={r.edge} fill="none" stroke="#E31E24" strokeOpacity="0.55" strokeWidth="1.5" />
                            <path d={r.edgeLow} fill="none" stroke="#E31E24" strokeOpacity="0.3" strokeWidth="1" />
                            <line x1="0" x2={plotW} y1={r.mid} y2={r.mid} stroke="white" strokeOpacity="0.08" strokeDasharray="2 6" />
                          </g>
                        ))}
                      </svg>

                      {/* Crosshair for the active dot */}
                      {activeDot && (
                        <div aria-hidden="true" className="pointer-events-none absolute" style={{ left: LABEL_W + activeDot.p.x, top: 0, height: plotH + 26 }}>
                          <div
                            className="absolute w-px -translate-x-1/2 bg-gradient-to-b from-white/70 to-white/10"
                            style={{ top: rowTop(activeDot.ri) + activeDot.row.height / 2 + activeDot.p.dy, bottom: 22 }}
                          />
                          <span className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap rounded-md bg-red px-1.5 py-0.5 font-display text-[11px] font-extrabold text-white shadow-red-glow">
                            AIR {activeDot.p.air}
                          </span>
                        </div>
                      )}

                      {/* Rows */}
                      {rows.map((row, ri) => {
                        const top = rowTop(ri);
                        const mid = top + row.height / 2;
                        const best = row.placed[0];
                        return (
                          <div key={row.key}>
                            {ri > 0 && <div aria-hidden="true" className="absolute right-0 h-px bg-white/10" style={{ left: 0, top }} />}
                            <div className="absolute left-0 -translate-y-1/2" style={{ top: mid, width: LABEL_W - 16 }}>
                              <p className="font-display text-lg font-extrabold text-white">{row.label}</p>
                              <p className="text-xs font-semibold text-white/50">
                                {row.placed.length} rank{row.placed.length === 1 ? "" : "s"}
                              </p>
                            </div>
                            {/* The one direct label: the row's best rank. */}
                            {best && (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-white/15 backdrop-blur-sm transition-opacity duration-500"
                                style={{
                                  left: LABEL_W + best.x,
                                  top: mid - Math.max(row.reach, DOT) - 34,
                                  opacity: inView && !active ? 1 : 0,
                                  transitionDelay: inView && !active ? "900ms" : "0ms",
                                }}
                              >
                                AIR {best.air} · {best.entry.student_name.split(" ")[0]}
                              </span>
                            )}
                            {row.placed.map((p) => {
                              const isActive = active === p.entry.id;
                              const dim = active !== null && !isActive;
                              const isBest = p.index === 0;
                              return (
                                <button
                                  key={p.entry.id}
                                  type="button"
                                  onClick={() => open(p.index)}
                                  onMouseEnter={() => setActive(p.entry.id)}
                                  onFocus={() => setActive(p.entry.id)}
                                  onBlur={() => setActive(null)}
                                  aria-label={`${p.entry.student_name}, AIR ${p.entry.air}, ${row.label}`}
                                  className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-none"
                                  style={{ left: LABEL_W + p.x, top: mid + p.dy, zIndex: isActive ? 20 : 1 }}
                                >
                                  {isBest && inView && (
                                    <span aria-hidden="true" className="absolute h-4 w-4 rounded-full bg-red/60 animate-ping" />
                                  )}
                                  <span
                                    className={`relative block rounded-full ring-2 ring-charcoal ${isActive ? "bg-white" : "bg-red"}`}
                                    style={{
                                      width: DOT,
                                      height: DOT,
                                      boxShadow: isActive
                                        ? "0 0 0 4px rgba(227,30,36,0.55), 0 0 24px rgba(227,30,36,0.9)"
                                        : "0 0 14px rgba(227,30,36,0.55)",
                                      opacity: !inView ? 0 : dim ? 0.3 : 1,
                                      transform: `translateY(${inView ? 0 : -36}px) scale(${!inView ? 0.4 : isActive ? 1.5 : 1})`,
                                      transition:
                                        "transform 700ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease, background-color 200ms, box-shadow 300ms",
                                      transitionDelay: inView && active === null ? `${400 + p.index * 35}ms` : "0ms",
                                    }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}

                      {/* Tooltip */}
                      {activeDot &&
                        (() => {
                          const { p, row, ri } = activeDot;
                          const top = rowTop(ri) + row.height / 2 + p.dy;
                          const left = Math.min(Math.max(LABEL_W + p.x, 130), width - 130);
                          // Above the dot, unless that would run off the top of the chart.
                          const below = top < 150;
                          return (
                            <div
                              role="tooltip"
                              className={`pointer-events-none absolute z-30 w-60 -translate-x-1/2 ${below ? "" : "-translate-y-full"}`}
                              style={{ left, top: below ? top + 22 : top - 20 }}
                            >
                              <div key={p.entry.id} className="animate-pop rounded-2xl bg-white p-3 text-charcoal shadow-lifted">
                              <div className="flex items-center gap-3">
                                <FaceCrop isPost={p.entry.photo_is_post !== false} src={p.entry.image_url} alt={p.entry.student_name} size={52} className="w-[52px] ring-2 ring-red/20" />
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-charcoal">{p.entry.student_name}</p>
                                  <p className="font-display text-xl font-extrabold leading-tight text-red">AIR {p.entry.air}</p>
                                  <p className="truncate text-xs text-muted">
                                    {[row.label, p.entry.branch].filter(Boolean).join(" · ")}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-2 border-t border-line pt-2 text-[11px] font-semibold text-muted">Click to see the result →</p>
                              </div>
                            </div>
                          );
                        })()}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------- phone bands */}
            <div className="mt-10 space-y-4 md:hidden">
              {BANDS.map((band, bi) => {
                const min = bi === 0 ? 1 : BANDS[bi - 1].max + 1;
                const inBand = ranked.filter((r) => r.air >= min && r.air <= band.max);
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
                            <button type="button" onClick={() => open(r.index)} className="flex w-14 flex-col items-center gap-1">
                              <FaceCrop isPost={r.entry.photo_is_post !== false} src={r.entry.image_url} alt={r.entry.student_name} size={56} className="w-14 ring-2 ring-line" />
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
          </>
        )}
      </div>
    </section>
  );
}
