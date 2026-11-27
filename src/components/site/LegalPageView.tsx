import type { ReactNode } from "react";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { displayPhone, telHref } from "@/lib/utils";

/**
 * Privacy Policy / Terms & Conditions.
 *
 * The text comes from admin, or from the standard wording in
 * `src/lib/legal-content.ts` while the admin box is empty. It is plain text
 * with a few simple markers so a non-technical editor can keep the structure:
 *
 *   ## Heading   ### Sub-heading   - bullet   **bold**
 *
 * A first line starting "Last updated" is shown under the title.
 */

type Block =
  | { kind: "h2"; text: string; id: string }
  | { kind: "h3"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/^\d+\.\s*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parse(content: string): { updated: string; blocks: Block[] } {
  const lines = content.split(/\r?\n/).map((l) => l.trim());
  let updated = "";
  const blocks: Block[] = [];
  const used = new Set<string>();

  for (const line of lines) {
    if (!line) continue;
    if (!updated && blocks.length === 0 && /^last updated/i.test(line)) {
      updated = line;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
    } else if (line.startsWith("## ")) {
      const text = line.slice(3).trim();
      let id = slugify(text) || `section-${blocks.length}`;
      while (used.has(id)) id += "-x";
      used.add(id);
      blocks.push({ kind: "h2", text, id });
    } else if (/^[-•*]\s+/.test(line)) {
      const item = line.replace(/^[-•*]\s+/, "");
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ul") last.items.push(item);
      else blocks.push({ kind: "ul", items: [item] });
    } else {
      blocks.push({ kind: "p", text: line });
    }
  }
  return { updated, blocks };
}

/** Renders **bold** inside a line; everything else stays plain text. */
function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-bold text-charcoal">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export default function LegalPageView({ title, content }: { title: string; content: string }) {
  const { updated, blocks } = parse(content);
  const sections = blocks.filter((b): b is Extract<Block, { kind: "h2" }> => b.kind === "h2");

  if (blocks.length === 0) {
    return (
      <div className="container-site max-w-3xl py-14 md:py-20">
        <h1 className="text-display-lg">{title}</h1>
        <div className="mt-6 rounded-xl border border-line bg-offwhite p-6">
          <p className="text-[15px] leading-relaxed text-body">
            We&apos;re finalising this page. If you have a question about how we handle your
            information or about enrolling with us, please call us on{" "}
            <a href={telHref(PHONE_DISPLAY)} className="font-bold text-red hover:underline">
              {displayPhone(PHONE_DISPLAY)}
            </a>{" "}
            and we&apos;ll answer directly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-site max-w-3xl py-14 md:py-20">
      <h1 className="text-display-lg">{title}</h1>
      {updated && <p className="mt-3 text-sm font-semibold text-muted">{updated}</p>}

      {sections.length > 2 && (
        <nav aria-label="On this page" className="mt-8 rounded-xl border border-line bg-offwhite p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">On this page</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-body transition-colors hover:text-red hover:underline">
                  {s.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mt-8">
        {blocks.map((b, i) => {
          switch (b.kind) {
            case "h2":
              return (
                <h2
                  key={i}
                  id={b.id}
                  className="mt-10 scroll-mt-28 border-t border-line pt-8 text-xl font-bold text-charcoal first:mt-0 first:border-0 first:pt-0 sm:text-2xl"
                >
                  {b.text}
                </h2>
              );
            case "h3":
              return (
                <h3 key={i} className="mt-6 text-base font-bold text-charcoal sm:text-lg">
                  {b.text}
                </h3>
              );
            case "ul":
              return (
                <ul key={i} className="mt-4 space-y-2 pl-5 text-[15px] leading-relaxed text-body marker:text-red sm:text-base [list-style:disc]">
                  {b.items.map((item, j) => (
                    <li key={j}>{inline(item)}</li>
                  ))}
                </ul>
              );
            default:
              return (
                <p key={i} className="mt-4 text-[15px] leading-relaxed text-body sm:text-base">
                  {inline(b.text)}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
}
