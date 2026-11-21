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
 * A phone number for display. The spaces become non-breaking, so the number
 * can never wrap onto two lines inside a button or a tight column - a number
 * split in half reads as two numbers. Use this wherever a number is printed.
 */
const NBSP = String.fromCharCode(0xa0);
export function displayPhone(phone: string): string {
  return phone.trim().replace(/\s+/g, NBSP);
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

/** Splits an admin "one per line" field into its non-empty lines. */
export function toLines(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•\-*]+/, "").trim())
    .filter(Boolean);
}

export function modeLabel(mode: "offline" | "online"): string {
  return mode === "offline" ? "Offline" : "Live online";
}

/**
 * The name a batch is shown and invoiced under, e.g.
 * "Mechanical Engineering (ME) - Weekend Batch · Vadodara". Used in the enroll
 * sheet, the enrollment record and lead sources, so all three agree.
 */
export function batchDisplayLabel(
  batch: { mode: "offline" | "online"; title?: string | null },
  branch: { name: string; code: string } | null | undefined,
): string {
  const course = branch ? `${branch.name} (${branch.code})` : "GATE";
  const title = (batch.title ?? "").trim() || `${batch.mode === "offline" ? "Offline" : "Online"} batch`;
  return `${course} - ${title}`;
}

/** Whole days from today until an ISO date, or null if blank/invalid/past. */
export function daysUntil(isoDate: string, now = new Date()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate ?? "")) return null;
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((target - today) / 86_400_000);
  return days >= 0 ? days : null;
}

/**
 * A price for display: "₹45,000", or "₹12,711.86" when there are paise.
 * Marketing surfaces use this; invoices and payment screens keep
 * formatRupees (lib/payments), which always shows paise.
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
