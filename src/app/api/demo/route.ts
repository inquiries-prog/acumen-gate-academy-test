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
import { getMessagingProvider, notifyTeam } from "@/lib/messaging";
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
  const supabase = getServiceClient();
  if (supabase) {
    const { error } = await supabase.from("demo_registrations").insert(lead);
    if (error) console.error("[demo] insert failed:", error.message);
    else stored = true;
  } else {
    console.warn("[demo] Supabase not configured - registration not stored:", lead);
  }

  const alerted = await notifyTeam(`Free demo booked: ${full_name}`, [
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

  if (!stored && !alerted) {
    return fail("We couldn't book that just now. Please call us and we'll book you in right away.", 503);
  }

  const messaging = getMessagingProvider();
  let smsSent = false;
  try {
    const result = await messaging.send(
      phone,
      `Thank you for booking a free GATE demo class with Acumen Gate Academy. Our team will call you to confirm the date and time. Questions? Call ${PHONE_DISPLAY}.`,
    );
    smsSent = result.ok && messaging.isLive;
  } catch (err) {
    console.error("[demo] confirmation message failed:", err);
  }

  return ok({ smsSent });
}
