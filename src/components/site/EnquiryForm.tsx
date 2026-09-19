"use client";

import { useState } from "react";
import SuccessBurst from "@/components/ui/SuccessBurst";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { useSiteUI } from "./SiteUI";
import WhatsAppLink from "./WhatsAppLink";
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
 *
 * Validation runs on the browser's own constraint API (`checkValidity`) but
 * reports through our markup rather than the native bubble: a field is judged
 * once it has been left, and a valid field earns a tick. Invalid is red, valid
 * is charcoal - no green, the palette does not have one.
 */

type FieldName = "full_name" | "phone" | "branch" | "enquiry_for";

const MESSAGES: Record<FieldName, string> = {
  full_name: "Please enter your name",
  phone: "Enter a valid 10-digit mobile number",
  branch: "Please choose your branch",
  enquiry_for: "Please choose an option",
};

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
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [invalid, setInvalid] = useState<Partial<Record<FieldName, boolean>>>({});

  const branches = formOptions.branch ?? [];
  const enquiryFor = formOptions.enquiry_for ?? [];
  const heardAbout = formOptions.heard_about ?? [];

  /** Records the field's validity; called on blur, and on change once touched. */
  function judge(el: HTMLInputElement | HTMLSelectElement) {
    const name = el.name as FieldName;
    if (!(name in MESSAGES)) return;
    setTouched((t) => ({ ...t, [name]: true }));
    setInvalid((v) => ({ ...v, [name]: !el.checkValidity() }));
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (touched[e.target.name as FieldName]) judge(e.target);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    // Judge everything at once; land focus on the first problem.
    if (!form.checkValidity()) {
      const fields = Array.from(
        form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input[name], select[name]"),
      ).filter((el) => el.name in MESSAGES);
      fields.forEach(judge);
      fields.find((el) => !el.checkValidity())?.focus();
      return;
    }

    setError(null);
    setSubmitting(true);
    const fd = new FormData(form);
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
        <SuccessBurst variant="check" />
        <h2 className="font-display text-xl font-bold animate-reveal" style={{ animationDelay: "250ms" }}>
          Thank you!
        </h2>
        <p
          className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-body animate-reveal"
          style={{ animationDelay: "350ms" }}
        >
          We&apos;ve received your enquiry. One of our counsellors will call you back within 24
          hours.
          {/* Only claimed when a message was genuinely sent (SRS 10.2). */}
          {smsSent && " A confirmation has also been sent to your phone via SMS/WhatsApp."}
        </p>
        <div
          className="mt-5 flex flex-col gap-2.5 animate-reveal sm:flex-row sm:justify-center"
          style={{ animationDelay: "450ms" }}
        >
          <a href={telHref(settings.phone)} className="btn-secondary">
            Call {settings.phone}
          </a>
          <WhatsAppLink className="btn-secondary">
            <WhatsAppIcon /> WhatsApp
          </WhatsAppLink>
          {onDone && (
            <button type="button" onClick={onDone} className="btn-primary">
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  const state = (name: FieldName) =>
    touched[name] ? (invalid[name] ? "invalid" : "valid") : "idle";

  const fieldClass = (name: FieldName) => {
    const s = state(name);
    return `field ${
      s === "invalid"
        ? "border-red pr-11 focus:ring-red/15"
        : s === "valid"
          ? "border-charcoal/30 pr-11"
          : ""
    }`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={compact ? "space-y-3.5" : "space-y-4"}
    >
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <Field name="full_name" label="Full Name" state={state("full_name")} source={source}>
        <input
          id={`enq-full_name-${source}`}
          name="full_name"
          required
          minLength={2}
          autoComplete="name"
          placeholder="Your full name"
          aria-invalid={state("full_name") === "invalid"}
          aria-describedby={state("full_name") === "invalid" ? `enq-full_name-${source}-err` : undefined}
          onBlur={(e) => judge(e.target)}
          onChange={onChange}
          className={fieldClass("full_name")}
        />
      </Field>

      <Field name="phone" label="Phone Number" state={state("phone")} source={source}>
        <input
          id={`enq-phone-${source}`}
          name="phone"
          required
          defaultValue={initialPhone}
          type="tel"
          inputMode="numeric"
          pattern="[0-9+\s-]{10,15}"
          autoComplete="tel"
          placeholder="10-digit mobile number"
          aria-invalid={state("phone") === "invalid"}
          aria-describedby={state("phone") === "invalid" ? `enq-phone-${source}-err` : undefined}
          onBlur={(e) => judge(e.target)}
          onChange={onChange}
          className={fieldClass("phone")}
        />
      </Field>

      <div className={compact ? "grid gap-3.5 sm:grid-cols-2" : "space-y-4"}>
        <Field name="branch" label="Branch" state={state("branch")} source={source} select>
          <select
            id={`enq-branch-${source}`}
            name="branch"
            required
            defaultValue=""
            aria-invalid={state("branch") === "invalid"}
            aria-describedby={state("branch") === "invalid" ? `enq-branch-${source}-err` : undefined}
            onBlur={(e) => judge(e.target)}
            onChange={(e) => judge(e.target)}
            className={`field ${state("branch") === "invalid" ? "border-red" : state("branch") === "valid" ? "border-charcoal/30" : ""}`}
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
        </Field>

        <Field name="enquiry_for" label="Enquiry For" state={state("enquiry_for")} source={source} select>
          <select
            id={`enq-enquiry_for-${source}`}
            name="enquiry_for"
            required
            defaultValue=""
            aria-invalid={state("enquiry_for") === "invalid"}
            aria-describedby={
              state("enquiry_for") === "invalid" ? `enq-enquiry_for-${source}-err` : undefined
            }
            onBlur={(e) => judge(e.target)}
            onChange={(e) => judge(e.target)}
            className={`field ${state("enquiry_for") === "invalid" ? "border-red" : state("enquiry_for") === "valid" ? "border-charcoal/30" : ""}`}
          >
            <option value="" disabled>
              Select an option
            </option>
            {enquiryFor.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
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

/**
 * Label + control + state icon + helper text. The icon sits in the control's
 * right padding for inputs; selects keep their native chevron and show state
 * through the border and helper text only.
 */
function Field({
  name,
  label,
  state,
  source,
  select = false,
  children,
}: {
  name: FieldName;
  label: string;
  state: "idle" | "invalid" | "valid";
  source: string;
  select?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={`enq-${name}-${source}`} className="field-label">
        {label} <span className="text-red">*</span>
      </label>
      <div className="relative">
        {children}
        {!select && state !== "idle" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 animate-pop"
          >
            {state === "invalid" ? (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-red text-[11px] font-bold leading-none text-white">
                !
              </span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M4 10.5l3.5 3.5L16 5.5"
                  stroke="#231F20"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        )}
      </div>
      {state === "invalid" && (
        <p
          id={`enq-${name}-${source}-err`}
          className="mt-1.5 text-xs font-medium text-red-dark animate-slideUp"
        >
          {MESSAGES[name]}
        </p>
      )}
    </div>
  );
}
