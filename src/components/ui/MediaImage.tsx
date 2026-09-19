import Image from "next/image";

interface MediaImageProps {
  src: string;
  alt: string;
  /** Shown in place of the image while the client hasn't uploaded one yet. */
  placeholderLabel?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Rendered inside a parent that already sets aspect ratio / height. */
  fill?: boolean;
  width?: number;
  height?: number;
}

/**
 * Every image slot on this site is admin-uploadable, so at any moment a slot
 * may legitimately be empty. Rather than a broken image, an empty slot renders
 * a labelled placeholder - which doubles as an obvious "upload me" cue for the
 * client while assets are still pending (SRS 12).
 *
 * Images below the fold lazy-load by default (SRS 3.5).
 */
export default function MediaImage({
  src,
  alt,
  placeholderLabel = "Photo",
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  fill = true,
  width,
  height,
}: MediaImageProps) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-offwhite to-line/40 ${fill ? "absolute inset-0" : ""} ${className}`}
        role="img"
        aria-label={alt || placeholderLabel}
      >
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              stroke="#767671"
              strokeWidth="1.5"
            />
            <circle cx="8.5" cy="9.5" r="1.5" fill="#767671" />
            <path
              d="M4 17l4.5-4.5 3 3L15 12l5 5"
              stroke="#767671"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {placeholderLabel}
          </span>
        </div>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 300}
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className={className}
    />
  );
}
