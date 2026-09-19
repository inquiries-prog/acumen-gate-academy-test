import {
  cleanMultiline,
  cleanString,
  clientIp,
  fail,
  isValidEmail,
  normalisePhone,
  ok,
  rateLimit,
} from "@/lib/api";
import { getBatches, getBranches } from "@/lib/content";
import { notifyTeam } from "@/lib/messaging";
import { calculateFees, getPaymentProvider } from "@/lib/payments";
import { getServiceClient } from "@/lib/supabase";

/**
 * Starts an enrollment (SRS 11).
 *
 * The row is written with status "initiated" BEFORE the visitor is sent to the
 * gateway. That is deliberate: SRS 11.5 requires an abandoned or failed payment
 * to still be captured as a lead the team can follow up, so the details must
 * exist server-side before the visitor leaves the site.
 *
 * The fee is read from the batch record on the server and never trusted from
 * the browser - otherwise the amount charged could be tampered with.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip)) {
    return fail("Too many attempts. Please wait a minute and try again.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("Invalid request.");
  }

  const full_name = cleanString(body.full_name, 120);
  const phone = normalisePhone(body.phone);
  const email = cleanString(body.email, 160).toLowerCase();
  const billing_address = cleanMultiline(body.billing_address, 600);
  const batch_id = cleanString(body.batch_id, 80);

  if (full_name.length < 2) return fail("Please enter your name.");
  if (!phone) return fail("Please enter a valid 10-digit mobile number.");
  if (!isValidEmail(email)) return fail("Please enter a valid email address for your invoice.");
  if (billing_address.length < 8) return fail("Please enter your billing address for the GST invoice.");

  // Authoritative fee lookup - server-side only.
  const [batches, branches] = await Promise.all([getBatches(), getBranches()]);
  const batch = batches.find((b) => b.id === batch_id);
  if (!batch || !batch.visible || !batch.enroll_enabled) {
    return fail("That batch isn't open for online enrollment right now. Please call us.", 409);
  }

  const branch = branches.find((b) => b.id === batch.branch_id);
  const batch_label = `${branch?.name ?? "GATE"} (${branch?.code ?? "-"}) ${
    batch.mode === "offline" ? "Offline" : "Online"
  }`;

  const feeValue = Number(batch.fees ?? 0);
  if (!feeValue || feeValue <= 0) {
    return fail("Fees for this batch aren't published yet. Please call us to enroll.", 409);
  }
  const fees = calculateFees(feeValue);

  const supabase = getServiceClient();
  if (!supabase) {
    // Taking money without being able to record the enrollment would be worse
    // than refusing, so this fails loudly rather than proceeding.
    console.error("[enroll] Supabase not configured - refusing to start a payment.");
    return fail("Online enrollment is temporarily unavailable. Please call us to enroll.", 503);
  }

  const { data: created, error } = await supabase
    .from("enrollments")
    .insert({
      batch_id: batch.id,
      batch_label,
      full_name,
      phone,
      email,
      billing_address,
      fee_amount: fees.fee,
      gst_amount: fees.gst,
      total_amount: fees.total,
      gst_rate: fees.gstRate,
      status: "initiated",
      provider: getPaymentProvider().name,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[enroll] insert failed:", error?.message);
    return fail("We couldn't start the payment. Please call us and we'll help.", 503);
  }

  const provider = getPaymentProvider();
  try {
    const order = await provider.createOrder({
      amountInRupees: fees.total,
      enrollmentId: created.id as string,
      customerName: full_name,
      customerEmail: email,
      customerPhone: phone,
      description: batch_label,
    });

    await supabase
      .from("enrollments")
      .update({ payment_ref: order.providerOrderId })
      .eq("id", created.id);

    // Alerts the team immediately, so an abandoned payment is visible even
    // before anyone opens the dashboard.
    await notifyTeam(`Enrollment started: ${full_name} — ${batch_label}`, [
      `Name: ${full_name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Batch: ${batch_label}`,
      `Total payable: ${fees.total}`,
      `Status: payment started (not yet paid)`,
    ]);

    return ok({ checkoutUrl: order.checkoutUrl, enrollmentId: created.id });
  } catch (err) {
    console.error("[enroll] order creation failed:", err);
    await supabase.from("enrollments").update({ status: "failed" }).eq("id", created.id);
    return fail("We couldn't reach the payment gateway. Please call us and we'll help.", 502);
  }
}
