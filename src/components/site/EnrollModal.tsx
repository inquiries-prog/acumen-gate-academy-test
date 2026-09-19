"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { calculateFees, formatRupees } from "@/lib/payments";
import type { BatchMode } from "@/lib/types";
import { resolve } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";

/**
 * Direct enrollment + payment (SRS 11). Required in this build, not deferred.
 *
 * Step 1 collects the details a GST invoice legally needs - including an email
 * address, which is required here even though the general enquiry form
 * deliberately omits one (SRS 8.1 / 11.1).
 * Step 2 shows fee, GST as its own line, and the total (SRS 11.2).
 *
 * The enrollment row is written before the visitor leaves for the gateway, so
 * an abandoned or failed payment is still captured for manual follow-up
 * (SRS 11.5) rather than silently dropped.
 */
export default function EnrollModal({
  open,
  branchId,
  mode,
  onClose,
}: {
  open: boolean;
  branchId: string;
  mode: BatchMode;
  onClose: () => void;
}) {
  const { findBranchBatch, openEnquiry } = useSiteUI();
  const [step, setStep] = useState<"details" | "summary">("details");
  const [details, setDetails] = useState({
    full_name: "",
    phone: "",
    email: "",
    billing_address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const row = findBranchBatch(branchId, mode);
  if (!row?.batch) return null;

  const { branch, batch } = row;
  const modeLabel = mode === "offline" ? "Offline" : "Online";
  const batchLabel = `${branch.name} (${branch.code}) ${modeLabel}`;
  const fees = calculateFees(Number(batch.fees ?? 0));

  function handleDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setDetails({
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      billing_address: String(fd.get("billing_address") ?? ""),
    });
    setStep("summary");
  }

  async function startPayment() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, batch_id: batch!.id, batch_label: batchLabel }),
      });
      const body = (await res.json()) as { ok: boolean; checkoutUrl?: string; error?: string };
      if (!res.ok || !body.ok || !body.checkoutUrl) {
        throw new Error(body.error || "We couldn't start the payment.");
      }
      window.location.href = body.checkoutUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "We couldn't start the payment. Please call us.",
      );
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={step === "details" ? "Enroll & Pay" : "Payment summary"}
      subtitle={
        step === "details"
          ? `${batchLabel} — enter your details for the receipt and GST invoice.`
          : batchLabel
      }
    >
      {step === "details" ? (
        <form onSubmit={handleDetails} className="space-y-4">
          <div>
            <label htmlFor="enr-name" className="field-label">
              Full Name <span className="text-red">*</span>
            </label>
            <input
              id="enr-name"
              name="full_name"
              required
              defaultValue={details.full_name}
              autoComplete="name"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="enr-phone" className="field-label">
              Phone Number <span className="text-red">*</span>
            </label>
            <input
              id="enr-phone"
              name="phone"
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9+\s-]{10,15}"
              defaultValue={details.phone}
              autoComplete="tel"
              className="field"
            />
          </div>

          <div>
            <label htmlFor="enr-email" className="field-label">
              Email ID <span className="text-red">*</span>
            </label>
            <input
              id="enr-email"
              name="email"
              required
              type="email"
              defaultValue={details.email}
              autoComplete="email"
              className="field"
            />
            <p className="mt-1.5 text-xs text-muted">
              Your payment receipt and GST invoice are sent here.
            </p>
          </div>

          <div>
            <label htmlFor="enr-address" className="field-label">
              Billing Address <span className="text-red">*</span>
            </label>
            <textarea
              id="enr-address"
              name="billing_address"
              required
              rows={3}
              defaultValue={details.billing_address}
              autoComplete="street-address"
              className="field resize-y"
              placeholder="Address, city, state, PIN code"
            />
            <p className="mt-1.5 text-xs text-muted">Required on the GST invoice.</p>
          </div>

          <button type="submit" className="btn-primary w-full">
            Continue to payment summary
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          <dl className="overflow-hidden rounded-xl border border-line">
            <Row label="Batch" value={batchLabel} />
            <Row label="Starts" value={resolve(batch.start_date, "Call us for dates")} />
            <Row label="Course fee" value={formatRupees(fees.fee)} />
            {/* GST shown as its own line, as SRS 11.2 requires. */}
            <Row label={`GST @ ${fees.gstRate}%`} value={formatRupees(fees.gst)} />
            <Row label="Total payable" value={formatRupees(fees.total)} emphasis />
          </dl>

          <div className="rounded-lg bg-offwhite px-4 py-3 text-xs leading-relaxed text-body">
            This is the full course fee. You&apos;ll be taken to a secure payment page — we never
            see or store your card details. A GST invoice is emailed to{" "}
            <span className="font-semibold text-charcoal">{details.email}</span> once payment
            succeeds.
          </div>

          {error && (
            <p className="rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
              {error}{" "}
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => openEnquiry("Enrollment failure", batchLabel)}
              >
                Ask us to help instead
              </button>
            </p>
          )}

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="btn-secondary sm:w-auto"
            >
              Back
            </button>
            <button
              type="button"
              onClick={startPayment}
              disabled={submitting}
              className="btn-primary flex-1"
            >
              {submitting ? "Starting payment…" : `Pay ${formatRupees(fees.total)}`}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0 ${
        emphasis ? "bg-offwhite" : "bg-white"
      }`}
    >
      <dt className={`text-sm ${emphasis ? "font-bold text-charcoal" : "text-body"}`}>{label}</dt>
      <dd
        className={`text-right text-sm ${
          emphasis ? "text-base font-bold text-charcoal" : "font-semibold text-charcoal"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
