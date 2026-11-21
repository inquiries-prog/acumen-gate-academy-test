import LineArt from "./LineArt";
import { draw, pop } from "./helpers";

/*
 * Larger animated line scenes. Same rules as Icons.tsx: strokes draw in on
 * scroll, accents pop in, then one gentle loop. Palette only (red, charcoal,
 * white). Original artwork - nothing here depicts a real brand or person.
 */

const RED = "#E31E24";
const INK = "#231F20";
const ink = { stroke: INK, strokeWidth: 3 } as const;
const red = { stroke: RED, strokeWidth: 3 } as const;

// --- Homepage course cards -----------------------------------------------

export function CourseScene({
  kind,
  className = "",
}: {
  kind: "classroom" | "online" | "gpsc";
  className?: string;
}) {
  return (
    <LineArt viewBox="0 0 240 150" className={className}>
      {kind === "classroom" ? <Classroom /> : kind === "online" ? <Online /> : <Gpsc />}
    </LineArt>
  );
}

/** A lecture board where a curve plots itself, with two students watching. */
function Classroom() {
  return (
    <>
      <rect x="40" y="16" width="160" height="84" rx="6" fill="#fff" {...ink} {...draw(0)} />
      <path d="M52 90h136M52 90V28" stroke={INK} strokeOpacity={0.3} strokeWidth={2} {...draw(0.35)} />
      <path d="M58 30h20M58 38h30" stroke={INK} strokeOpacity={0.4} strokeWidth={2.5} {...draw(0.45)} />
      <path d="M56 84c18-4 22-46 44-46s24 32 44 26 22-22 40-22" {...red} {...draw(0.65)} />
      <g className="la-loop animate-pulse">
        <circle cx="184" cy="42" r="5" fill={RED} {...pop(1.6)} />
      </g>
      <path d="M120 100v22M98 132l22-10 22 10" {...ink} {...draw(0.4)} />
      {[28, 212].map((x, i) => (
        <g key={x} {...pop(1 + i * 0.15)}>
          <circle cx={x} cy="116" r="8" fill="#fff" {...ink} />
          <path d={`M${x - 13} 142a13 13 0 0126 0`} {...ink} />
        </g>
      ))}
    </>
  );
}

/** A laptop streaming a live class: play button, LIVE badge, signal waves. */
function Online() {
  return (
    <>
      <rect x="52" y="18" width="136" height="88" rx="7" fill="#fff" {...ink} {...draw(0)} />
      <path d="M34 116h172l-12 14H46z" {...ink} {...draw(0.35)} />
      <g className="la-loop animate-pulse">
        <path d="M108 46v32l28-16z" fill={RED} {...pop(0.8)} />
      </g>
      <g {...pop(1)}>
        <rect x="146" y="28" width="34" height="14" rx="7" fill={RED} />
        <text x="163" y="38.5" textAnchor="middle" fontSize="9" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">
          LIVE
        </text>
      </g>
      <path d="M64 92h44M64 98h28" stroke={INK} strokeOpacity={0.3} strokeWidth={3} {...draw(0.6)} />
      <g className="la-loop animate-bob">
        <path d="M200 26a16 16 0 0120 0M194 18a26 26 0 0132 0" {...red} {...pop(1.2)} />
      </g>
      <g className="la-loop animate-bob" style={{ animationDelay: "-1.4s" }}>
        <path d="M14 46h22a4 4 0 014 4v10a4 4 0 01-4 4h-12l-6 5v-5a4 4 0 01-4-4V50a4 4 0 014-4z" fill="#fff" {...ink} strokeWidth={2.5} {...pop(1.35)} />
      </g>
    </>
  );
}

/** A columned government building with its flag flying. */
function Gpsc() {
  const cols = [78, 102, 126, 150];
  return (
    <>
      <path d="M58 58l62-34 62 34z" fill="#fff" {...ink} {...draw(0)} />
      <path d="M62 64h116" {...ink} {...draw(0.3)} />
      {cols.map((x, i) => (
        <path key={x} d={`M${x + 6} 68v48`} stroke={INK} strokeWidth={7} {...draw(0.4 + i * 0.1)} />
      ))}
      <path d="M56 124h128M48 134h144" {...ink} {...draw(0.8)} />
      <circle cx="120" cy="46" r="6" {...red} {...draw(0.6)} />
      <path d="M120 24V6" {...ink} strokeWidth={2.5} {...draw(0.9)} />
      <g className="la-loop animate-bob">
        <path d="M120 6h20l-5 5 5 5h-20" fill={RED} {...pop(1.2)} />
      </g>
    </>
  );
}

// --- Success celebration -------------------------------------------------

const CONFETTI = [
  { x: 14, y: 30, r: -20, c: RED },
  { x: 28, y: 12, r: 25, c: INK },
  { x: 92, y: 10, r: -35, c: RED },
  { x: 108, y: 28, r: 15, c: INK },
  { x: 8, y: 60, r: 40, c: INK },
  { x: 112, y: 58, r: -15, c: RED },
  { x: 46, y: 4, r: 10, c: RED },
  { x: 74, y: 2, r: -25, c: INK },
];

/**
 * A graduation cap tossed up with confetti - shown when a form is submitted.
 * Replaces the plain tick: the moment a student says yes deserves a little
 * celebration.
 */
export function Celebration({ className = "mx-auto mb-4 h-32 w-40" }: { className?: string }) {
  return (
    <LineArt viewBox="0 0 120 96" className={className}>
      {CONFETTI.map((c, i) => (
        // Rotation on the wrapper: the pop-in animates the rect's own CSS
        // transform, which would otherwise replace the SVG rotate().
        <g key={i} transform={`rotate(${c.r} ${c.x + 3} ${c.y + 1.5})`}>
          <rect x={c.x} y={c.y} width="6" height="3" rx="1" fill={c.c} {...pop(0.55 + i * 0.05)} />
        </g>
      ))}
      <g className="la-loop animate-bob">
        <path d="M60 22L98 37 60 52 22 37z" fill="#fff" {...ink} {...draw(0)} />
        <path d="M38 44v13c0 6 10 10 22 10s22-4 22-10V44" fill="#fff" {...ink} {...draw(0.25)} />
        <g className="animate-wiggle" style={{ transformOrigin: "94px 39px" }}>
          <path d="M94 39v18" {...red} {...draw(0.45)} />
          <circle cx="94" cy="60" r="3.5" fill={RED} {...pop(0.65)} />
        </g>
      </g>
    </LineArt>
  );
}

// --- Results page --------------------------------------------------------

/** A podium with a trophy on the top step, stars twinkling around it. */
export function ResultsPodium({ className = "" }: { className?: string }) {
  return (
    <LineArt viewBox="0 0 260 190" className={className} label="A trophy on a winners' podium">
      <circle cx="130" cy="96" r="84" fill={RED} fillOpacity={0.06} {...pop(0)} />
      <rect x="40" y="122" width="58" height="52" rx="4" fill="#fff" {...ink} {...draw(0.1)} />
      <rect x="101" y="100" width="58" height="74" rx="4" fill="#fff" {...ink} {...draw(0.25)} />
      <rect x="162" y="136" width="58" height="38" rx="4" fill="#fff" {...ink} {...draw(0.4)} />
      <g fontFamily="system-ui, sans-serif" fontWeight="800" textAnchor="middle">
        <text x="69" y="154" fontSize="20" fill={INK} {...pop(0.8)}>2</text>
        <text x="130" y="144" fontSize="26" fill={RED} {...pop(0.7)}>1</text>
        <text x="191" y="162" fontSize="18" fill={INK} {...pop(0.9)}>3</text>
      </g>
      <g className="la-loop animate-bob">
        <path d="M112 34h36v18a18 18 0 01-36 0V34z" fill="#fff" {...red} {...draw(0.6)} />
        <path d="M112 40h-8a8 8 0 008 14M148 40h8a8 8 0 01-8 14" {...red} {...draw(0.85)} />
        <path d="M130 70v14M118 92h24" {...red} {...draw(1)} />
      </g>
      {[
        [62, 70, 0],
        [196, 58, 0.5],
        [214, 104, 1],
        [46, 104, 1.5],
      ].map(([x, y, d], i) => (
        <g key={i} className="la-loop animate-pulse" style={{ animationDelay: `${d}s` }}>
          <path
            d={`M${x} ${y - 7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z`}
            fill={i % 2 ? INK : RED}
            {...pop(1.1 + i * 0.1)}
          />
        </g>
      ))}
    </LineArt>
  );
}

/** Empty state: an hourglass with sand running. */
export function Hourglass({ className = "mx-auto h-16 w-16" }: { className?: string }) {
  return (
    <LineArt viewBox="0 0 64 64" className={className}>
      <path d="M18 8h28M18 56h28" {...ink} {...draw(0)} />
      <path d="M21 8c0 14 22 14 22 24S21 42 21 56M43 8c0 14-22 14-22 24s22 10 22 24" {...ink} strokeWidth={2.5} {...draw(0.2)} />
      <path d="M26 50c2-3 10-3 12 0z" fill={RED} {...pop(0.7)} />
      <path d="M32 33v14" stroke={RED} strokeWidth={2} strokeDasharray="2 4" className="animate-dash-flow" />
      <path d="M26 16h12l-6 7z" fill={RED} fillOpacity={0.5} {...pop(0.6)} />
    </LineArt>
  );
}

// --- 404 -----------------------------------------------------------------

/** A bridge with its middle span missing, a little car stopped at the gap. */
export function BrokenBridge({ className = "" }: { className?: string }) {
  return (
    <LineArt viewBox="0 0 320 160" className={className} label="A bridge with a missing middle section">
      <path d="M10 104h120M190 104h120" {...ink} {...draw(0)} />
      {/* Arches end short of the gap, so the car sits on the open deck. */}
      <path d="M20 104C42 70 78 70 100 104" {...red} {...draw(0.3)} />
      <path d="M220 104C242 70 278 70 300 104" {...red} {...draw(0.45)} />
      {[36, 52, 68, 84, 236, 252, 268, 284].map((x, i) => {
        const t = x < 160 ? (x - 20) / 80 : (x - 220) / 80;
        const y = 104 - Math.sin(t * Math.PI) * 22;
        return <path key={x} d={`M${x} 104V${y.toFixed(1)}`} stroke={INK} strokeOpacity={0.5} strokeWidth={2} {...draw(0.6 + i * 0.04)} />;
      })}
      <path d="M130 104l6 8-4 6M190 104l-5 9 4 5" {...ink} strokeWidth={2.5} {...draw(0.9)} />
      <path d="M10 104v30M310 104v30" {...ink} {...draw(0.2)} />
      <path
        d="M0 146c20-6 40 6 60 0s40-6 60 0 40 6 60 0 40-6 60 0 40 6 60 0 20-4 20-4"
        stroke={RED}
        strokeOpacity={0.45}
        strokeWidth={2.5}
        strokeDasharray="10 8"
        className="animate-dash-flow"
      />
      <g className="la-loop animate-bob">
        <g {...pop(1.1)}>
          <rect x="102" y="88" width="28" height="11" rx="4" fill={RED} />
          <path d="M107 88l4-7h10l4 7" fill="#fff" stroke={INK} strokeWidth={2} />
          <circle cx="108" cy="100" r="3.5" fill={INK} />
          <circle cx="124" cy="100" r="3.5" fill={INK} />
        </g>
      </g>
      <g className="la-loop animate-pulse">
        <text x="160" y="70" textAnchor="middle" fontSize="34" fontWeight="800" fill={RED} fontFamily="system-ui, sans-serif" {...pop(1.3)}>
          ?
        </text>
      </g>
    </LineArt>
  );
}

// --- About: our centers ----------------------------------------------------

/**
 * Two map pins joined by a winding road with a dot travelling along it - the
 * head office and the weekend centre. Deliberately not a map of Gujarat: a
 * hand-drawn state outline that is slightly wrong would look worse than none.
 */
export function CentersRoute({ from, to, className = "" }: { from: string; to: string; className?: string }) {
  const road = "M110 92C200 30 300 130 400 70S520 50 560 70";
  return (
    <LineArt viewBox="0 0 640 140" className={className} label={`${from} and ${to} centers`}>
      <path d={road} stroke={INK} strokeOpacity={0.12} strokeWidth={14} {...draw(0)} />
      <path d={road} stroke={RED} strokeWidth={3} strokeDasharray="2 14" className="animate-dash-flow" />
      {[
        { x: 90, y: 92, label: from, d: 0.6 },
        { x: 560, y: 70, label: to, d: 0.9 },
      ].map((pin) => (
        <g key={pin.label}>
          <g className="la-loop animate-bob">
            <path
              d={`M${pin.x} ${pin.y}c-12-14-18-22-18-30a18 18 0 0136 0c0 8-6 16-18 30z`}
              fill={RED}
              {...pop(pin.d)}
            />
            <circle cx={pin.x} cy={pin.y - 30} r="6" fill="#fff" {...pop(pin.d + 0.1)} />
          </g>
          <text
            x={pin.x}
            y={pin.y + 28}
            textAnchor="middle"
            fontSize="17"
            fontWeight="700"
            fill={INK}
            fontFamily="system-ui, sans-serif"
            {...pop(pin.d + 0.2)}
          >
            {pin.label}
          </text>
        </g>
      ))}
    </LineArt>
  );
}

// --- Homepage hero -----------------------------------------------------------

/**
 * A rank graph for the hero card's dark header: the line climbs and lands on
 * a star. White on charcoal. Ranks shown elsewhere are the real ones; this is
 * a shape, not data, so it carries no numbers.
 */
export function RankClimb({ className = "" }: { className?: string }) {
  return (
    <LineArt viewBox="0 0 160 64" className={className}>
      <path d="M6 58h148" stroke="#fff" strokeOpacity={0.15} strokeWidth={2} {...draw(0)} />
      <path d="M8 52l26-8 20 6 24-18 20 6 26-22 24-6" stroke="#fff" strokeOpacity={0.9} strokeWidth={3} {...draw(0.3)} />
      {[
        [34, 44],
        [78, 32],
        [124, 16],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill="#fff" {...pop(0.8 + i * 0.15)} />
      ))}
      <g className="la-loop animate-pulse">
        <path d="M148 2l3 6.5 7 1-5 5 1.2 7L148 18l-6.2 3.5 1.2-7-5-5 7-1z" fill={RED} {...pop(1.4)} />
      </g>
    </LineArt>
  );
}
