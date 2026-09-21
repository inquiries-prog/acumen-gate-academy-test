import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";

/**
 * Stat line (SRS 7.1.3).
 *
 * "10,000+ GATE Success Stories and Counting." is the ONLY headline number used
 * anywhere on this site. Do not add a second total here or elsewhere - earlier
 * drafts had internally inconsistent figures and they were deliberately removed.
 * Number consistency is a hard requirement, and an SEO/GEO integrity issue too
 * (SRS 13).
 *
 * The number is split from the words so the figure can carry real typographic
 * weight, while the sentence stays exactly as written.
 */
export default function StatBand({ statLine }: { statLine: string }) {
  if (!statLine.trim()) return null;

  // Split on the first space: "10,000+" and the rest of the sentence.
  const [figure, ...rest] = statLine.trim().split(" ");
  const remainder = rest.join(" ");

  return (
    <section className="relative overflow-hidden border-y border-line bg-offwhite">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_120%_at_50%_0%,rgba(227,30,36,0.07),transparent_70%)]"
      />
      <div className="container-site relative py-10 md:py-16">
        {/* `group/stat`: the shine below starts only once this has revealed,
            otherwise it would have played long before anyone scrolled here. */}
        <Reveal as="p" variant="pop" className="group/stat mx-auto flex max-w-4xl flex-col items-center gap-x-4 gap-y-1 text-center sm:flex-row sm:justify-center sm:text-left">
          {/* Counts up on first view; ends on the admin's exact text. */}
          <span className="relative inline-block overflow-hidden px-1">
            <CountUp
              value={figure}
              className="bg-red-sheen bg-clip-text font-display text-5xl font-extrabold leading-none tracking-tight text-transparent sm:text-6xl md:text-7xl"
            />
            {/* One light sweep across the figure after the count settles. Fills
                forward to its off-screen end state, so under reduced motion
                (duration zeroed) it is simply never visible. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent mix-blend-overlay group-[.opacity-100]/stat:animate-shine"
            />
          </span>
          {remainder && (
            <span className="max-w-md font-display text-xl font-bold leading-tight text-charcoal sm:text-2xl md:text-[1.75rem]">
              {remainder}
            </span>
          )}
        </Reveal>
      </div>
    </section>
  );
}
