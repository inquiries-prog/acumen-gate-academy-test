/**
 * Original, animated line artwork for each course - the visual identity of a
 * branch wherever it appears (course cards, course page heroes, the header
 * menu). Drawn in the palette only: red, charcoal, and white.
 *
 * Pure SVG with CSS animations, so it renders on the server, costs no image
 * download, stays sharp at any size, and freezes under reduced motion via the
 * global rule. An uploaded course photo (admin) takes precedence on cards;
 * this is what shows until then, and on the course page hero always.
 */

type Tone = "light" | "dark";

const RED = "#E31E24";

export default function BranchArt({
  code,
  tone = "light",
  className = "",
  animated = true,
}: {
  /** Branch code (ME, CE, CSE, EE, EC, CH) or "GPSC". */
  code: string;
  tone?: Tone;
  className?: string;
  animated?: boolean;
}) {
  const ink = tone === "dark" ? "#FFFFFF" : "#231F20";
  const soft = tone === "dark" ? "rgba(255,255,255,0.14)" : "rgba(35,31,32,0.08)";
  const a = (cls: string) => (animated ? cls : "");
  const props = { ink, soft, a };

  return (
    <svg
      viewBox="0 0 240 180"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Shared backdrop: a soft halo and a dotted orbit. */}
      <circle cx="120" cy="90" r="74" fill={RED} fillOpacity={tone === "dark" ? 0.16 : 0.06} />
      <circle cx="120" cy="90" r="84" stroke={soft} strokeDasharray="2 7" strokeLinecap="round" />
      <g style={{ transformOrigin: "120px 90px" }}>
        <circle
          cx="120"
          cy="90"
          r="3.5"
          fill={RED}
          className={a("animate-orbit")}
          style={{ transformOrigin: "120px 90px", ["--r" as string]: "84px" }}
        />
        <circle
          cx="120"
          cy="90"
          r="2.5"
          fill={ink}
          fillOpacity={0.5}
          className={a("animate-orbit-slow")}
          style={{ transformOrigin: "120px 90px", ["--r" as string]: "84px" }}
        />
      </g>
      {renderArt(code.toUpperCase(), props)}
    </svg>
  );
}

interface ArtProps {
  ink: string;
  soft: string;
  a: (cls: string) => string;
}

function renderArt(code: string, p: ArtProps) {
  switch (code) {
    case "ME":
      return <Mechanical {...p} />;
    case "CE":
      return <Civil {...p} />;
    case "CSE":
    case "CS":
      return <Computer {...p} />;
    case "EE":
      return <Electrical {...p} />;
    case "EC":
      return <Electronics {...p} />;
    case "CH":
      return <Chemical {...p} />;
    default:
      return <Government {...p} />;
  }
}

/** Outline of a gear with `teeth` teeth, as an SVG path. */
function gearPath(cx: number, cy: number, r: number, teeth: number, depth = 7): string {
  const steps = teeth * 4;
  const pts: string[] = [];
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const outer = i % 4 === 1 || i % 4 === 2;
    const radius = outer ? r + depth : r;
    pts.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

function Mechanical({ ink, a }: ArtProps) {
  return (
    <>
      <g className={a("animate-spin-gear")} style={{ transformOrigin: "98px 92px" }}>
        <path d={gearPath(98, 92, 34, 12)} stroke={ink} strokeWidth="3" strokeLinejoin="round" fill="#fff" fillOpacity={0.9} />
        <circle cx="98" cy="92" r="11" stroke={RED} strokeWidth="3" />
        <path d="M98 66v15M98 103v15M72 92h15M109 92h15" stroke={ink} strokeOpacity={0.35} strokeWidth="2" strokeLinecap="round" />
      </g>
      <g className={a("animate-spin-gear-reverse")} style={{ transformOrigin: "156px 66px" }}>
        <path d={gearPath(156, 66, 20, 8, 6)} stroke={RED} strokeWidth="3" strokeLinejoin="round" fill="#fff" fillOpacity={0.9} />
        <circle cx="156" cy="66" r="6" fill={RED} />
      </g>
      <path d="M140 132h48M146 132v-16h36v16" stroke={ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M152 116l6-10h12l6 10"
        stroke={RED}
        strokeWidth="2.5"
        strokeLinejoin="round"
        className={a("animate-bob")}
      />
    </>
  );
}

function Civil({ ink, a }: ArtProps) {
  return (
    <>
      <path d="M36 122h168" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M48 122C78 66 162 66 192 122"
        stroke={RED}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="300"
        className={a("animate-draw-loop")}
      />
      {[66, 84, 102, 120, 138, 156, 174].map((x) => {
        const t = (x - 48) / 144;
        // The arch (a cubic from 48 to 192 with both controls at y=66) peaks at
        // y=80; a parabola with the same peak keeps each hanger under it.
        const y = 122 - 4 * 42 * t * (1 - t) + 2;
        return <path key={x} d={`M${x} 122V${y.toFixed(1)}`} stroke={ink} strokeOpacity={0.55} strokeWidth="2" strokeLinecap="round" />;
      })}
      <path d="M40 122v18M200 122v18M30 140h20M190 140h20" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M28 150h184"
        stroke={RED}
        strokeOpacity={0.6}
        strokeWidth="2.5"
        strokeDasharray="10 10"
        strokeLinecap="round"
        className={a("animate-dash-flow")}
      />
    </>
  );
}

function Computer({ ink, a }: ArtProps) {
  return (
    <>
      <rect x="56" y="44" width="128" height="92" rx="10" stroke={ink} strokeWidth="3" fill="#fff" fillOpacity={0.92} />
      <path d="M56 60h128" stroke={ink} strokeWidth="2.5" />
      <circle cx="67" cy="52" r="2.5" fill={RED} />
      <circle cx="76" cy="52" r="2.5" fill={ink} fillOpacity={0.4} />
      <circle cx="85" cy="52" r="2.5" fill={ink} fillOpacity={0.4} />
      <path d="M96 82l-14 14 14 14M144 82l14 14-14 14" stroke={RED} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M128 78l-16 36" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
      <rect x="116" y="120" width="10" height="3" rx="1.5" fill={RED} className={a("animate-pulse")} />
      <g className={a("animate-bob")} fill={ink} fillOpacity={0.45} fontFamily="monospace" fontSize="10" fontWeight="700">
        <text x="190" y="58">1</text>
        <text x="196" y="76">0</text>
        <text x="34" y="128">1</text>
        <text x="40" y="146">0</text>
      </g>
    </>
  );
}

function Electrical({ ink, a }: ArtProps) {
  return (
    <>
      <path d="M92 146l20-104h16l20 104M100 104h40M96 124h48M106 72h28" stroke={ink} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M112 42l-26 14M128 42l26 14M86 56h68" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M30 96c12-22 24-22 36 0s24 22 36 0"
        stroke={RED}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 8"
        className={a("animate-dash-flow")}
      />
      <path
        d="M138 96c12-22 24-22 36 0s24 22 36 0"
        stroke={RED}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="6 8"
        className={a("animate-dash-flow")}
      />
      <path d="M176 40l-12 22h12l-10 22" stroke={RED} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={a("animate-pulse")} />
    </>
  );
}

function Electronics({ ink, a }: ArtProps) {
  const pins = [70, 84, 98, 112];
  return (
    <>
      <rect x="88" y="58" width="64" height="64" rx="8" stroke={ink} strokeWidth="3" fill="#fff" fillOpacity={0.92} />
      <rect x="104" y="74" width="32" height="32" rx="4" fill={RED} fillOpacity={0.12} stroke={RED} strokeWidth="2.5" />
      {pins.map((y) => (
        <g key={y}>
          <path d={`M88 ${y - 4}H60`} stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M152 ${y - 4}H180`} stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
      <path
        d="M60 66H40v-20M180 94h22v32"
        stroke={RED}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="5 7"
        className={a("animate-dash-flow")}
      />
      <g className={a("animate-bob")} stroke={RED} strokeWidth="2.5" strokeLinecap="round">
        <path d="M170 40a14 14 0 0118 0" />
        <path d="M164 32a24 24 0 0130 0" strokeOpacity={0.55} />
      </g>
      <circle cx="179" cy="48" r="3" fill={RED} />
    </>
  );
}

function Chemical({ ink, a }: ArtProps) {
  return (
    <>
      <path
        d="M106 42h28M110 42v34l-30 54a8 8 0 007 12h66a8 8 0 007-12l-30-54V42"
        stroke={ink}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="#fff"
        fillOpacity={0.92}
      />
      <path d="M90 118h60l10 18a4 4 0 01-3.5 6h-73a4 4 0 01-3.5-6z" fill={RED} fillOpacity={0.16} />
      <path d="M90 118c10-6 20 6 30 0s20-6 30 0" stroke={RED} strokeWidth="2.5" strokeLinecap="round" />
      <g className={a("animate-bob")}>
        <circle cx="112" cy="104" r="4" stroke={RED} strokeWidth="2" />
        <circle cx="126" cy="92" r="3" stroke={RED} strokeWidth="2" />
        <circle cx="120" cy="80" r="2" fill={RED} />
      </g>
      <g stroke={ink} strokeWidth="2.5">
        <path d="M172 60l16-10M188 50l14 10M188 50V34" strokeOpacity={0.6} />
        <circle cx="172" cy="60" r="5" fill="#fff" />
        <circle cx="188" cy="50" r="6" fill={RED} stroke={RED} />
        <circle cx="202" cy="60" r="5" fill="#fff" />
        <circle cx="188" cy="34" r="4" fill="#fff" />
      </g>
    </>
  );
}

function Government({ ink, a }: ArtProps) {
  return (
    <>
      <path d="M64 70l56-30 56 30z" stroke={ink} strokeWidth="3" strokeLinejoin="round" fill="#fff" fillOpacity={0.92} />
      <path d="M60 140h120M68 130h104" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      {[80, 102, 124, 146].map((x) => (
        <path key={x} d={`M${x + 7} 78v48`} stroke={ink} strokeWidth="5" strokeLinecap="round" />
      ))}
      <path d="M70 76h100" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 40V22" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M120 22h18l-5 5 5 5h-18" fill={RED} className={a("animate-bob")} />
      <circle cx="120" cy="58" r="5" stroke={RED} strokeWidth="2.5" />
    </>
  );
}
