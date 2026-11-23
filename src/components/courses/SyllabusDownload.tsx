import BranchArt from "./BranchArt";

/**
 * "Download official syllabus" - opens the organising institute's PDF in a
 * new tab. The file lives on the IIT's site, so this links to it rather than
 * hosting a copy that could go out of date. Hidden when there is no link.
 */

function PdfIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M6 2.5h8.5L19 7v14a.5.5 0 01-.5.5h-12A.5.5 0 016 21V2.5z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M14 2.5V7h5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10.5v6m0 0l-2.5-2.5M12 16.5l2.5-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The full card, for the syllabus section of a course page. */
export function SyllabusDownloadCard({ url, paper }: { url: string; paper: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-6 flex items-center gap-4 rounded-2xl border border-line bg-white p-4 shadow-card
                 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-red/30 hover:shadow-card-hover"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red text-white shadow-red-glow transition-transform duration-300 group-hover:scale-105">
        <PdfIcon className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold leading-snug text-charcoal group-hover:text-red">
          Download official syllabus
        </span>
        <span className="mt-0.5 block text-xs text-muted">{paper} · GATE 2027 · PDF by IIT Madras</span>
      </span>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-red transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <path d="M7 13L13 7m0 0H8m5 0v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/** A small inline link, for the course page hero. */
export function SyllabusDownloadLink({ url, className = "" }: { url: string; className?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline ${className}`}
    >
      <PdfIcon className="h-5 w-5" />
      Official syllabus (PDF)
    </a>
  );
}

/** All the official PDFs as tiles, for /courses. */
export function SyllabusDownloadGrid({
  items,
}: {
  items: Array<{ code: string; title: string; url: string }>;
}) {
  const list = items.filter((i) => i.url);
  if (list.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {list.map((item) => (
        <li key={item.code}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download the official GATE 2027 ${item.title} syllabus (PDF)`}
            className="group flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-white p-4 text-center shadow-chip
                       transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-red/30 hover:shadow-card"
          >
            <span className="relative h-14 w-14">
              <BranchArt code={item.code} className="h-full w-full" animated={false} />
            </span>
            <span className="font-display text-sm font-extrabold text-charcoal">{item.code === "CSE" ? "CS" : item.code}</span>
            <span className="text-[11px] leading-tight text-muted">{item.title}</span>
            <span className="mt-auto inline-flex items-center gap-1 rounded-full bg-red/[0.08] px-2.5 py-1 text-[11px] font-bold text-red transition-colors group-hover:bg-red group-hover:text-white">
              <PdfIcon className="h-3.5 w-3.5" /> PDF
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
