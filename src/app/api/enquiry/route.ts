import {
  cleanString,
  clientIp,
  fail,
  isHoneypotTripped,
  normalisePhone,
  ok,
  rateLimit,
} from "@/lib/api";
import { getMessagingProvider, notifyTeam } from "@/lib/messaging";
import { getServiceClient } from "@/lib/supabase";

/**
 * General enquiry submission (SRS 8.1 + 10).
 *
 * On every submission the SRS requires three things:
 *   1. the lead is logged to the General Enquiries list;
 *   2. an email alert goes to the client's team;
 *   3. an SMS/WhatsApp confirmation goes to the student (never email - this
 *      form deliberately collects no email address).
 *
 * A lead must never be silently lost, so this only reports success if the lead
 * was captured somewhere. If the database is unreachable but the team alert
 * sends, that counts; if neither works, the visitor is told to call instead.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(ip)) {
    return fail("Too many submissions. Please wait a minute and try again.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("Invalid request.");
  }

  // Silently accept and drop bot submissions so they don't retry.
  if (isHoneypotTripped(body)) return ok({ smsSent: false });

  const full_name = cleanString(body.full_name, 120);
  const phone = normalisePhone(body.phone);
  const branch = cleanString(body.branch, 120);
  const enquiry_for = cleanString(body.enquiry_for, 120);
  const heard_about = cleanString(body.heard_about, 120);
  const source = cleanString(body.source, 160);

  if (full_name.length < 2) return fail("Please enter your name.");
  if (!phone) return fail("Please enter a valid 10-digit mobile number.");

  const lead = { full_name, phone, branch, enquiry_for, heard_about, source };

  let stored = false;
  const supabase = getServiceClient();
  if (supabase) {
    const { error } = await supabase.from("general_enquiries").insert(lead);
    if (error) console.error("[enquiry] insert failed:", error.message);
    else stored = true;
  } else {
    console.warn("[enquiry] Supabase not configured - lead not stored:", lead);
  }

  // Best-effort notifications; neither is allowed to fail the request.
  const alerted = await notifyTeam(`New GATE enquiry: ${full_name}`, [
    `Name: ${full_name}`,
    `Phone: ${phone}`,
    `Branch: ${branch || "-"}`,
    `Enquiry for: ${enquiry_for || "-"}`,
    `Heard about us: ${heard_about || "-"}`,
    `Came from: ${source || "-"}`,
    "",
    stored ? "Saved to the General Enquiries list." : "WARNING: could not be saved to the database.",
  ]);

  if (!stored && !alerted) {
    return fail("We couldn't submit that just now. Please call us and we'll help right away.", 503);
  }

  const messaging = getMessagingProvider();
  let smsSent = false;
  try {
    const result = await messaging.send(
      phone,
      `Thank you for your enquiry with Acumen Gate Academy. Our counsellor will call you within 24 hours. For anything urgent, call us on 098793 87738.`,
    );
    // Only a live provider counts - the stub logs without sending, and the UI
    // must not promise the student a message that was never sent.
    smsSent = result.ok && messaging.isLive;
  } catch (err) {
    console.error("[enquiry] confirmation message failed:", err);
  }

  return ok({ smsSent });
}
