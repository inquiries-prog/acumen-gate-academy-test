/**
 * WhatsApp glyph in `currentColor`, so it takes the palette colour of whatever
 * button it sits in (SRS 3.1 allows no brand green).
 */
export default function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5a8.5 8.5 0 00-7.3 12.9L3.5 20.5l4.2-1.1A8.5 8.5 0 1012 3.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.6c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2.1.3 0 .5l-.5.7c-.1.2-.1.3 0 .5a6 6 0 002.9 2.6c.2.1.3.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.6.7c.3.1.4.2.4.4a2 2 0 01-1.4 2c-.4.1-.9.2-2.6-.5a8.3 8.3 0 01-3.9-3.4c-.7-1.2-.8-1.9-.8-2.3a2.7 2.7 0 01.3-1.8z"
        fill="currentColor"
      />
    </svg>
  );
}
