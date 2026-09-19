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

/**
 * wa.me deep link. Accepts the number however it was typed (10 digits, with a
 * leading 0, or with +91) and normalises to the international form WhatsApp
 * requires. The message is encoded once; wa.me decodes it into the chat box.
 */
export function whatsappHref(number: string, message?: string): string {
  let digits = number.replace(/\D/g, "");
  if (digits.length === 10) digits = `91${digits}`;
  else if (digits.length === 11 && digits.startsWith("0")) digits = `91${digits.slice(1)}`;
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}

export function whatsappBatchMessage(branchName: string, code: string, mode: string): string {
  return `Hi, I'm interested in the ${code} ${mode} batch (${branchName}). Could you share the details?`;
}

/**
 * YouTube poster frame. `maxresdefault` is sharp but not every video has one;
 * callers fall back to `hqdefault` (always present, 4:3 with letterbox bars
 * that `object-cover` in a 16:9 box crops away).
 */
export function youtubeThumb(
  videoId: string,
  quality: "maxresdefault" | "hqdefault" = "maxresdefault",
): string {
  return `https://i.ytimg.com/vi/${videoId}/${quality}.jpg`;
}

/** 824 -> "13:44", for "starts at" captions. */
export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
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
