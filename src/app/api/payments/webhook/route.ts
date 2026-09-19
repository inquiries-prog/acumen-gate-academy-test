import { formatInvoiceNumber, canIssueInvoice, renderInvoiceHtml } from "@/lib/invoice";
import { getMessagingProvider, notifyTeam } from "@/lib/messaging";
import { formatRupees, getPaymentProvider } from "@/lib/payments";
import { getServiceClient } from "@/lib/supabase";
import type { Enrollment } from "@/lib/types";

/**
 * Payment gateway webhook (SRS 11.4, 11.5).
 *
 * The webhook - not the browser redirect - is what marks an enrollment paid.
 * A visitor can close the tab before being redirected back, so the redirect is
 * only a UI convenience; this is the authoritative signal.
 *
 * On success: a GST invoice is generated and emailed, an SMS/WhatsApp
 * confirmation goes out, and the row becomes a "Paid Enrollment", which is a
 * distinct list from ordinary leads so the team knows to onboard the student.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();

  // The raw body is required for signature verification - it must be read as
  // text, never re-serialised from a parsed object.
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-razorpay-signature") ?? request.headers.get("x-webhook-signature");

  const result = provider.verifyWebhook(rawBody, signature);
  if (!result.ok || !result.enrollmentId || !result.status) {
    console.warn("[webhook] rejected:", result.reason);
    return new Response(JSON.stringify({ ok: false, error: result.reason ?? "invalid" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = getServiceClient();
  if (!supabase) {
    console.error("[webhook] Supabase not configured - cannot record payment.");
    // 500 so the gateway retries once configuration is fixed.
    return new Response("not configured", { status: 500 });
  }

  const { data: existing, error: readError } = await supabase
    .from("enrollments")
    .select("*")
    .eq("id", result.enrollmentId)
    .maybeSingle();

  if (readError || !existing) {
    console.error("[webhook] unknown enrollment:", result.enrollmentId);
    return new Response("unknown enrollment", { status: 404 });
  }

  const enrollment = existing as Enrollment;

  // Gateways retry webhooks, so this must be idempotent.
  if (enrollment.status === "paid") {
    return Response.json({ ok: true, alreadyProcessed: true });
  }

  if (result.status === "failed") {
    await supabase
      .from("enrollments")
      .update({ status: "failed", payment_ref: result.paymentRef ?? enrollment.payment_ref })
      .eq("id", enrollment.id);

    // Kept as a lead for manual follow-up rather than dropped (SRS 11.5).
    await notifyTeam(`Payment FAILED: ${enrollment.full_name} — ${enrollment.batch_label}`, [
      `Name: ${enrollment.full_name}`,
      `Phone: ${enrollment.phone}`,
      `Email: ${enrollment.email}`,
      `Batch: ${enrollment.batch_label}`,
      "",
      "The student tried to pay and could not. Please call them to help complete it.",
    ]);
    return Response.json({ ok: true });
  }

  // --- Success path ---------------------------------------------------------
  let invoiceNumber = "";
  if (canIssueInvoice()) {
    const { data: seq, error: seqError } = await supabase.rpc("next_invoice_number");
    if (seqError) {
      console.error("[webhook] invoice sequence failed:", seqError.message);
    } else {
      invoiceNumber = formatInvoiceNumber(Number(seq));
    }
  } else {
    // Missing GSTIN / legal name is a launch blocker (SRS 12) - the payment is
    // still recorded, but the team is told the invoice could not be issued.
    console.error("[webhook] GST business details missing - invoice not issued.");
  }

  const paidEnrollment: Enrollment = {
    ...enrollment,
    status: "paid",
    payment_ref: result.paymentRef ?? enrollment.payment_ref,
    invoice_number: invoiceNumber,
  };

  await supabase
    .from("enrollments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_ref: paidEnrollment.payment_ref,
      invoice_number: invoiceNumber,
    })
    .eq("id", enrollment.id);

  if (invoiceNumber) {
    await emailInvoice(paidEnrollment, invoiceNumber);
  }

  const messaging = getMessagingProvider();
  try {
    await messaging.send(
      enrollment.phone,
      `Payment received. Welcome to Acumen Gate Academy! Your enrollment for ${enrollment.batch_label} is confirmed. Your invoice has been emailed to you. Questions? Call 098793 87738.`,
    );
  } catch (err) {
    console.error("[webhook] confirmation message failed:", err);
  }

  await notifyTeam(`PAID ENROLLMENT: ${enrollment.full_name} — ${enrollment.batch_label}`, [
    `Name: ${enrollment.full_name}`,
    `Phone: ${enrollment.phone}`,
    `Email: ${enrollment.email}`,
    `Batch: ${enrollment.batch_label}`,
    `Amount paid: ${formatRupees(Number(enrollment.total_amount))}`,
    `Payment ref: ${paidEnrollment.payment_ref}`,
    invoiceNumber
      ? `Invoice: ${invoiceNumber}`
      : "WARNING: invoice NOT issued - GST business details are not configured.",
    "",
    "Onboard this student - this is a paid enrollment, not an enquiry.",
  ]);

  return Response.json({ ok: true });
}

/** Emails the GST invoice to the student (SRS 11.4). */
async function emailInvoice(enrollment: Enrollment, invoiceNumber: string): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("[webhook] SMTP not configured - invoice not emailed:", invoiceNumber);
    return;
  }
  try {
    const { default: nodemailer } = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: enrollment.email,
      bcc: process.env.LEAD_NOTIFICATION_EMAIL || undefined,
      subject: `Your Acumen Gate Academy tax invoice ${invoiceNumber}`,
      html: renderInvoiceHtml({ enrollment, invoiceNumber, issuedOn: new Date() }),
    });
  } catch (err) {
    console.error("[webhook] invoice email failed:", err);
  }
}
