import Image from "next/image";

/*
 * The client's success posts are square graphics with the student's photo in
 * a circle on the left. This shows just that circle, as a round portrait, by
 * enlarging the post inside a round window - so every result on the page has
 * a real face without anyone cutting photos by hand.
 *
 * Measured from the posts (all share one template): the photo circle is
 * centred at 28.6% / 48.8% of the post with a diameter of ~46%. A slightly
 * smaller window (41%) keeps the post's red ring out of frame.
 */
const CX = 0.286;
const CY = 0.488;
const D = 0.41;

const box = {
  width: `${100 / D}%`,
  height: `${100 / D}%`,
  left: `${(-(CX - D / 2) / D) * 100}%`,
  top: `${(-(CY - D / 2) / D) * 100}%`,
};

export default function FaceCrop({
  src,
  alt,
  size,
  className = "",
  priority = false,
  isPost = true,
}: {
  src: string;
  alt: string;
  /** Rendered diameter in CSS px - used to request a sensibly sized image. */
  size: number;
  className?: string;
  priority?: boolean;
  /** False for a plain portrait: fill the circle, favouring the top (faces). */
  isPost?: boolean;
}) {
  // No photo yet: the student's initials, so a card never shows a blank disc.
  if (!src) {
    const initials = alt
      .split(",")[0]
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
    return (
      <span className={`relative grid aspect-square place-items-center overflow-hidden rounded-full bg-red/[0.08] ${className}`}>
        <span className="font-display text-[clamp(14px,30%,40px)] font-extrabold text-red" aria-label={alt}>
          {initials || "A"}
        </span>
      </span>
    );
  }
  if (!isPost) {
    return (
      <span className={`relative block aspect-square overflow-hidden rounded-full bg-offwhite ${className}`}>
        {src && (
          <Image src={src} alt={alt} fill priority={priority} sizes={`${Math.ceil(size * 2)}px`} className="object-cover object-[50%_22%]" />
        )}
      </span>
    );
  }
  return (
    <span className={`relative block aspect-square overflow-hidden rounded-full bg-offwhite ${className}`}>
      {src && (
        <span className="absolute" style={box}>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={`${Math.ceil(size / D)}px`}
            className="object-cover"
          />
        </span>
      )}
    </span>
  );
}
