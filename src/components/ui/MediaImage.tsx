import Image from "next/image";
import { CourseScene } from "@/components/art/Scenes";

/**
 * A designed stand-in for an empty slot. `person` is a monogram tile built
 * from the name; `art` is branded artwork for a course card. Anything without
 * one of these falls back to the plain icon-and-label tile.
 */
export type Placeholder =
  | { kind: "person"; name: string }
  | { kind: "art"; icon: "classroom" | "online" | "gpsc" };

interface MediaImageProps {
  src: string;
  alt: string;
  /** Shown in place of the image while the client hasn't uploaded one yet. */
  placeholderLabel?: string;
  /** A designed placeholder instead of the generic one. */
  placeholder?: Placeholder;
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
 *
 * Empty slots for people and course cards use designed placeholders (a
 * monogram, or branded artwork) so the public site never shows a grey box.
 * They are still placeholders - an upload in admin replaces them - but a
 * visitor sees something intentional in the meantime.
 */
export default function MediaImage({
  src,
  alt,
  placeholderLabel = "Photo",
  placeholder,
  className = "",
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  fill = true,
  width,
  height,
}: MediaImageProps) {
  if (!src && placeholder) {
    return (
      <div
        className={`overflow-hidden ${fill ? "absolute inset-0" : ""} ${className}`}
        role="img"
        aria-label={alt || placeholderLabel}
      >
        <DesignedPlaceholder placeholder={placeholder} />
      </div>
    );
  }

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

/** First letters of the first two real words - "Dr. Umashankar Tripathi" -> "UT". */
export function initialsOf(name: string): string {
  const words = name
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    // Real words only: a "—" placeholder name yields nothing, and honorifics
    // are skipped so "Dr. Umashankar Tripathi" gives "UT", not "DU".
    .filter((w) => /^[A-Za-z]/.test(w) && !/^(dr|er|mr|mrs|ms|prof|shri|smt)$/i.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/* Light-ground grid: faint red lines instead of the white ones `.grid-texture`
   uses on charcoal. */
const GRID =
  "bg-[linear-gradient(to_right,rgba(227,30,36,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(227,30,36,0.07)_1px,transparent_1px)] bg-[size:28px_28px]";

function DesignedPlaceholder({ placeholder }: { placeholder: Placeholder }) {
  if (placeholder.kind === "person") {
    const initials = initialsOf(placeholder.name) || "A";
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-offwhite">
        <div aria-hidden="true" className={`absolute inset-0 ${GRID}`} />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_100%,rgba(227,30,36,0.14),transparent_70%)]"
        />
        {/* Shoulders: a soft charcoal arc rising from the bottom, so the tile
            reads as a portrait even before the photo arrives. */}
        <div
          aria-hidden="true"
          className="absolute -bottom-[38%] left-1/2 h-[80%] w-[85%] -translate-x-1/2 rounded-[50%] bg-charcoal/[0.05]"
        />
        <div className="relative grid aspect-square h-[38%] min-h-14 place-items-center rounded-full border border-red/15 bg-white shadow-card">
          <span className="font-display text-2xl font-extrabold leading-none tracking-tight text-red sm:text-3xl">
            {initials}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-offwhite">
      <div aria-hidden="true" className={`absolute inset-0 ${GRID}`} />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(135deg,rgba(227,30,36,0.16),rgba(227,30,36,0.02)_55%,transparent)]"
      />
      <div aria-hidden="true" className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red/[0.08]" />
      <ArtIcon icon={placeholder.icon} />
    </div>
  );
}

/** The course card's animated scene (components/art/Scenes.tsx). */
function ArtIcon({ icon }: { icon: "classroom" | "online" | "gpsc" }) {
  return <CourseScene kind={icon} className="relative h-[88%] w-[88%] max-sm:h-full max-sm:w-full" />;
}
