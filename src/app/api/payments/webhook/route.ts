import { markEnrollmentFailed, markEnrollmentPaid } from "@/lib/enrollment-completion";
import { getPaymentProvider, toPaise } from "@/lib/payments";
import { getServiceClient } from "@/lib/supabase";
import type { Enrollment } from "@/lib/types";

/**
 * Payment gateway webhook (SRS 11.4, 11.5).
 *
 * The signed hand-back from checkout (/api/payments/verify) usually marks the
 * enrollment paid first. This is the backstop: a student can close the tab
 * the moment they pay, and the webhook still arrives. Both paths go through
 * markEnrollmentPaid, which only lets one of them win.
 *
 * Razorpay setup: Dashboard -> Account & Settings -> Webhooks, URL
 * https://<domain>/api/payments/webhook, events order.paid, payment.captured
 * and payment.failed, secret = PAYMENT_WEBHOOK_SECRET.
 *
 * Razorpay retries any non-2xx for 24 hours and then disables the webhook, so
 * a 4xx is only returned for requests that genuinely fail verification.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();

  // The raw body is required for signature verification - it must be read as
  // text, never re-serialised from a parsed object.
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-razorpay-signature") ?? request.headers.get("x-webhook-signature");

  const result = provider.verifyWebhook(rawBody, signature);
  if (!result.ok) {
    console.warn("[webhook] rejected:", result.reason);
    return Response.json({ ok: false, error: result.reason ?? "invalid" }, { status: 400 });
  }
  if (result.ignored || !result.status) {
    return Response.json({ ok: true, ignored: true });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    console.error("[webhook] Supabase not configured - cannot record payment.");
    // 500 so the gateway retries once configuration is fixed.
    return new Response("not configured", { status: 500 });
  }

  // Find the enrollment: by the id we put in the order notes, or failing
  // that by the gateway order id stored when the order was created.
  let enrollment: Enrollment | null = null;
  if (result.enrollmentId) {
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("id", result.enrollmentId)
      .maybeSingle();
    enrollment = (data as Enrollment | null) ?? null;
  }
  if (!enrollment && result.orderId) {
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("payment_ref", result.orderId)
      .maybeSingle();
    enrollment = (data as Enrollment | null) ?? null;
  }

  if (!enrollment) {
    // Not ours (e.g. a payment taken some other way on the same Razorpay
    // account). Acknowledge it so the gateway doesn't retry for a day.
    console.warn("[webhook] no matching enrollment:", result.enrollmentId, result.orderId);
    return Response.json({ ok: true, unmatched: true });
  }

  if (enrollment.status === "paid") {
    return Response.json({ ok: true, alreadyProcessed: true });
  }

  if (result.status === "failed") {
    await markEnrollmentFailed(supabase, enrollment, result.reason);
    return Response.json({ ok: true });
  }

  // A paid amount that doesn't match what we charged means something is
  // wrong - record nothing automatically and make sure a human looks.
  if (
    result.amountPaise !== undefined &&
    result.amountPaise !== toPaise(Number(enrollment.total_amount))
  ) {
    console.error(
      `[webhook] amount mismatch for ${enrollment.id}: paid ${result.amountPaise} paise, expected ${toPaise(Number(enrollment.total_amount))}`,
    );
    return Response.json({ ok: true, amountMismatch: true });
  }

  try {
    await markEnrollmentPaid(supabase, enrollment, result.paymentRef ?? "");
  } catch (err) {
    console.error("[webhook] could not record payment:", err);
    return new Response("could not record payment", { status: 500 });
  }
  return Response.json({ ok: true });
}
