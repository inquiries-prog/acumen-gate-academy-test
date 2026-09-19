import { NextResponse } from "next/server";

/** Standard JSON responses so every route answers in the same shape. */
export function ok<T extends object>(data: T = {} as T) {
  return NextResponse.json({ ok: true, ...data });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function cleanString(value: unknown, maxLength = 300): string {
  if (typeof value !== "string") return "";
  // Strip control characters, which have no place in a form field.
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Preserves paragraph breaks, for textareas like the billing address. */
export function cleanMultiline(value: unknown, maxLength = 2000): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Accepts Indian mobile numbers written with or without +91 / spaces / dashes. */
export function normalisePhone(value: unknown): string | null {
  const digits = cleanString(value, 20).replace(/\D/g, "");
  const ten = digits.length > 10 ? digits.slice(-10) : digits;
  if (ten.length !== 10) return null;
  // Indian mobile numbers start 6-9.
  if (!/^[6-9]/.test(ten)) return null;
  return ten;
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

/**
 * Bot trap. The forms render a hidden "company" field; a human never fills it,
 * automated submitters usually do (SRS 14 asks for spam protection on lead
 * forms - a honeypot costs nothing in conversion, unlike a CAPTCHA).
 */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  return cleanString(body.company).length > 0;
}

/**
 * Lightweight per-IP rate limit.
 *
 * In-memory, so on a serverless host each instance keeps its own counter -
 * enough to blunt naive flooding, not a substitute for a real WAF. If abuse
 * becomes a problem in production, move this to a shared store.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    // Opportunistic cleanup so the map can't grow without bound.
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
    }
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_PER_WINDOW;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
