import type { ResultEntry } from "./types";

/** "52 & 425" -> [52, 425]. Two ranks mean two GATE papers. */
export function parseAirs(air: string | null | undefined): number[] {
  return (air ?? "")
    .split(/[^0-9]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** The student's best (lowest) All India Rank, or null if they only qualified. */
export function bestAir(entry: Pick<ResultEntry, "air">): number | null {
  const ranks = parseAirs(entry.air);
  return ranks.length ? Math.min(...ranks) : null;
}

/** Ranked students first (best rank first), then everyone who qualified. */
export function sortByRank<T extends Pick<ResultEntry, "air" | "sort_order">>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const ra = bestAir(a);
    const rb = bestAir(b);
    if (ra !== null && rb !== null) return ra - rb;
    if (ra !== null) return -1;
    if (rb !== null) return 1;
    return a.sort_order - b.sort_order;
  });
}

/** The facts shown in the results hero, worked out from the entries. */
export function resultStats(entries: Pick<ResultEntry, "air">[]) {
  const best = entries.map(bestAir).filter((n): n is number => n !== null);
  return {
    total: entries.length,
    ranked: best.length,
    best: best.length ? Math.min(...best) : null,
    top100: best.filter((n) => n <= 100).length,
    top500: best.filter((n) => n <= 500).length,
    top1000: best.filter((n) => n <= 1000).length,
  };
}
