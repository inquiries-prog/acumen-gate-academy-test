/**
 * Payment provider adapter (SRS 11).
 *
 * The gateway is Razorpay (chosen Nov 2026). Everything else in the enrollment
 * flow - the form, the GST summary, invoice numbering, the Paid Enrollment
 * list, abandoned-payment capture - is built against this interface, so the
 * provider is a config switch rather than something woven through the code.
 *
 * PAYMENT_PROVIDER=stub   -> no money moves; a local checkout page lets you
 *                            walk the success and failure paths end to end.
 * PAYMENT_PROVIDER=razorpay -> Razorpay Standard Checkout: server-side orders,
 *                            checkout.js on /enroll/checkout, a signature-checked
 *                            hand-back (/api/payments/verify) and the webhook.
 */

import crypto from "node:crypto";

export interface CreateOrderInput {
  /** Total payable including GST, in rupees. */
  amountInRupees: number;
  /** Our enrollment id - carried through so the webhook can find the row. */
  enrollmentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
}

export interface CreateOrderResult {
  providerOrderId: string;
  /** Where to send the visitor to pay. */
  checkoutUrl: string;
  provider: string;
}

export interface WebhookResult {
  ok: boolean;
  /** Verified, but not an event we act on - acknowledge with a 2xx. */
  ignored?: boolean;
  enrollmentId?: string;
  /** Gateway order id - the fallback for finding the enrollment. */
  orderId?: string;
  paymentRef?: string;
  /** Amount the gateway says was paid, in paise, when it reports one. */
  amountPaise?: number;
  status?: "paid" | "failed";
  reason?: string;
}

export interface PaymentProvider {
  readonly name: string;
  /** False when the provider is a stand-in and cannot take real money. */
  readonly isLive: boolean;
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  verifyWebhook(rawBody: string, signature: string | null): WebhookResult;
}

// --- Stub -----------------------------------------------------------------

const stubProvider: PaymentProvider = {
  name: "stub",
  isLive: false,
  async createOrder(input) {
    const providerOrderId = `stub_${crypto.randomBytes(8).toString("hex")}`;
    return {
      providerOrderId,
      // A local page that mimics a hosted checkout, so QA can exercise both
      // the success and the failure/abandonment branches of SRS 11.4 / 11.5.
      checkoutUrl: `/enroll/checkout?order=${providerOrderId}&enrollment=${input.enrollmentId}`,
      provider: "stub",
    };
  },
  verifyWebhook(rawBody) {
    try {
      const body = JSON.parse(rawBody) as {
        enrollmentId?: string;
        paymentRef?: string;
        status?: "paid" | "failed";
      };
      if (!body.enrollmentId || !body.status) return { ok: false, reason: "missing fields" };
      return {
        ok: true,
        enrollmentId: body.enrollmentId,
        paymentRef: body.paymentRef ?? `stub_pay_${Date.now()}`,
        status: body.status,
      };
    } catch {
      return { ok: false, reason: "invalid json" };
    }
  },
};

// --- Razorpay -------------------------------------------------------------
//
// Standard Checkout, per Razorpay's integration steps:
//   1. Server creates an Order (amount in paise) - createOrder below.
//   2. /enroll/checkout opens checkout.js with that order_id.
//   3. The browser posts razorpay_payment_id / _order_id / _signature to
//      /api/payments/verify, which checks the signature against the order id
//      WE stored (never the one the browser sends) and confirms the payment
//      with Razorpay's API before marking it paid.
//   4. The webhook (order.paid / payment.captured / payment.failed) is the
//      backstop for a student who closes the tab before step 3 completes.

const RAZORPAY_API = "https://api.razorpay.com/v1";

function razorpayAuthHeader(): string {
  const keyId = process.env.PAYMENT_KEY_ID ?? "";
  const keySecret = process.env.PAYMENT_KEY_SECRET ?? "";
  if (!keyId || !keySecret) throw new Error("Razorpay credentials are not configured.");
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

/** Constant-time comparison of two hex signatures. */
function signaturesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Rupees to paise, the unit Razorpay works in. */
export function toPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

/**
 * Checks the signature Checkout hands back after a successful payment:
 * HMAC-SHA256 of "<order_id>|<payment_id>" keyed with the API key secret.
 * `orderId` must be the one stored server-side when the order was created.
 */
export function verifyRazorpayCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const secret = process.env.PAYMENT_KEY_SECRET ?? "";
  if (!secret || !orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return signaturesMatch(expected, signature);
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  /** created | authorized | captured | refunded | failed */
  status: string;
}

/** Reads a payment back from Razorpay, so we never rely on the browser alone. */
export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPayment> {
  const res = await fetch(`${RAZORPAY_API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: razorpayAuthHeader() },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Razorpay payment lookup failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as RazorpayPayment;
}

type RazorpayNotes = { enrollmentId?: string } | unknown[];

interface RazorpayWebhookBody {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        amount?: number;
        error_description?: string;
        notes?: RazorpayNotes;
      };
    };
    order?: { entity?: { id?: string; notes?: RazorpayNotes } };
  };
}

/** Razorpay sends empty notes as [] rather than {}. */
function noteEnrollmentId(notes: RazorpayNotes | undefined): string | undefined {
  return notes && !Array.isArray(notes) ? notes.enrollmentId : undefined;
}

const razorpayProvider: PaymentProvider = {
  name: "razorpay",
  isLive: true,
  async createOrder(input) {
    const res = await fetch(`${RAZORPAY_API}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: razorpayAuthHeader(),
      },
      body: JSON.stringify({
        amount: toPaise(input.amountInRupees),
        currency: "INR",
        // Razorpay caps receipt at 40 characters; a uuid is 36.
        receipt: input.enrollmentId.slice(0, 40),
        // Max 15 keys, 256 characters each.
        notes: {
          enrollmentId: input.enrollmentId,
          name: input.customerName.slice(0, 256),
          phone: input.customerPhone,
          batch: input.description.slice(0, 256),
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay order creation failed (${res.status}): ${await res.text()}`);
    }
    const order = (await res.json()) as { id: string };
    return {
      providerOrderId: order.id,
      // Checkout.js is mounted on this page with the order id - card and UPI
      // details go straight to Razorpay, never through us (SRS 14).
      checkoutUrl: `/enroll/checkout?order=${order.id}&enrollment=${input.enrollmentId}`,
      provider: "razorpay",
    };
  },
  verifyWebhook(rawBody, signature) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "";
    if (!secret) return { ok: false, reason: "webhook secret not configured" };
    if (!signature) return { ok: false, reason: "missing signature" };

    // Signed over the raw body exactly as received - never re-serialised.
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (!signaturesMatch(expected, signature)) {
      return { ok: false, reason: "signature mismatch" };
    }

    let body: RazorpayWebhookBody;
    try {
      body = JSON.parse(rawBody) as RazorpayWebhookBody;
    } catch {
      return { ok: false, reason: "invalid json" };
    }

    const payment = body.payload?.payment?.entity;
    const order = body.payload?.order?.entity;
    const base = {
      ok: true,
      enrollmentId: noteEnrollmentId(order?.notes) ?? noteEnrollmentId(payment?.notes),
      orderId: order?.id ?? payment?.order_id,
      paymentRef: payment?.id,
      amountPaise: payment?.amount,
    };

    switch (body.event) {
      case "order.paid":
      case "payment.captured":
        return { ...base, status: "paid" };
      case "payment.failed":
        return { ...base, status: "failed", reason: payment?.error_description };
      default:
        // Acknowledged but ignored. Answering non-2xx would make Razorpay
        // retry for 24 hours and then disable the webhook.
        return { ok: true, ignored: true, reason: `unhandled event ${body.event}` };
    }
  },
};

export function getPaymentProvider(): PaymentProvider {
  switch ((process.env.PAYMENT_PROVIDER ?? "stub").toLowerCase()) {
    case "razorpay":
      return razorpayProvider;
    default:
      return stubProvider;
  }
}

// --- GST (SRS 11.2, 11.3) -------------------------------------------------

export interface FeeBreakdown {
  fee: number;
  gstRate: number;
  gst: number;
  total: number;
}

/**
 * The batch fee is GST-INCLUSIVE: it is exactly what the student pays (client
 * decision, Nov 2026 - ₹15,000 online / ₹45,000 offline). GST is still shown
 * as a separate line (SRS 11.2) by splitting it back out of the total:
 *   base = total × 100 / (100 + rate), GST = total − base.
 * GST is taken as the remainder so base + GST always equals the total to the
 * paisa, which matters on a tax invoice.
 */
export function calculateFees(feeInRupees: number, gstRatePercent?: number): FeeBreakdown {
  const rate = gstRatePercent ?? Number(process.env.GST_RATE_PERCENT ?? 18);
  const total = round2(feeInRupees);
  const fee = round2((total * 100) / (100 + rate));
  return { fee, gstRate: rate, gst: round2(total - fee), total };
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

/** True once the client has supplied the details a legal GST invoice needs. */
export function gstDetailsConfigured(): boolean {
  return Boolean(process.env.BUSINESS_GSTIN && process.env.BUSINESS_LEGAL_NAME);
}
