"use client";

import { useSiteUI } from "@/components/site/SiteUI";

/**
 * Phone-first capture for the mobile hero.
 *
 * On a phone the full enquiry card would sit a whole screen below the fold, so
 * the first action is reduced to the one thing a student will type without
 * thinking: their number. Submitting opens the enquiry bottom sheet with that
 * number already filled and the remaining fields (name, branch, enquiry for)
 * ready. One submit at the end, one complete lead - never a partial one.
 *
 * The input here is deliberately NOT `required` and carries no pattern. This
 * button must never dead-end; if the number is empty or wrong, the sheet's own
 * phone field (which is required and validated) catches it.
 *
 * Phone only (`lg:hidden`). Desktop renders the full card beside the headline.
 */
export default function HeroQuickCapture() {
  const { openEnquiry } = useSiteUI();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const phone = String(new FormData(e.currentTarget).get("phone") ?? "").trim();
    // Drop the on-screen keyboard before the sheet rises, so the two never
    // animate over each other.
    (document.activeElement as HTMLElement | null)?.blur?.();
    openEnquiry("Hero quick capture", undefined, phone ? { phone } : undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 lg:hidden" aria-label="Request a call back">
      <label htmlFor="hero-quick-phone" className="sr-only">
        Mobile number
      </label>

      <div
        className="flex items-center gap-1.5 rounded-2xl border border-line bg-white p-1.5 shadow-lifted
                   transition-all duration-200 ease-smooth
                   focus-within:border-red focus-within:ring-4 focus-within:ring-red/10"
      >
        <input
          id="hero-quick-phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          enterKeyHint="go"
          placeholder="Mobile number"
          // `.field` keeps the 16px font that stops iOS zooming on focus; the
          // border/ring are stripped because the wrapper draws them instead.
          className="field min-w-0 flex-1 border-0 bg-transparent px-3 shadow-none focus:border-0 focus:ring-0"
        />
        <button type="submit" className="btn-primary shrink-0 px-4">
          Get a call back
        </button>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-muted">
        Free counselling call within 24 hours. No spam.
      </p>
    </form>
  );
}
