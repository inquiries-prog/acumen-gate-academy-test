/**
 * Ambient red glow that drifts continuously behind a surface.
 *
 * Built to be cheap enough to leave running, because SRS 3.5 rules out
 * animation that hurts perceived speed:
 *   - each blob is a soft radial gradient, NOT a blur-filtered box, so the
 *     browser rasterises it once;
 *   - only `transform` and `opacity` animate, which the compositor handles
 *     without repainting;
 *   - `will-change` is deliberately NOT set. These are large elements, and
 *     pinning a permanent GPU layer for each one costs more memory on a
 *     mid-range Android than it saves. Browsers already promote an element
 *     while its transform is animating;
 *   - the third blob is desktop-only and the two others are smaller on phones,
 *     so a phone composites two modest layers instead of three large ones;
 *   - the global prefers-reduced-motion rule in globals.css freezes all of it.
 *
 * Purely decorative, so it is hidden from assistive technology and never
 * intercepts pointer events.
 *
 * Colour is the palette red at low alpha (SRS 3.1) - on light grounds it reads
 * as a warm wash, on charcoal as a slow ember.
 */
export default function AmbientGlow({
  tone = "light",
  fadeBottom = false,
  className = "",
}: {
  /** "light" for white/off-white sections, "dark" for charcoal grounds. */
  tone?: "light" | "dark";
  /**
   * Dissolves the glow before the bottom edge. Use it whenever the section
   * below is the same colour, so the two read as one continuous surface with
   * no visible seam where the lighting stops.
   */
  fadeBottom?: boolean;
  className?: string;
}) {
  const alpha = tone === "dark" ? [0.3, 0.22, 0.16] : [0.13, 0.1, 0.07];
  const fade = fadeBottom
    ? "[mask-image:linear-gradient(to_bottom,#000_0%,#000_45%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_45%,transparent_92%)]"
    : "";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${fade} ${className}`}
    >
      <span
        className="absolute -left-[20%] -top-[25%] h-[24rem] w-[24rem] animate-glow-a rounded-full sm:h-[38rem] sm:w-[38rem] lg:h-[45rem] lg:w-[45rem]"
        style={{
          background: `radial-gradient(circle, rgba(227,30,36,${alpha[0]}) 0%, rgba(227,30,36,0) 68%)`,
        }}
      />
      <span
        className="absolute -right-[22%] top-[8%] h-[22rem] w-[22rem] animate-glow-b rounded-full sm:h-[34rem] sm:w-[34rem] lg:h-[40rem] lg:w-[40rem]"
        style={{
          background: `radial-gradient(circle, rgba(227,30,36,${alpha[1]}) 0%, rgba(227,30,36,0) 66%)`,
        }}
      />
      {/* Third blob is desktop-only - see the note about layer count above. */}
      <span
        className="absolute -bottom-[30%] left-[25%] hidden h-[38rem] w-[38rem] animate-glow-c rounded-full md:block"
        style={{
          background: `radial-gradient(circle, rgba(227,30,36,${alpha[2]}) 0%, rgba(227,30,36,0) 70%)`,
        }}
      />
    </div>
  );
}
