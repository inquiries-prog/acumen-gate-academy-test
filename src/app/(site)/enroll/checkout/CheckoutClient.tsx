"use client";

import { useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { displayPhone, telHref } from "@/lib/utils";

/**
 * Payment simulator for the stub provider.
 *
 * This screen exists only while PAYMENT_PROVIDER=stub. Once the client chooses
 * a gateway (SRS 12), this is replaced by that provider's hosted checkout and
 * no money ever moves through code we wrote.
 */
export default function CheckoutClient({
  orderId,
  enrollmentId,
  providerName,
  isLive,
}: {
  orderId: string;
  enrollmentId: string;
  providerName: string;
  isLive: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function simulate(status: "paid" | "failed") {
    setBusy(true);
    setError(null);
    try {
      // Posts the same shape the real gateway's webhook would send, so the
      // server-side success path is exercised for real.
      const res = await fetch("/api/payments/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, status, paymentRef: `stub_${orderId}` }),
      });
      if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
      window.location.href = `/enroll/status?state=${status}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed.");
      setBusy(false);
    }
  }

  if (isLive) {
    return (
      <div className="card p-7 text-center">
        <h1 className="text-xl font-bold">Redirecting you to pay…</h1>
        <p className="mt-3 text-sm leading-relaxed text-body">
          Your payment is being handled securely by {providerName}. If nothing happens in a few
          seconds, please call us on{" "}
          <a href={telHref(PHONE_DISPLAY)} className="font-bold text-red hover:underline">
            {displayPhone(PHONE_DISPLAY)}
          </a>{" "}
          and we&apos;ll complete your enrollment over the phone.
        </p>
      </div>
    );
  }

  if (!enrollmentId) {
    return (
      <div className="card p-7 text-center">
        <h1 className="text-xl font-bold">Nothing to pay for</h1>
        <p className="mt-3 text-sm text-body">
          This payment link is incomplete. Please start again from the batch you want to join.
        </p>
        <Link href="/" className="btn-primary mt-5">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="card p-7">
      {/* Deliberate exception to the SRS 3.1 palette: amber is the standard
          warning colour, and this badge only ever appears while the payment
          provider is the stub. It disappears once a real gateway is configured. */}
      <p className="inline-flex rounded bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-900">
        Test mode — no payment gateway connected
      </p>

      <h1 className="mt-4 text-xl font-bold">Simulated payment page</h1>
      <p className="mt-3 text-sm leading-relaxed text-body">
        The payment gateway hasn&apos;t been chosen yet, so no real money can move. Use the buttons
        below to walk through what happens after a successful or failed payment — both paths update
        the enrollment record exactly as the live gateway will.
      </p>

      <dl className="mt-5 rounded-lg bg-offwhite px-4 py-3 text-xs text-body">
        <div className="flex justify-between gap-4 py-0.5">
          <dt>Order</dt>
          <dd className="font-mono">{orderId || "-"}</dd>
        </div>
        <div className="flex justify-between gap-4 py-0.5">
          <dt>Enrollment</dt>
          <dd className="font-mono">{enrollmentId}</dd>
        </div>
      </dl>

      {error && (
        <p className="mt-4 rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={busy}
          onClick={() => simulate("paid")}
          className="btn-primary flex-1"
        >
          {busy ? "Working…" : "Simulate successful payment"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => simulate("failed")}
          className="btn-secondary flex-1"
        >
          Simulate failed payment
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Closing this page instead leaves the enrollment as &ldquo;initiated&rdquo;, which is how an
        abandoned payment appears in the admin panel.
      </p>
    </div>
  );
}
