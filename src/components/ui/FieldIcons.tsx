/**
 * Small leading icons for form fields (see .field-wrap / .field-icon in
 * globals.css). They inherit colour, so the stylesheet can turn the icon red
 * while its field has focus.
 */

const P = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export type FieldIconName = "user" | "phone" | "mail" | "cap" | "pin" | "megaphone" | "home" | "clock" | "lock";

export default function FieldIcon({ name, className = "field-icon" }: { name: FieldIconName; className?: string }) {
  return <span className={className}>{ICONS[name]}</span>;
}

const ICONS: Record<FieldIconName, React.ReactNode> = {
  user: (
    <svg {...P}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0116 0" />
    </svg>
  ),
  phone: (
    <svg {...P}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10.5 18h3" />
    </svg>
  ),
  mail: (
    <svg {...P}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
    </svg>
  ),
  cap: (
    <svg {...P}>
      <path d="M12 4L22 9 12 14 2 9z" />
      <path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  ),
  pin: (
    <svg {...P}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0114 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  megaphone: (
    <svg {...P}>
      <path d="M3 10v4a1 1 0 001 1h3l8 5V4L7 9H4a1 1 0 00-1 1z" />
      <path d="M19 9a4 4 0 010 6" />
    </svg>
  ),
  home: (
    <svg {...P}>
      <path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
    </svg>
  ),
  clock: (
    <svg {...P}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  lock: (
    <svg {...P}>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 018 0v3" />
    </svg>
  ),
};
