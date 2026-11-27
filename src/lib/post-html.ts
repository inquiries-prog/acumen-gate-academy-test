/**
 * News post bodies.
 *
 * Posts are written in the admin's Word-style editor and stored as HTML.
 * Posts written before that are plain text: paragraphs split by blank lines,
 * with images as lines of their own reading `![caption](url)`. Both kinds are
 * read through here, so an old post opens in the editor and shows on the site
 * exactly as before.
 *
 * Safe on the server and in the browser (no dependencies). The HTML is only
 * ever shown after `renderPostHtml` (post-render.ts) has sanitised it.
 */

/** An image line in an old plain-text post. */
const IMAGE_LINE = /^!\[([^\]]*)\]\((\S+?)\)$/;

/** True when the post was written in the rich editor (stored as HTML). */
export function isHtml(content: string): boolean {
  return /^\s*</.test(content);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Converts an old plain-text post to the editor's HTML. */
export function legacyToHtml(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(IMAGE_LINE);
      return m ? figureHtml(m[2], m[1].trim()) : `<p>${escapeHtml(line)}</p>`;
    })
    .join("");
}

/** The post as HTML, whichever way it was stored. */
export function toPostHtml(content: string | null | undefined): string {
  const c = content ?? "";
  return isHtml(c) ? c : legacyToHtml(c);
}

export function figureHtml(src: string, caption = ""): string {
  const cap = escapeHtml(caption);
  return `<figure><img src="${escapeHtml(src)}" alt="${cap}">${cap ? `<figcaption>${cap}</figcaption>` : ""}</figure>`;
}

/** The post's words only (for reading time and search snippets). */
export function postText(content: string | null | undefined): string {
  return toPostHtml(content)
    .replace(/<figure[\s\S]*?<\/figure>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** The URLs of the images inside a post, in order. */
export function postImages(content: string | null | undefined): string[] {
  return Array.from(toPostHtml(content).matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi), (m) =>
    m[1].replace(/&amp;/g, "&"),
  );
}
