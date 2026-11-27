import {
  cleanString,
  clientIp,
  fail,
  isHoneypotTripped,
  normalisePhone,
  ok,
  rateLimit,
} from "@/lib/api";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { notifyTeam, recordMessageOutcome, sendStudentMessage } from "@/lib/messaging";
import { after } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * Free demo class registration.
 *
 * Its own lead list (demo_registrations), separate from general enquiries and
 * seminar leads, because a demo booking is followed up differently: the team
 * calls to confirm a date and time rather than to answer a question.
 *
 * Same guarantees as the enquiry form: the lead is only reported as received
 * if it was stored or the team alert went out, and the student is only told a
 * confirmation message was sent when one actually was.
 */
export async function POST(request: Request) {
  if (!rateLimit(clientIp(request))) {
    return fail("Too many submissions. Please wait a minute and try again.", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail("Invalid request.");
  }

  if (isHoneypotTripped(body)) return ok({ smsSent: false });

  const full_name = cleanString(body.full_name, 120);
  const phone = normalisePhone(body.phone);
  const branch = cleanString(body.branch, 120);
  const mode = cleanString(body.mode, 120);
  const preferred_slot = cleanString(body.preferred_slot, 160);
  const source = cleanString(body.source, 160);

  if (full_name.length < 2) return fail("Please enter your name.");
  if (!phone) return fail("Please enter a valid 10-digit mobile number.");
  if (!branch) return fail("Please choose your branch.");

  const lead = { full_name, phone, branch, mode, preferred_slot, source };

  let stored = false;
  let rowId: string | null = null;
  const supabase = getServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from("demo_registrations").insert(lead).select("id").single();
    if (error) console.error("[demo] insert failed:", error.message);
    else {
      stored = true;
      rowId = (data as { id: string } | null)?.id ?? null;
    }
  } else {
    console.warn("[demo] Supabase not configured - registration not stored:", lead);
  }

  // Team alert. When the lead is safely stored, the email is sent AFTER
  // the response (next/server `after`) so the student isn't kept waiting
  // on an SMTP round-trip. When storing failed, the email is the only copy
  // of the lead, so then we wait for it and use its result.
  const sendAlert = () =>
    notifyTeam(`Free demo booked: ${full_name}`, [
    `Name: ${full_name}`,
    `Phone: ${phone}`,
    `Branch: ${branch}`,
    `Demo mode: ${mode || "-"}`,
    `Preferred time: ${preferred_slot || "-"}`,
    `Came from: ${source || "-"}`,
    "",
    stored
      ? "Saved to the Free demo registrations list. Please call to confirm the date and time."
      : "WARNING: could not be saved to the database.",
  ]);
  let alerted = false;
  if (stored) after(sendAlert);
  else alerted = await sendAlert();


  if (!stored && !alerted) {
    return fail("We couldn't book that just now. Please call us and we'll book you in right away.", 503);
  }

  const demoMode = mode || "Online or classroom";
  const slot = preferred_slot || "Any time";
  const sent = await sendStudentMessage(phone, {
    kind: "demo",
    params: [full_name, branch, demoMode, slot],
    text: `Hi ${full_name}, your free demo class request for ${branch} (${demoMode}) has been received. Preferred slot: ${slot}. Our team will call you to confirm the date and time. Questions? Call ${PHONE_DISPLAY}.`,
  });
  if (supabase && rowId) {
    const id = rowId;
    after(() => recordMessageOutcome(supabase, "demo_registrations", id, sent));
  }

  return ok({ smsSent: sent.delivered, channel: sent.channel });
}
