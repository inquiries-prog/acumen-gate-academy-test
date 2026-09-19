"use client";

import { useState } from "react";
import { useSiteUI } from "./SiteUI";
import { telHref } from "@/lib/utils";

/**
 * The general enquiry form (SRS 8.1), extracted so the popup and the hero share
 * one implementation. Validation, the honeypot, the submit handler and the
 * success state all live here - there is no second copy to drift.
 *
 * Five fields, deliberately. Email, University and Residential City were
 * removed on purpose to raise conversion and must not be added back without
 * client sign-off. Because no email is collected, confirmation to the student
 * goes by SMS/WhatsApp (SRS 10.2), never email - and the success message only
 * claims a message was sent when one actually was.
 */
export default function EnquiryForm({
  source,
  batchLabel,
  initialPhone,
  onDone,
  compact = false,
}: {
  /** Which CTA opened this, recorded against the lead. */
  source: string;
  batchLabel?: string;
  /**
   * Pre-fills the phone field. Used by the phone-first hero capture on mobile,
   * where the number was typed on the page and the popup collects the rest.
   * The field stays editable and is still validated on submit.
   */
  initialPhone?: string;
  /** Called from the "Done" button in the success state, if provided. */
  onDone?: () => void;
  /** Tighter spacing and a two-up field row, for the hero card. */
  compact?: boolean;
}) {
  const { formOptions, settings } = useSiteUI();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const branches = formOptions.branch ?? [];
  const enquiryFor = formOptions.enquiry_for ?? [];
  const heardAbout = formOptions.heard_about ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fd.get("full_name"),
          phone: fd.get("phone"),
          branch: fd.get("branch"),
          enquiry_for: fd.get("enquiry_for"),
          heard_about: fd.get("heard_about"),
          source: batchLabel ? `${source} - ${batchLabel}` : source,
          // Honeypot: a real person never fills a hidden field (SRS 14).
          company: fd.get("company"),
        }),
      });
      const body = (await res.json()) as { ok: boolean; smsSent?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong.");
      setSmsSent(Boolean(body.smsSent));
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't submit that just now. Please call us instead.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="#E31E24"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold">Thank you!</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-body">
          We&apos;ve received your enquiry. One of our counsellors will call you back within 24
          hours.
          {/* Only claimed when a message was genuinely sent (SRS 10.2). */}
          {smsSent && " A confirmation has also been sent to your phone via SMS/WhatsApp."}
        </p>
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <a href={telHref(settings.phone)} className="btn-secondary">
            Call {settings.phone}
          </a>
          {onDone && (
            <button type="button" onClick={onDone} className="btn-primary">
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3.5" : "space-y-4"}>
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div>
        <label htmlFor={`enq-name-${source}`} className="field-label">
          Full Name <span className="text-red">*</span>
        </label>
        <input
          id={`enq-name-${source}`}
          name="full_name"
          required
          autoComplete="name"
          className="field"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor={`enq-phone-${source}`} className="field-label">
          Phone Number <span className="text-red">*</span>
        </label>
        <input
          id={`enq-phone-${source}`}
          name="phone"
          required
          defaultValue={initialPhone}
          type="tel"
          inputMode="numeric"
          pattern="[0-9+\s-]{10,15}"
          autoComplete="tel"
          className="field"
          placeholder="10-digit mobile number"
        />
      </div>

      <div className={compact ? "grid gap-3.5 sm:grid-cols-2" : ""}>
        <div>
          <label htmlFor={`enq-branch-${source}`} className="field-label">
            Branch <span className="text-red">*</span>
          </label>
          <select
            id={`enq-branch-${source}`}
            name="branch"
            required
            defaultValue=""
            className="field"
          >
            <option value="" disabled>
              Select your branch
            </option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className={compact ? "" : "mt-4"}>
          <label htmlFor={`enq-for-${source}`} className="field-label">
            Enquiry For <span className="text-red">*</span>
          </label>
          <select id={`enq-for-${source}`} name="enquiry_for" required defaultValue="" className="field">
            <option value="" disabled>
              Select an option
            </option>
            {enquiryFor.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`enq-heard-${source}`} className="field-label">
          How did you hear about us?
        </label>
        <select id={`enq-heard-${source}`} name="heard_about" defaultValue="" className="field">
          <option value="">Select an option</option>
          {heardAbout.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? "Sending…" : "Request a callback"}
      </button>

      <p className="text-center text-xs leading-relaxed text-muted">
        We call once, within 24 hours. No spam. Or reach us now on{" "}
        <a href={telHref(settings.phone)} className="font-semibold text-red hover:underline">
          {settings.phone}
        </a>
      </p>
    </form>
  );
}
