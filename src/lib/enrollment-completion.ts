/**
 * What happens once a payment's outcome is known (SRS 11.4, 11.5).
 *
 * Two independent signals can report the same payment: the gateway webhook
 * and the browser's signed hand-back after checkout (/api/payments/verify).
 * Either may arrive first, or both at once, so marking an enrollment paid is
 * a conditional update that only one caller can win. Only the winner issues
 * the invoice number, emails the invoice and sends the confirmation, so a
 * student can never get two invoices or burn two sequential invoice numbers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { canIssueInvoice, formatInvoiceNumber, renderInvoiceHtml } from "@/lib/invoice";
import { getMessagingProvider, notifyTeam } from "@/lib/messaging";
import { formatRupees } from "@/lib/payments";
import type { Enrollment } from "@/lib/types";

/**
 * Marks the enrollment paid and runs the success side effects exactly once.
 * Returns false when another caller had already marked it paid.
 */
export async function markEnrollmentPaid(
  supabase: SupabaseClient,
  enrollment: Enrollment,
  paymentRef: string,
): Promise<boolean> {
  // The claim: only a row that is not yet "paid" is updated, and only the
  // caller that gets a row back carries on.
  const { data: claimed, error: claimError } = await supabase
    .from("enrollments")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      payment_ref: paymentRef || enrollment.payment_ref,
    })
    .eq("id", enrollment.id)
    .neq("status", "paid")
    .select("id");

  if (claimError) throw new Error(`Could not mark enrollment paid: ${claimError.message}`);
  if (!claimed || claimed.length === 0) return false;

  let invoiceNumber = "";
  if (canIssueInvoice()) {
    const { data: seq, error: seqError } = await supabase.rpc("next_invoice_number");
    if (seqError) {
      console.error("[payment] invoice sequence failed:", seqError.message);
    } else {
      invoiceNumber = formatInvoiceNumber(Number(seq));
      await supabase
        .from("enrollments")
        .update({ invoice_number: invoiceNumber })
        .eq("id", enrollment.id);
    }
  } else {
    // Missing GSTIN / legal name is a launch blocker (SRS 12) - the payment is
    // still recorded, but the team is told the invoice could not be issued.
    console.error("[payment] GST business details missing - invoice not issued.");
  }

  const paid: Enrollment = {
    ...enrollment,
    status: "paid",
    payment_ref: paymentRef || enrollment.payment_ref,
    invoice_number: invoiceNumber,
  };

  if (invoiceNumber) await emailInvoice(paid, invoiceNumber);

  try {
    await getMessagingProvider().send(
      enrollment.phone,
      `Payment received. Welcome to Acumen Gate Academy! Your enrollment for ${enrollment.batch_label} is confirmed. Your invoice has been emailed to you. Questions? Call 098793 87738.`,
    );
  } catch (err) {
    console.error("[payment] confirmation message failed:", err);
  }

  await notifyTeam(`PAID ENROLLMENT: ${enrollment.full_name} — ${enrollment.batch_label}`, [
    `Name: ${enrollment.full_name}`,
    `Phone: ${enrollment.phone}`,
    `Email: ${enrollment.email}`,
    `Batch: ${enrollment.batch_label}`,
    `Amount paid: ${formatRupees(Number(enrollment.total_amount))}`,
    `Payment ref: ${paid.payment_ref}`,
    invoiceNumber
      ? `Invoice: ${invoiceNumber}`
      : "WARNING: invoice NOT issued - GST business details are not configured.",
    "",
    "Onboard this student - this is a paid enrollment, not an enquiry.",
  ]);

  return true;
}

/**
 * Records a failed attempt and alerts the team (SRS 11.5).
 *
 * payment_ref is left alone on purpose: it still holds the gateway order id,
 * and the student can retry inside the same checkout window. Overwriting it
 * would stop that retry's success from matching the enrollment.
 */
export async function markEnrollmentFailed(
  supabase: SupabaseClient,
  enrollment: Enrollment,
  reason?: string,
): Promise<void> {
  const { data: updated } = await supabase
    .from("enrollments")
    .update({ status: "failed" })
    .eq("id", enrollment.id)
    .eq("status", "initiated")
    .select("id");

  // Only alert on the first failure, not on every retry the student makes.
  if (!updated || updated.length === 0) return;

  await notifyTeam(`Payment FAILED: ${enrollment.full_name} — ${enrollment.batch_label}`, [
    `Name: ${enrollment.full_name}`,
    `Phone: ${enrollment.phone}`,
    `Email: ${enrollment.email}`,
    `Batch: ${enrollment.batch_label}`,
    ...(reason ? [`Gateway reason: ${reason}`] : []),
    "",
    "The student tried to pay and could not. Please call them to help complete it.",
  ]);
}

/** Emails the GST invoice to the student (SRS 11.4). */
async function emailInvoice(enrollment: Enrollment, invoiceNumber: string): Promise<void> {
  if (!process.env.SMTP_HOST) {
    console.warn("[payment] SMTP not configured - invoice not emailed:", invoiceNumber);
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
    console.error("[payment] invoice email failed:", err);
  }
}
