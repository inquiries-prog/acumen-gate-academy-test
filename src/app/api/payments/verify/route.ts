import { clientIp, fail, ok, rateLimit } from "@/lib/api";
import { markEnrollmentPaid } from "@/lib/enrollment-completion";
import {
  env,
  fetchRazorpayPayment,
  getPaymentProvider,
  gstDetailsConfigured,
  toPaise,
  verifyRazorpayCheckoutSignature,
} from "@/lib/payments";
import { getServiceClient } from "@/lib/supabase";
import type { Enrollment } from "@/lib/types";

/**
 * Razorpay Checkout hand-back (SRS 11.4).
 *
 * After a successful payment, checkout.js gives the browser
 * razorpay_payment_id, razorpay_order_id and razorpay_signature. The browser
 * posts them here and we:
 *   1. check the signature against the order id WE stored for this
 *      enrollment - never the one the browser sent - so a payment for a
 *      different (cheaper) order cannot be replayed against this one;
 *   2. read the payment back from Razorpay and confirm it is captured, for
 *      this order, for the full amount;
 *   3. mark the enrollment paid (shared with the webhook; only one wins).
 *
 * Responds { state: "paid" | "pending" }. "pending" means the payment is
 * genuine but not yet captured - the webhook will finish the job.
 */
/**
 * Configuration check, for confirming a deployment picked up its settings.
 * Reports only which provider is active and yes/no flags - never a value.
 * (The Key ID's test/live prefix is public anyway: Checkout sends it to
 * every visitor's browser.)
 */
export async function GET() {
  const keyId = env("PAYMENT_KEY_ID");
  return Response.json({
    provider: getPaymentProvider().name,
    keyMode: keyId.startsWith("rzp_live_") ? "live" : keyId.startsWith("rzp_test_") ? "test" : keyId ? "unknown" : "missing",
    keySecretSet: Boolean(env("PAYMENT_KEY_SECRET")),
    webhookSecretSet: Boolean(env("PAYMENT_WEBHOOK_SECRET")),
    gstDetailsSet: gstDetailsConfigured(),
  });
}

export async function POST(request: Request) {
  if (!rateLimit(clientIp(request))) {
    return fail("Too many attempts. Please wait a minute.", 429);
  }
  if (getPaymentProvider().name !== "razorpay") {
    return fail("Not available.", 404);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("Invalid request.");
  }

  const enrollmentId = String(body.enrollmentId ?? "");
  const paymentId = String(body.razorpay_payment_id ?? "");
  const signature = String(body.razorpay_signature ?? "");
  if (!enrollmentId || !paymentId || !signature) return fail("Missing payment details.");

  const supabase = getServiceClient();
  if (!supabase) return fail("Payment could not be recorded. Please call us.", 503);

  const { data } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", enrollmentId)
    .maybeSingle();
  const enrollment = data as Enrollment | null;
  if (!enrollment) return fail("Enrollment not found.", 404);

  // The webhook got there first.
  if (enrollment.status === "paid") return ok({ state: "paid" });

  const orderId = enrollment.payment_ref;
  if (!verifyRazorpayCheckoutSignature(orderId, paymentId, signature)) {
    console.warn("[verify] signature mismatch for enrollment", enrollmentId);
    return fail("We couldn't verify this payment. Please call us.", 400);
  }

  let payment;
  try {
    payment = await fetchRazorpayPayment(paymentId);
  } catch (err) {
    // Signature was valid, so the payment is real; the webhook will record it.
    console.error("[verify] payment lookup failed:", err);
    return ok({ state: "pending" });
  }

  if (payment.order_id !== orderId) {
    console.error("[verify] payment belongs to a different order:", paymentId);
    return fail("We couldn't verify this payment. Please call us.", 400);
  }
  if (payment.amount !== toPaise(Number(enrollment.total_amount))) {
    console.error(
      `[verify] amount mismatch for ${enrollmentId}: paid ${payment.amount}, expected ${toPaise(Number(enrollment.total_amount))}`,
    );
    return fail("The amount paid doesn't match. Our team will contact you.", 400);
  }
  if (payment.status !== "captured") {
    // "authorized" with auto-capture on becomes "captured" within moments;
    // the webhook records it. Anything else is not a success.
    return ok({ state: payment.status === "authorized" ? "pending" : "failed" });
  }

  try {
    await markEnrollmentPaid(supabase, enrollment, payment.id);
  } catch (err) {
    console.error("[verify] could not record payment:", err);
    return ok({ state: "pending" });
  }
  return ok({ state: "paid" });
}
