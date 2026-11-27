import sanitizeHtml from "sanitize-html";
import { toPostHtml } from "./post-html";

/**
 * Turns a stored news post into HTML that is safe to put on the page.
 *
 * Only what the admin editor can produce survives: paragraphs, headings,
 * bold/italic/underline/strike, small text, lists, quotes, links, dividers,
 * indentation and captioned images. Anything else (scripts, styles, event
 * handlers, iframes pasted in from elsewhere) is dropped.
 *
 * Images from our own storage are served through Next's image optimiser in a
 * few widths, so a phone never downloads the 8 MB original.
 */

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const WIDTHS = [640, 1080, 1920];

function optimisable(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname === supabaseHost && u.pathname.startsWith("/storage/v1/object/public/");
  } catch {
    return false;
  }
}

const optimised = (src: string, w: number) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

export function renderPostHtml(content: string | null | undefined): string {
  // transformTags runs before the attribute filter, and every transform below
  // builds its attributes from scratch, so a pasted srcset/target/style can
  // never ride along.
  return sanitizeHtml(toPostHtml(content), {
    allowedTags: [
      "p", "br", "h2", "h3", "strong", "b", "em", "i", "u", "s", "small",
      "ul", "ol", "li", "blockquote", "a", "hr", "figure", "figcaption", "img",
    ],
    allowedAttributes: {
      p: ["data-indent"],
      h2: ["data-indent"],
      h3: ["data-indent"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "srcset", "sizes", "loading", "decoding", "data-full"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
    transformTags: {
      h1: (_t, a) => indent("h2", a),
      h2: indent,
      h3: indent,
      h4: (_t, a) => indent("h3", a),
      h5: (_t, a) => indent("h3", a),
      h6: (_t, a) => indent("h3", a),
      p: indent,
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const out: sanitizeHtml.Attributes = href ? { href } : {};
        if (/^https?:\/\//i.test(href)) Object.assign(out, { target: "_blank", rel: "noopener noreferrer" });
        return { tagName, attribs: out };
      },
      img: (tagName, attribs) => {
        const src = attribs.src ?? "";
        const base: sanitizeHtml.Attributes = { alt: attribs.alt ?? "", loading: "lazy", decoding: "async", "data-full": src };
        if (!src || !optimisable(src)) return { tagName, attribs: { ...base, src } };
        return {
          tagName,
          attribs: {
            ...base,
            src: optimised(src, 1080),
            srcset: WIDTHS.map((w) => `${optimised(src, w)} ${w}w`).join(", "),
            sizes: "(max-width: 768px) 100vw, 768px",
          },
        };
      },
    },
  });
}

function indent(tagName: string, attribs: sanitizeHtml.Attributes): sanitizeHtml.Tag {
  const level = Number(attribs["data-indent"]);
  const out: sanitizeHtml.Attributes = {};
  if (level >= 1 && level <= 4) out["data-indent"] = String(Math.floor(level));
  return { tagName, attribs: out };
}
