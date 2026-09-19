/**
 * The small red dot in an eyebrow, with a soft ping behind it.
 *
 * One component so the hero and every section heading pulse the same way.
 * Purely decorative; the global reduced-motion rule stops the ping.
 */
export default function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red opacity-70" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red" />
    </span>
  );
}
