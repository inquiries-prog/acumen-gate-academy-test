import type { CSSProperties } from "react";

/**
 * The success moment: a circle pops in, the tick draws itself on, and a brief
 * burst of particles marks that it worked.
 *
 * CSS only. Each particle is a rotated wrapper (sets its direction) around a
 * dot that animates along X and fades - transform and opacity, nothing that
 * lays out. Colours are the three palette solids. Under reduced motion every
 * animation collapses to its end state: particles land at opacity 0 (gone),
 * the circle at full size, the tick fully drawn - so the result is a plain,
 * static confirmation rather than nothing.
 */

const PARTICLE_COLOURS = ["#E31E24", "#A32D2D", "#231F20"] as const;

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  // Twelve directions with a little jitter so it doesn't read as a clock face.
  angle: i * 30 + ((i * 7) % 11) - 5,
  dist: 44 + ((i * 5) % 17),
  colour: PARTICLE_COLOURS[i % PARTICLE_COLOURS.length],
}));

export default function SuccessBurst({
  variant = "check",
}: {
  variant?: "check" | "gift";
}) {
  return (
    <div className="relative mx-auto mb-4 h-14 w-14" aria-hidden="true">
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="pointer-events-none absolute left-1/2 top-1/2 -ml-[3px] -mt-[3px] h-1.5 w-1.5"
          style={{ transform: `rotate(${p.angle}deg)` }}
        >
          <span
            className="block h-1.5 w-1.5 rounded-[2px] animate-burst"
            style={
              {
                "--dist": `${p.dist}px`,
                backgroundColor: p.colour,
                animationDelay: `${200 + i * 12}ms`,
              } as CSSProperties
            }
          />
        </span>
      ))}

      <span className="relative grid h-14 w-14 place-items-center rounded-full bg-red/10 animate-pop">
        {variant === "check" ? (
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path
              d="M17 29l8 8 15-16"
              stroke="#E31E24"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="36"
              strokeDashoffset="36"
              className="animate-draw-check"
            />
          </svg>
        ) : (
          <span className="text-2xl">🎁</span>
        )}
      </span>
    </div>
  );
}
