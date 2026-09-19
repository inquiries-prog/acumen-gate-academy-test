import { PLACEHOLDER } from "./defaults";

/**
 * Seed rows carry PLACEHOLDER where the SRS 12 checklist says real content is
 * still pending from the client. Public pages must never print that marker, so
 * every read of such a field goes through here and shows a graceful stand-in.
 */
export function resolve(value: string | null | undefined, fallback = ""): string {
  if (!value) return fallback;
  if (value === PLACEHOLDER) return fallback;
  return value;
}

export function isPlaceholder(value: string | null | undefined): boolean {
  return !value || value === PLACEHOLDER;
}

/** tel: hrefs must not contain spaces. */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Renders admin-entered multi-paragraph text without allowing raw HTML. */
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
