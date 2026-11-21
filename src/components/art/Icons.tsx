import LineArt from "./LineArt";
import { draw, pop } from "./helpers";

/*
 * Animated line icons. Each draws itself when it scrolls into view, then keeps
 * one small looping motion. Stroke colour is `currentColor`, so the parent
 * decides it (red on light tiles, white on hover, etc.).
 *
 * Chosen by POSITION with a wrap-around fallback, because the text they sit
 * beside is admin-editable and may be reworded or reordered.
 */

const S = { stroke: "currentColor", strokeWidth: 2.2 } as const;

// --- Why Choose Acumen (six cards) ---------------------------------------

const WHY = [
  // Proven results: a trophy, with a twinkling star.
  <>
    <path d="M15 9h18v10a9 9 0 01-18 0V9z" {...S} {...draw(0)} />
    <path d="M15 12h-4a4 4 0 004 7M33 12h4a4 4 0 01-4 7" {...S} {...draw(0.3)} />
    <path d="M24 28v7M17 40h14M19 35h10" {...S} {...draw(0.5)} />
    <g className="la-loop animate-pulse">
      <path d="M38 3l1.3 3L42 7.5l-2.7 1.2L38 12l-1.3-3.3L34 7.5l2.7-1.5z" fill="currentColor" {...pop(0.9)} />
    </g>
  </>,
  // Mentors who know you: two people and a speech bubble.
  <>
    <circle cx="16" cy="18" r="5" {...S} {...draw(0)} />
    <path d="M7 38a9 9 0 0118 0" {...S} {...draw(0.25)} />
    <circle cx="31" cy="21" r="4" {...S} {...draw(0.35)} />
    <path d="M25 38a6.5 6.5 0 0113 0" {...S} {...draw(0.5)} />
    <g className="la-loop animate-bob">
      <path d="M31 3h11a2 2 0 012 2v6a2 2 0 01-2 2h-5l-3 3v-3h-3a2 2 0 01-2-2V5a2 2 0 012-2z" {...S} {...pop(0.8)} />
    </g>
  </>,
  // Always reachable: a phone that rings.
  <>
    <g className="la-loop animate-wiggle">
      <path
        d="M12 8h4.4l2.8 7.2-3.6 2.8a23 23 0 0010.8 10.8l2.8-3.6 7.2 2.8v4.4a4 4 0 01-4.4 4A33 33 0 018 12.4 4 4 0 0112 8z"
        {...S}
        {...draw(0)}
      />
    </g>
    <g className="la-loop animate-pulse">
      <path d="M30 5a13 13 0 0113 13" {...S} {...pop(0.7)} />
      <path d="M30 11a7 7 0 017 7" {...S} {...pop(0.85)} />
    </g>
  </>,
  // Around your university: a calendar being ticked.
  <>
    <rect x="7" y="10" width="34" height="31" rx="4" {...S} {...draw(0)} />
    <path d="M7 18h34M16 6v7M32 6v7" {...S} {...draw(0.3)} />
    <g className="la-loop animate-bob">
      <path d="M17 29l5 5 9-10" {...S} strokeWidth={2.8} {...draw(0.7)} />
    </g>
  </>,
  // Classrooms with library: an open book and a bookmark.
  <>
    <path d="M8 11a3 3 0 013-3h11v32H11a3 3 0 01-3-3V11z" {...S} {...draw(0)} />
    <path d="M40 11a3 3 0 00-3-3H26v32h11a3 3 0 003-3V11z" {...S} {...draw(0.2)} />
    <path d="M13 15h5M13 21h5M13 27h4" {...S} strokeWidth={1.8} {...draw(0.5)} />
    <g className="la-loop animate-bob">
      <path d="M31 8v12l3-2.5 3 2.5V8" {...S} fill="currentColor" fillOpacity={0.25} {...pop(0.8)} />
    </g>
  </>,
  // Real placement support: a briefcase and a rising arrow.
  <>
    <rect x="6" y="16" width="34" height="24" rx="4" {...S} {...draw(0)} />
    <path d="M17 16v-4a3 3 0 013-3h6a3 3 0 013 3v4" {...S} {...draw(0.25)} />
    <path d="M6 26h34" {...S} {...draw(0.45)} />
    <rect x="20" y="23" width="6" height="6" rx="1.5" fill="currentColor" {...pop(0.7)} />
    <g className="la-loop animate-bob">
      <path d="M36 4h7v7M43 4l-8 8" {...S} {...pop(0.9)} />
    </g>
  </>,
];

export function WhyIcon({ index, className = "h-9 w-9" }: { index: number; className?: string }) {
  return (
    <LineArt viewBox="0 0 48 48" className={className}>
      {WHY[index % WHY.length]}
    </LineArt>
  );
}

// --- Pedagogy checklist (nine points) ------------------------------------

const PEDAGOGY = [
  // 450+ hours of teaching: a clock with a sweeping hand.
  <>
    <circle cx="16" cy="16" r="12" {...S} {...draw(0)} />
    <path d="M16 9v7" {...S} {...draw(0.4)} />
    <g className="animate-spin-gear" style={{ transformOrigin: "16px 16px" }}>
      <path d="M16 16l6 3" {...S} stroke="#E31E24" {...pop(0.6)} />
    </g>
  </>,
  // App access: a phone with a play button.
  <>
    <rect x="9" y="3" width="14" height="26" rx="3" {...S} {...draw(0)} />
    <path d="M14 25h4" {...S} {...draw(0.3)} />
    <g className="la-loop animate-pulse">
      <path d="M14 11v8l6-4z" fill="#E31E24" {...pop(0.5)} />
    </g>
  </>,
  // Weekly assignments & tests: a sheet being ticked off.
  <>
    <path d="M8 4h12l5 5v19H8z" {...S} {...draw(0)} />
    <path d="M12 14h9M12 19h9M12 24h5" {...S} strokeWidth={1.8} {...draw(0.3)} />
    <g className="la-loop animate-bob">
      <path d="M21 22l3 3 5-6" stroke="#E31E24" strokeWidth={2.6} {...draw(0.6)} />
    </g>
  </>,
  // National test series: bars rising, with a trend line.
  <>
    <path d="M4 28h24" {...S} {...draw(0)} />
    <path d="M8 28v-7M14 28v-11M20 28v-15M26 28v-20" {...S} strokeWidth={3} {...draw(0.2)} />
    <g className="la-loop animate-pulse">
      <path d="M6 16l7-5 6 3 8-9" stroke="#E31E24" strokeWidth={2} {...draw(0.6)} />
    </g>
  </>,
  // Books in soft copy: a tablet showing a book.
  <>
    <rect x="5" y="4" width="22" height="24" rx="3" {...S} {...draw(0)} />
    <path d="M11 11h10M11 16h10M11 21h6" {...S} strokeWidth={1.8} {...draw(0.3)} />
    <g className="la-loop animate-bob">
      <circle cx="25" cy="25" r="4.5" fill="#E31E24" {...pop(0.6)} />
    </g>
  </>,
  // Mentoring sessions: two speech bubbles.
  <>
    <path d="M4 7a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3h-7l-5 4v-4a3 3 0 01-3-3z" {...S} {...draw(0)} />
    <g className="la-loop animate-bob">
      <path d="M26 13h1a3 3 0 013 3v6a3 3 0 01-3 3v3l-4-3h-6a3 3 0 01-3-2" stroke="#E31E24" strokeWidth={2.2} {...draw(0.5)} />
    </g>
  </>,
  // Post-GATE guidance: a signpost.
  <>
    <path d="M16 4v25M11 29h10" {...S} {...draw(0)} />
    <g className="la-loop animate-wiggle">
      <path d="M16 7h10l3 3-3 3H16z" stroke="#E31E24" strokeWidth={2.2} {...draw(0.3)} />
    </g>
    <path d="M16 15H7l-3 3 3 3h9" {...S} {...draw(0.5)} />
  </>,
  // Admission support: a graduation cap with a swinging tassel.
  <>
    <path d="M16 6L30 12 16 18 2 12z" {...S} {...draw(0)} />
    <path d="M8 15v6c0 2.5 3.6 4.5 8 4.5s8-2 8-4.5v-6" {...S} {...draw(0.3)} />
    <g className="animate-wiggle" style={{ transformOrigin: "28px 13px" }}>
      <path d="M28 13v8" stroke="#E31E24" strokeWidth={2} {...draw(0.6)} />
      <circle cx="28" cy="23" r="2" fill="#E31E24" {...pop(0.8)} />
    </g>
  </>,
  // Placement assistance: a handshake.
  <>
    <path d="M3 12l6-4 7 3 7-3 6 4" {...S} {...draw(0)} />
    <path d="M9 8v11l7 6 7-6V8" {...S} {...draw(0.3)} />
    <g className="la-loop animate-pulse">
      <path d="M12 17l4 3 4-3" stroke="#E31E24" strokeWidth={2.4} {...draw(0.6)} />
    </g>
  </>,
];

export function PedagogyIcon({ index, className = "h-7 w-7" }: { index: number; className?: string }) {
  return (
    <LineArt viewBox="0 0 32 32" className={className}>
      {PEDAGOGY[index % PEDAGOGY.length]}
    </LineArt>
  );
}

// --- Ecosystem timeline (three ventures) ---------------------------------

const ECOSYSTEM = [
  // Acumen Gate Academy: the cap.
  PEDAGOGY[7],
  // Acumen 360 (recruitment & HR): the handshake.
  PEDAGOGY[8],
  // Etude 360 (leadership training): steps rising to a flag.
  <>
    <path d="M3 28h7v-6h7v-6h7v-6h5" {...S} {...draw(0)} />
    <path d="M27 10V3" {...S} {...draw(0.4)} />
    <g className="la-loop animate-bob">
      <path d="M27 3h-6l2 2.5-2 2.5h6" fill="#E31E24" {...pop(0.7)} />
    </g>
  </>,
];

export function EcosystemIcon({ index, className = "h-8 w-8" }: { index: number; className?: string }) {
  return (
    <LineArt viewBox="0 0 32 32" className={className}>
      {ECOSYSTEM[index % ECOSYSTEM.length]}
    </LineArt>
  );
}
