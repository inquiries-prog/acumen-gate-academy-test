"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormIcon, SecureLock } from "@/components/art/Icons";
import BranchArt from "@/components/courses/BranchArt";
import FieldIcon from "@/components/ui/FieldIcons";
import Modal from "@/components/ui/Modal";
import { calculateFees, formatRupees } from "@/lib/payments";
import { preloadCheckoutScript } from "@/lib/razorpay-client";
import { batchDisplayLabel, formatPrice, isPlaceholder, resolve } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";

type Step = "details" | "review" | "paying";

const STEPS: Array<{ key: Step; label: string }> = [
  { key: "details", label: "Your details" },
  { key: "review", label: "Review" },
  { key: "paying", label: "Pay" },
];

/** What the student sees while we hand over to the payment gateway. */
const PAYING_STEPS = ["Saving your details", "Creating your secure order", "Opening Razorpay"];

/**
 * Direct enrollment + payment (SRS 11).
 *
 * Three stages in one sheet, with a stepper in the header:
 *   1. Details - the batch being joined is summarised at the top, then the
 *      four fields a GST invoice legally needs (SRS 11.1).
 *   2. Review - a ticket-style summary: the batch, the fee with GST shown as
 *      its own line (SRS 11.2), the total, and the student's details.
 *   3. Paying - an animated hand-over while the order is created and the
 *      payment window opens, so the screen is never static.
 *
 * Speed: the Razorpay script starts downloading the moment this sheet opens
 * (while the student is still typing), and the checkout page is reached by
 * client-side navigation, so the script is already in memory and the payment
 * window opens at once. The server sends the team's email after replying.
 *
 * The enrollment row is written before the visitor leaves for the gateway, so
 * an abandoned or failed payment is still captured for follow-up (SRS 11.5).
 */
export default function EnrollModal({
  open,
  batchId,
  onClose,
}: {
  open: boolean;
  batchId: string;
  onClose: () => void;
}) {
  const { findBatch, openEnquiry, closeAll } = useSiteUI();
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<Step>("details");
  const [details, setDetails] = useState({ full_name: "", phone: "", email: "", billing_address: "" });
  const [showErrors, setShowErrors] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigating = useRef(false);

  // Warm up the payment script while the student fills the form.
  useEffect(() => {
    if (open) preloadCheckoutScript();
  }, [open]);

  // The sheet lives in the site layout, so it would survive the navigation to
  // the checkout page - close it once that page is showing.
  useEffect(() => {
    if (navigating.current && pathname?.startsWith("/enroll/checkout")) {
      navigating.current = false;
      closeAll();
    }
  }, [pathname, closeAll]);

  const row = findBatch(batchId);
  if (!row) return null;

  const { branch, batch } = row;
  const batchLabel = batchDisplayLabel(batch, branch);
  const fees = calculateFees(Number(batch.fees ?? 0));
  const code = branch?.code ?? "GATE";
  const title = batch.title || (batch.mode === "offline" ? "Classroom batch" : "Live online batch");
  const startText = isPlaceholder(batch.start_date)
    ? "Dates on call"
    : `Starts ${resolve(batch.start_date, "soon")}`;

  function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setShowErrors(true);
      form.querySelector<HTMLElement>(":invalid")?.focus();
      return;
    }
    const fd = new FormData(form);
    setDetails({
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      billing_address: String(fd.get("billing_address") ?? ""),
    });
    setShowErrors(false);
    setStep("review");
  }

  async function startPayment() {
    setError(null);
    setStep("paying");
    setProgress(0);
    // Step 1 ticks over quickly; step 2 completes when the server answers.
    const t = window.setTimeout(() => setProgress((p) => Math.max(p, 1)), 450);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, batch_id: batch.id, batch_label: batchLabel }),
      });
      const body = (await res.json()) as { ok: boolean; checkoutUrl?: string; error?: string };
      if (!res.ok || !body.ok || !body.checkoutUrl) {
        throw new Error(body.error || "We couldn't start the payment.");
      }
      window.clearTimeout(t);
      setProgress(2);
      navigating.current = true;
      if (body.checkoutUrl.startsWith("/")) router.push(body.checkoutUrl);
      else window.location.href = body.checkoutUrl;
    } catch (err) {
      window.clearTimeout(t);
      setError(err instanceof Error ? err.message : "We couldn't start the payment. Please call us.");
      setStep("review");
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const invalid = showErrors ? "[&:invalid]:border-red [&:invalid]:bg-red/[0.03]" : "";

  return (
    <Modal
      open={open}
      onClose={step === "paying" ? () => {} : onClose}
      dismissible={step !== "paying"}
      size="md"
      eyebrow="Secure enrollment"
      icon={<FormIcon kind="enroll" />}
      title={step === "details" ? "Enroll & Pay" : step === "review" ? "Review & pay" : "Securing your seat"}
      subtitle={batchLabel}
      headerExtra={<Stepper index={stepIndex} />}
    >
      {step === "details" && (
        <form onSubmit={handleDetails} noValidate className="space-y-4">
          {/* What they're enrolling in, so the form never feels abstract. */}
          <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-offwhite p-3 animate-reveal">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-white shadow-chip">
              <BranchArt code={code} className="h-full w-full" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-charcoal">{title}</p>
              <p className="mt-0.5 truncate text-xs text-muted">
                {batch.mode === "offline" ? "Classroom · Vadodara" : "Live online"} · {startText}
              </p>
            </div>
            <p className="shrink-0 text-right font-display text-lg font-extrabold text-charcoal">
              {formatPrice(fees.total)}
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted">incl. GST</span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="enr-name" name="full_name" label="Full name" icon="user" value={details.full_name} autoComplete="name" placeholder="As on your ID" extra={invalid} minLength={2} />
            <Input id="enr-phone" name="phone" label="Mobile" icon="phone" type="tel" inputMode="numeric" pattern="[0-9+\s-]{10,15}" value={details.phone} autoComplete="tel" placeholder="10-digit number" extra={invalid} />
          </div>
          <Input
            id="enr-email"
            name="email"
            label="Email"
            icon="mail"
            type="email"
            value={details.email}
            autoComplete="email"
            placeholder="you@example.com"
            help="Your payment receipt and GST invoice are sent here."
            extra={invalid}
          />
          <div>
            <label htmlFor="enr-address" className="field-label">
              Billing address <span className="text-red">*</span>
            </label>
            <div className="field-wrap">
              <FieldIcon name="home" className="field-icon !top-4 !translate-y-0" />
              <textarea
                id="enr-address"
                name="billing_address"
                required
                minLength={8}
                rows={3}
                defaultValue={details.billing_address}
                autoComplete="street-address"
                className={`field has-icon resize-y ${invalid}`}
                placeholder="Address, city, state, PIN code"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">Required on the GST invoice.</p>
          </div>

          {showErrors && (
            <p className="rounded-lg bg-red/5 px-3 py-2.5 text-xs font-medium text-red-dark animate-slideUp" role="alert">
              Please fill in every field - a valid 10-digit mobile, an email and your full address.
            </p>
          )}

          <button type="submit" className="btn-primary w-full text-base">
            Continue to review
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-nudge-x">
              <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <SecureNote />
        </form>
      )}

      {step === "review" && (
        <div className="space-y-5 animate-reveal">
          {/* The ticket. */}
          <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-card">
            <div className="flex items-center gap-3.5 bg-gradient-to-br from-offwhite via-white to-red/[0.06] p-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white shadow-chip">
                <BranchArt code={code} className="h-full w-full" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-red">
                  {batch.mode === "offline" ? "Classroom · Vadodara" : "Live online"}
                </p>
                <p className="mt-0.5 font-display text-base font-bold leading-snug text-charcoal">{title}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {startText}
                  {batch.schedule ? ` · ${batch.schedule}` : ""}
                </p>
              </div>
            </div>

            {/* Perforation, with notches cut into both edges. */}
            <div className="relative h-0 border-t-2 border-dashed border-line">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-line bg-white" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full border border-line bg-white" />
            </div>

            <dl className="space-y-2.5 p-4 text-sm">
              <Line label="Course fee" value={formatRupees(fees.fee)} />
              {/* GST as its own line, as SRS 11.2 requires. */}
              <Line label={`GST @ ${fees.gstRate}%`} value={formatRupees(fees.gst)} />
              <div className="flex items-end justify-between gap-4 border-t border-line pt-3">
                <dt className="font-bold text-charcoal">Total payable</dt>
                <dd className="font-display text-2xl font-extrabold text-charcoal">{formatPrice(fees.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Who it's for, with a way back. */}
          <div className="flex items-start justify-between gap-4 rounded-2xl bg-offwhite px-4 py-3.5 text-sm">
            <div className="min-w-0">
              <p className="font-bold text-charcoal">{details.full_name}</p>
              <p className="truncate text-xs text-body">
                {details.phone} · {details.email}
              </p>
              <p className="mt-1 text-xs text-muted">GST invoice is emailed once payment succeeds.</p>
            </div>
            <button
              type="button"
              onClick={() => setStep("details")}
              className="shrink-0 text-xs font-bold text-red underline-offset-4 hover:underline"
            >
              Edit
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
              {error}{" "}
              <button type="button" className="font-semibold underline" onClick={() => openEnquiry("Enrollment failure", batchLabel)}>
                Ask us to help instead
              </button>
            </p>
          )}

          <button type="button" onClick={startPayment} className="btn-primary w-full text-base">
            <FieldIcon name="lock" className="[&_svg]:h-[18px] [&_svg]:w-[18px]" />
            Pay {formatPrice(fees.total)} securely
          </button>
          <p className="-mt-2 text-center text-xs leading-relaxed text-muted">
            By paying you agree to our{" "}
            <a href="/terms" target="_blank" rel="noopener" className="font-semibold text-charcoal underline hover:text-red">
              Terms &amp; Conditions
            </a>{" "}
            (including the refund policy) and{" "}
            <a href="/privacy" target="_blank" rel="noopener" className="font-semibold text-charcoal underline hover:text-red">
              Privacy Policy
            </a>
            .
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {["UPI", "Cards", "Net banking", "Wallets"].map((m) => (
              <span key={m} className="rounded-md border border-line bg-white px-2 py-1 text-[11px] font-bold text-charcoal">
                {m}
              </span>
            ))}
          </div>
          <SecureNote />
        </div>
      )}

      {step === "paying" && (
        <div className="py-4 text-center animate-reveal" role="status" aria-live="polite">
          <SecureLock className="mx-auto h-24 w-24" />
          <p className="mt-3 font-display text-lg font-bold text-charcoal">Opening secure payment…</p>
          <p className="mt-1 text-sm text-body">This takes just a moment. Please don&apos;t close this window.</p>

          <ol className="mx-auto mt-6 max-w-xs space-y-3 text-left">
            {PAYING_STEPS.map((label, i) => {
              const done = progress > i;
              const active = progress === i;
              return (
                <li key={label} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full transition-all duration-500 ease-smooth ${
                      done ? "scale-100 bg-red text-white" : active ? "bg-red/10" : "bg-line"
                    }`}
                  >
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-pop">
                        <path d="M4.5 10.5l3.5 3.5L15.5 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : active ? (
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-red/30 border-t-red" />
                    ) : null}
                  </span>
                  <span className={done ? "font-semibold text-charcoal" : active ? "font-semibold text-charcoal" : "text-muted"}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* An indeterminate bar so there is always movement. */}
          <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-line">
            <div className="h-full w-1/3 rounded-full bg-red-sheen animate-indeterminate" />
          </div>
          <p className="mt-4 text-xs text-muted">Payments are handled by Razorpay. We never see your card or UPI details.</p>
        </div>
      )}
    </Modal>
  );
}

function Stepper({ index }: { index: number }) {
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Enrollment steps">
      {STEPS.map((s, i) => (
        <li key={s.key} className="min-w-0">
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-red transition-[width] duration-700 ease-smooth"
              style={{ width: i < index ? "100%" : i === index ? "55%" : "0%" }}
            />
          </div>
          <p className={`mt-1.5 truncate text-[11px] font-bold ${i <= index ? "text-white" : "text-white/45"}`}>
            {i + 1}. {s.label}
          </p>
        </li>
      ))}
    </ol>
  );
}

function Input({
  id,
  name,
  label,
  icon,
  value,
  help,
  extra = "",
  ...rest
}: {
  id: string;
  name: string;
  label: string;
  icon: "user" | "phone" | "mail";
  value: string;
  help?: string;
  extra?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} <span className="text-red">*</span>
      </label>
      <div className="field-wrap">
        <FieldIcon name={icon} />
        <input id={id} name={name} required defaultValue={value} className={`field has-icon ${extra}`} {...rest} />
      </div>
      {help && <p className="mt-1.5 text-xs text-muted">{help}</p>}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-body">{label}</dt>
      <dd className="font-semibold text-charcoal">{value}</dd>
    </div>
  );
}

function SecureNote() {
  return (
    <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted">
      <FieldIcon name="lock" className="text-red [&_svg]:h-3.5 [&_svg]:w-3.5" />
      Secure checkout by Razorpay · GST invoice included
    </p>
  );
}
