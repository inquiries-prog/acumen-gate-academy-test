import Link from "next/link";
import { PRESS_MENTIONS } from "@/lib/defaults";

/**
 * "As featured in" masthead row.
 *
 * The client's GATE 2026 results were covered by four Gujarat papers, and that
 * is one of the strongest credibility signals on the site. Until now those
 * clippings only existed as images inside a scroller on the About page, where
 * almost nobody reaches them.
 *
 * Publication names are set as type rather than as logo files. Stating
 * truthfully that a paper covered you is fine; reproducing its masthead artwork
 * is a trademark question, and we do not have licensed logo files anyway. A
 * serif face carries the newspaper association without borrowing anyone's mark.
 *
 * The row links through to the About page's clippings, so the claim is one
 * click from its evidence.
 */
export default function PressRow() {
  if (PRESS_MENTIONS.length === 0) return null;

  return (
    <div className="border-t border-line pt-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
        Our students&apos; results, covered in
      </p>

      <ul className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4 sm:gap-x-10">
        {PRESS_MENTIONS.map((item) => (
          <li key={item.name} className="leading-tight">
            <span
              className="block text-lg font-semibold tracking-tight text-charcoal/85 sm:text-xl"
              // Generic serif stack: no extra font download, and it reads as a
              // masthead rather than as another line of UI text.
              style={{ fontFamily: 'Georgia, "Times New Roman", "Noto Serif", serif' }}
            >
              {item.name}
            </span>
            <span className="mt-0.5 block text-[11px] font-medium text-muted">{item.detail}</span>
          </li>
        ))}

        <li>
          <Link
            href="/about#press"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-red underline-offset-4 hover:underline"
          >
            See the clippings
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </li>
      </ul>
    </div>
  );
}
