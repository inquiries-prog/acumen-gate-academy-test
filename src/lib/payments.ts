/**
 * Payment provider adapter (SRS 11).
 *
 * The gateway is still undecided (SRS 12 flags it as a blocking dependency).
 * Everything else in the enrollment flow - the form, the GST summary, invoice
 * numbering, the Paid Enrollment list, abandoned-payment capture - is built
 * against this interface, so choosing a provider later is a config change plus
 * one adapter, not a rewrite.
 *
 * PAYMENT_PROVIDER=stub   -> no money moves; a local checkout page lets you
 *                            walk the success and failure paths end to end.
 * PAYMENT_PROVIDER=razorpay -> real Razorpay orders + webhook verification.
 *                            Written to spec but NOT yet verified against a
 *                            live account, since no credentials exist (SRS 12).
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
  enrollmentId?: string;
  paymentRef?: string;
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

const razorpayProvider: PaymentProvider = {
  name: "razorpay",
  isLive: true,
  async createOrder(input) {
    const keyId = process.env.PAYMENT_KEY_ID ?? "";
    const keySecret = process.env.PAYMENT_KEY_SECRET ?? "";
    if (!keyId || !keySecret) throw new Error("Razorpay credentials are not configured.");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        // Razorpay works in paise.
        amount: Math.round(input.amountInRupees * 100),
        currency: "INR",
        receipt: input.enrollmentId,
        notes: {
          enrollmentId: input.enrollmentId,
          name: input.customerName,
          phone: input.customerPhone,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Razorpay order creation failed (${res.status}): ${await res.text()}`);
    }
    const order = (await res.json()) as { id: string };
    return {
      providerOrderId: order.id,
      // Checkout is mounted client-side with this order id (hosted/tokenised
      // checkout only - we never touch card data, per SRS 14 security).
      checkoutUrl: `/enroll/checkout?order=${order.id}&enrollment=${input.enrollmentId}`,
      provider: "razorpay",
    };
  },
  verifyWebhook(rawBody, signature) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET ?? "";
    if (!secret) return { ok: false, reason: "webhook secret not configured" };
    if (!signature) return { ok: false, reason: "missing signature" };

    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      return { ok: false, reason: "signature mismatch" };
    }

    try {
      const body = JSON.parse(rawBody) as {
        event?: string;
        payload?: {
          payment?: { entity?: { id?: string; notes?: { enrollmentId?: string } } };
        };
      };
      const entity = body.payload?.payment?.entity;
      const enrollmentId = entity?.notes?.enrollmentId;
      if (!enrollmentId) return { ok: false, reason: "no enrollmentId in notes" };

      if (body.event === "payment.captured") {
        return { ok: true, enrollmentId, paymentRef: entity?.id, status: "paid" };
      }
      if (body.event === "payment.failed") {
        return { ok: true, enrollmentId, paymentRef: entity?.id, status: "failed" };
      }
      return { ok: false, reason: `unhandled event ${body.event}` };
    } catch {
      return { ok: false, reason: "invalid json" };
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
 * GST is shown as a separate line and added on top of the batch fee (SRS 11.2).
 * Rounded to paise to avoid float drift on an amount that ends up on a tax
 * invoice.
 */
export function calculateFees(feeInRupees: number, gstRatePercent?: number): FeeBreakdown {
  const rate = gstRatePercent ?? Number(process.env.GST_RATE_PERCENT ?? 18);
  const fee = round2(feeInRupees);
  const gst = round2((fee * rate) / 100);
  return { fee, gstRate: rate, gst, total: round2(fee + gst) };
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
