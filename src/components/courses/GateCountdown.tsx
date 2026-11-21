"use client";

import { useEffect, useState } from "react";

/**
 * Live countdown to the GATE exam - the date is admin-editable (site
 * settings), and a blank or past date hides this entirely.
 *
 * Renders nothing on the server and on the first client render, then fills
 * in: the time remaining depends on the visitor's clock, so rendering it on
 * the server would only produce a hydration mismatch.
 *
 * `variant="tiles"` is the big four-tile version for page heroes;
 * `variant="chip"` is a one-line pill for menus and cards.
 */
export default function GateCountdown({
  date,
  label,
  variant = "tiles",
  tone = "light",
  className = "",
}: {
  date: string;
  label: string;
  variant?: "tiles" | "chip";
  tone?: "light" | "dark";
  className?: string;
}) {
  const target = parseDate(date);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target || now === null) return null;
  const remaining = target - now;
  if (remaining <= 0) return null;

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);

  if (variant === "chip") {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
          tone === "dark" ? "bg-white/10 text-white ring-1 ring-white/15" : "bg-red/[0.07] text-red"
        } ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red" />
        </span>
        {/* Calendar days ("77 days to go" while 76d 5h remain), matching the
            demo panel's chip, which counts the same way. */}
        <span className="tabular-nums">{Math.ceil(remaining / 86_400_000)}</span> days to {label}
      </span>
    );
  }

  const units = [
    { value: days, label: "Days" },
    { value: hours, label: "Hours" },
    { value: minutes, label: "Mins" },
    { value: seconds, label: "Secs" },
  ];

  return (
    <div className={`animate-reveal ${className}`} role="timer" aria-label={`${days} days to ${label}`}>
      <p
        className={`text-[11px] font-bold uppercase tracking-[0.16em] ${
          tone === "dark" ? "text-white/60" : "text-muted"
        }`}
      >
        Countdown to {label}
      </p>
      <div className="mt-2.5 flex gap-2">
        {units.map((u) => (
          <div
            key={u.label}
            className={`min-w-[60px] rounded-xl px-2.5 py-2 text-center ${
              tone === "dark" ? "bg-white/10 ring-1 ring-white/15" : "border border-line bg-white shadow-chip"
            }`}
          >
            {/* Keyed on the value so each change replays the small rise. */}
            <span
              key={u.value}
              className={`block font-display text-2xl font-extrabold tabular-nums leading-none animate-slideUp ${
                tone === "dark" ? "text-white" : "text-charcoal"
              }`}
            >
              {String(u.value).padStart(2, "0")}
            </span>
            <span
              className={`mt-1 block text-[10px] font-semibold uppercase tracking-wide ${
                tone === "dark" ? "text-white/55" : "text-muted"
              }`}
            >
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Midnight IST on the given YYYY-MM-DD, as epoch ms; null if blank/invalid. */
function parseDate(iso: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso ?? "")) return null;
  const ms = Date.parse(`${iso}T00:00:00+05:30`);
  return Number.isFinite(ms) ? ms : null;
}
