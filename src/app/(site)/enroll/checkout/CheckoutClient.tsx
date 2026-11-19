"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { displayPhone, telHref } from "@/lib/utils";

/** What the server hands the browser to open Razorpay Checkout. Never the secret. */
export interface RazorpayCheckout {
  keyId: string;
  orderId: string;
  amountPaise: number;
  description: string;
  prefill: { name: string; email: string; contact: string };
}

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error: { code?: string; description?: string; reason?: string };
}

interface RazorpayInstance {
  open(): void;
  on(event: "payment.failed", cb: (response: RazorpayFailure) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SCRIPT}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("script failed")), { once: true });
    if (!existing) {
      script.src = CHECKOUT_SCRIPT;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

type PayState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "open" }
  | { kind: "verifying" }
  | { kind: "dismissed" }
  | { kind: "error"; message: string };

/**
 * Razorpay Standard Checkout. Opens the payment window as soon as the script
 * loads, and offers a "Pay" button to reopen it if the student closes it.
 * Success is never trusted from the browser: the signed response goes to
 * /api/payments/verify, which checks it before anything is marked paid.
 */
function RazorpayPay({
  enrollmentId,
  providerName,
  config,
}: {
  enrollmentId: string;
  providerName: string;
  config: RazorpayCheckout;
}) {
  const [state, setState] = useState<PayState>({ kind: "loading" });
  const autoOpened = useRef(false);

  const verify = useCallback(
    async (response: RazorpaySuccess) => {
      setState({ kind: "verifying" });
      try {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrollmentId, ...response }),
        });
        const body = (await res.json()) as { ok: boolean; state?: string; error?: string };
        if (!res.ok || !body.ok) throw new Error(body.error || "verification failed");
        // "pending" = genuine payment still being captured; the webhook
        // completes it, so the student sees the confirmation either way.
        window.location.href = `/enroll/status?state=${body.state === "failed" ? "failed" : body.state === "pending" ? "pending" : "paid"}`;
      } catch (err) {
        setState({
          kind: "error",
          message:
            err instanceof Error && err.message !== "verification failed"
              ? err.message
              : "Your payment went through, but we couldn't confirm it automatically. Please don't pay again - call us and we'll sort it out.",
        });
      }
    },
    [enrollmentId],
  );

  const open = useCallback(() => {
    if (!window.Razorpay) return;
    const rzp = new window.Razorpay({
      key: config.keyId,
      amount: config.amountPaise,
      currency: "INR",
      order_id: config.orderId,
      name: "Acumen Gate Academy",
      description: config.description,
      image: `${window.location.origin}/assets/logo/acumen-gate-academy-logo.png`,
      prefill: config.prefill,
      notes: { enrollmentId },
      theme: { color: "#E31E24" },
      handler: (response: RazorpaySuccess) => void verify(response),
      modal: {
        ondismiss: () => setState((s) => (s.kind === "verifying" ? s : { kind: "dismissed" })),
      },
    });
    // Razorpay lets the student retry inside the window, so a failure is
    // shown here but the window stays usable.
    rzp.on("payment.failed", (response) => {
      setState({
        kind: "error",
        message: response.error?.description || "That payment didn't go through. You can try again.",
      });
    });
    setState({ kind: "open" });
    rzp.open();
  }, [config, enrollmentId, verify]);

  useEffect(() => {
    let cancelled = false;
    loadCheckoutScript()
      .then(() => {
        if (cancelled) return;
        setState({ kind: "ready" });
        if (!autoOpened.current) {
          autoOpened.current = true;
          open();
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            kind: "error",
            message: "We couldn't load the secure payment window. Check your connection and try again.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const amount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(config.amountPaise / 100);

  const busy = state.kind === "loading" || state.kind === "verifying" || state.kind === "open";

  return (
    <div className="card p-7 text-center">
      <h1 className="text-xl font-bold">
        {state.kind === "verifying"
          ? "Confirming your payment…"
          : state.kind === "dismissed"
            ? "Payment not completed"
            : "Complete your payment"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-body">
        {config.description} · <span className="font-bold text-charcoal">{amount}</span> incl. GST
      </p>
      <p className="mt-2 text-xs text-muted">
        Payment is handled securely by {providerName === "razorpay" ? "Razorpay" : providerName}.
        We never see your card or UPI details.
      </p>

      {state.kind === "error" && (
        <p className="mt-4 rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
          {state.message}
        </p>
      )}
      {state.kind === "dismissed" && (
        <p className="mt-4 text-sm text-body">
          You closed the payment window. Nothing has been charged.
        </p>
      )}

      {state.kind !== "verifying" && (
        <button type="button" onClick={open} disabled={busy} className="btn-primary mt-6 w-full">
          {state.kind === "loading" ? "Loading secure checkout…" : `Pay ${amount}`}
        </button>
      )}

      <p className="mt-4 text-xs text-muted">
        Trouble paying? Call{" "}
        <a href={telHref(PHONE_DISPLAY)} className="font-bold text-red hover:underline">
          {displayPhone(PHONE_DISPLAY)}
        </a>{" "}
        and we&apos;ll complete your enrollment over the phone.
      </p>
    </div>
  );
}

/**
 * Checkout screen. With Razorpay it renders <RazorpayPay>; with the stub
 * provider it renders a clearly-labelled simulator so no money moves.
 */
export default function CheckoutClient({
  orderId,
  enrollmentId,
  providerName,
  isLive,
  razorpay,
  alreadyPaid,
}: {
  orderId: string;
  enrollmentId: string;
  providerName: string;
  isLive: boolean;
  razorpay: RazorpayCheckout | null;
  alreadyPaid: boolean;
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

  if (alreadyPaid) {
    return (
      <div className="card p-7 text-center">
        <h1 className="text-xl font-bold">This enrollment is already paid</h1>
        <p className="mt-3 text-sm leading-relaxed text-body">
          Nothing more to pay. Your invoice has been emailed to you.
        </p>
        <Link href="/" className="btn-primary mt-5">
          Back to home
        </Link>
      </div>
    );
  }

  if (isLive) {
    if (!razorpay) {
      return (
        <div className="card p-7 text-center">
          <h1 className="text-xl font-bold">This payment link has expired</h1>
          <p className="mt-3 text-sm leading-relaxed text-body">
            Please start again from the batch you want to join, or call us on{" "}
            <a href={telHref(PHONE_DISPLAY)} className="font-bold text-red hover:underline">
              {displayPhone(PHONE_DISPLAY)}
            </a>{" "}
            and we&apos;ll complete your enrollment over the phone.
          </p>
          <Link href="/" className="btn-primary mt-5">
            Back to home
          </Link>
        </div>
      );
    }
    return <RazorpayPay enrollmentId={enrollmentId} providerName={providerName} config={razorpay} />;
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
