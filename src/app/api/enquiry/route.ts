import {
  cleanString,
  clientIp,
  fail,
  isHoneypotTripped,
  normalisePhone,
  ok,
  rateLimit,
} from "@/lib/api";
import { notifyTeam, recordMessageOutcome, sendStudentMessage } from "@/lib/messaging";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { after } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * General enquiry submission (SRS 8.1 + 10).
 *
 * On every submission the SRS requires three things:
 *   1. the lead is logged to the General Enquiries list;
 *   2. an email alert goes to the client's team;
 *   3. a WhatsApp confirmation goes to the student (never email - this form
 *      deliberately collects no email address).
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
  let rowId: string | null = null;
  const supabase = getServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from("general_enquiries").insert(lead).select("id").single();
    if (error) console.error("[enquiry] insert failed:", error.message);
    else {
      stored = true;
      rowId = (data as { id: string } | null)?.id ?? null;
    }
  } else {
    console.warn("[enquiry] Supabase not configured - lead not stored:", lead);
  }

  // Team alert. When the lead is safely stored, the email is sent AFTER
  // the response (next/server `after`) so the student isn't kept waiting
  // on an SMTP round-trip. When storing failed, the email is the only copy
  // of the lead, so then we wait for it and use its result.
  const sendAlert = () =>
    notifyTeam(`New GATE enquiry: ${full_name}`, [
    `Name: ${full_name}`,
    `Phone: ${phone}`,
    `Branch: ${branch || "-"}`,
    `Enquiry for: ${enquiry_for || "-"}`,
    `Heard about us: ${heard_about || "-"}`,
    `Came from: ${source || "-"}`,
    "",
    stored ? "Saved to the General Enquiries list." : "WARNING: could not be saved to the database.",
  ]);
  let alerted = false;
  if (stored) after(sendAlert);
  else alerted = await sendAlert();


  if (!stored && !alerted) {
    return fail("We couldn't submit that just now. Please call us and we'll help right away.", 503);
  }

  const topic = branch || enquiry_for || "our GATE and GPSC courses";
  const sent = await sendStudentMessage(phone, {
    kind: "enquiry",
    params: [full_name, topic],
    text: `Hi ${full_name}, thank you for contacting Acumen Gate Academy about ${topic}. Our counsellor will call you on this number within 24 hours. For anything urgent, call ${PHONE_DISPLAY}.`,
  });
  if (supabase && rowId) {
    const id = rowId;
    after(() => recordMessageOutcome(supabase, "general_enquiries", id, sent));
  }

  return ok({ smsSent: sent.delivered, channel: sent.channel });
}
