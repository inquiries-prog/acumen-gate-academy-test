import Image from "next/image";
import LineArt from "@/components/art/LineArt";
import { draw, pop } from "@/components/art/helpers";
import type { NewsCategory } from "@/lib/types";

const RED = "#E31E24";
const INK = "#231F20";
const ink = { stroke: INK, strokeWidth: 3 } as const;
const red = { stroke: RED, strokeWidth: 3 } as const;

/**
 * A post's cover: the uploaded cover image if there is one, otherwise an
 * animated line illustration for its category on a warm gradient - so every
 * card in the magazine has a picture, and each category is recognisable at a
 * glance.
 */
export default function NewsCover({
  category,
  coverUrl,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
}: {
  category: NewsCategory;
  coverUrl?: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  if (coverUrl) {
    return (
      <div className={`relative overflow-hidden bg-offwhite ${className}`}>
        <Image src={coverUrl} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`relative overflow-hidden bg-gradient-to-br ${BG[category]} ${className}`}
    >
      <div aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red/[0.08]" />
      <div aria-hidden="true" className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-charcoal/[0.04]" />
      <LineArt viewBox="0 0 240 150" className="absolute inset-0 m-auto h-[86%] w-[86%]">
        {SCENES[category]}
      </LineArt>
    </div>
  );
}

const BG: Record<NewsCategory, string> = {
  gate: "from-offwhite via-white to-red/[0.08]",
  psu: "from-white via-offwhite to-charcoal/[0.06]",
  results: "from-red/[0.07] via-white to-offwhite",
  acumen: "from-offwhite via-red/[0.05] to-white",
};

const SCENES: Record<NewsCategory, React.ReactNode> = {
  // GATE exam: an answer sheet being filled in, with a clock.
  gate: (
    <>
      <path d="M70 18h76l20 20v100H70z" fill="#fff" {...ink} {...draw(0)} />
      <path d="M146 18v20h20" {...ink} {...draw(0.3)} />
      {[52, 72, 92, 112].map((y, i) => (
        <g key={y}>
          <circle cx="88" cy={y} r="5" {...ink} strokeWidth={2.5} {...draw(0.4 + i * 0.1)} />
          <path d={`M102 ${y}h44`} stroke={INK} strokeOpacity={0.3} strokeWidth={3} {...draw(0.5 + i * 0.1)} />
        </g>
      ))}
      <g className="la-loop animate-pulse">
        <circle cx="88" cy="72" r="3" fill={RED} {...pop(1.1)} />
        <circle cx="88" cy="112" r="3" fill={RED} {...pop(1.25)} />
      </g>
      <circle cx="190" cy="104" r="22" fill="#fff" {...red} {...draw(0.6)} />
      <g className="animate-spin-gear" style={{ transformOrigin: "190px 104px" }}>
        <path d="M190 104v-14" {...red} strokeWidth={2.5} {...pop(1)} />
      </g>
      <path d="M190 104l9 5" {...ink} strokeWidth={2.5} {...draw(1)} />
    </>
  ),
  // PSU & jobs: an industrial plant with a briefcase.
  psu: (
    <>
      <path d="M30 132h180" {...ink} {...draw(0)} />
      <path d="M44 132V82l30 16V82l30 16V58h30v74" fill="#fff" {...ink} {...draw(0.2)} />
      <path d="M142 132V40h14v92M162 132V56h14v76" fill="#fff" {...ink} {...draw(0.45)} />
      <g className="la-loop animate-bob">
        <path d="M146 30c4-8 14-4 10-12M166 46c4-8 14-4 10-12" stroke={INK} strokeOpacity={0.35} strokeWidth={2.5} {...pop(1)} />
      </g>
      <g className="la-loop animate-bob" style={{ animationDelay: "-1.2s" }}>
        <rect x="186" y="94" width="38" height="28" rx="4" fill={RED} {...pop(1.2)} />
        <path d="M197 94v-5a3 3 0 013-3h10a3 3 0 013 3v5" stroke={RED} strokeWidth={3} fill="none" {...pop(1.2)} />
      </g>
      {[56, 86, 116].map((x, i) => (
        <rect key={x} x={x} y="110" width="10" height="10" rx="1.5" fill={RED} fillOpacity={0.7} {...pop(0.9 + i * 0.1)} />
      ))}
    </>
  ),
  // Results: a trophy with a rising rank line.
  results: (
    <>
      <path d="M40 120l30-18 26 8 30-26 26 6 30-30" {...red} {...draw(0.2)} />
      <circle cx="182" cy="60" r="5" fill={RED} {...pop(1)} />
      <g className="la-loop animate-bob">
        <path d="M98 26h44v24a22 22 0 01-44 0V26z" fill="#fff" {...ink} {...draw(0.4)} />
        <path d="M98 32h-10a10 10 0 0010 16M142 32h10a10 10 0 01-10 16" {...ink} {...draw(0.6)} />
        <path d="M120 72v14M104 96h32M108 86h24" {...ink} {...draw(0.8)} />
      </g>
      {[
        [70, 34],
        [172, 26],
        [196, 92],
      ].map(([x, y], i) => (
        <g key={i} className="la-loop animate-pulse" style={{ animationDelay: `${i * 0.5}s` }}>
          <path d={`M${x} ${y - 6}l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z`} fill={i % 2 ? INK : RED} {...pop(1.1 + i * 0.1)} />
        </g>
      ))}
    </>
  ),
  // Acumen news: a graduation cap and a lit bulb.
  acumen: (
    <>
      <path d="M84 56l48-22 48 22-48 22z" fill="#fff" {...ink} {...draw(0)} />
      <path d="M102 66v22c0 8 14 14 30 14s30-6 30-14V66" fill="#fff" {...ink} {...draw(0.3)} />
      <g className="animate-wiggle" style={{ transformOrigin: "174px 60px" }}>
        <path d="M174 60v26" {...red} {...draw(0.6)} />
        <circle cx="174" cy="90" r="4" fill={RED} {...pop(0.8)} />
      </g>
      <g className="la-loop animate-pulse">
        <circle cx="52" cy="66" r="16" fill="#fff" {...red} {...draw(0.5)} />
        <path d="M46 84h12M48 90h8" {...ink} strokeWidth={2.5} {...draw(0.8)} />
        <path d="M52 40v-8M30 50l-6-6M74 50l6-6" {...red} strokeWidth={2.5} {...pop(1)} />
      </g>
    </>
  ),
};
