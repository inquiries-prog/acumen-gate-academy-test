import {
  cleanString,
  clientIp,
  fail,
  isHoneypotTripped,
  normalisePhone,
  ok,
  rateLimit,
} from "@/lib/api";
import { getUniversities } from "@/lib/content";
import { DEFAULT_SEMINAR_OFFER, PHONE_DISPLAY } from "@/lib/defaults";
import { notifyTeam, recordMessageOutcome, sendStudentMessage } from "@/lib/messaging";
import { after } from "next/server";
import { getServiceClient } from "@/lib/supabase";

/**
 * Seminar-attendee submission (SRS 8.2 + 10).
 *
 * Writes to seminar_leads, which is a separate list from general_enquiries and
 * is never merged with it - the client follows the two up differently.
 *
 * The response carries the offer configured for the university the student
 * picked. The offer text is resolved server-side rather than being sent to the
 * browser up front, so the full list of college offers isn't exposed to anyone
 * who opens the form.
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

  if (isHoneypotTripped(body)) return ok({ offer: DEFAULT_SEMINAR_OFFER });

  const full_name = cleanString(body.full_name, 120);
  const mobile = normalisePhone(body.mobile);
  const branch = cleanString(body.branch, 120);
  const university = cleanString(body.university, 160);
  const city = cleanString(body.city, 120);
  const interested_for = cleanString(body.interested_for, 60);

  if (full_name.length < 2) return fail("Please enter your name.");
  if (!mobile) return fail("Please enter a valid 10-digit mobile number.");
  if (!university) return fail("Please select the university where you attended the seminar.");

  const universities = await getUniversities();
  const matched = universities.find((u) => u.name === university);
  const offer = matched?.offer_text?.trim() || DEFAULT_SEMINAR_OFFER;

  const lead = {
    full_name,
    mobile,
    branch,
    university,
    city,
    interested_for,
    // Snapshot the offer as shown, so a later admin edit doesn't rewrite
    // what this student was actually promised.
    offer_shown: offer,
  };

  let stored = false;
  let rowId: string | null = null;
  const supabase = getServiceClient();
  if (supabase) {
    const { data, error } = await supabase.from("seminar_leads").insert(lead).select("id").single();
    if (error) console.error("[seminar] insert failed:", error.message);
    else {
      stored = true;
      rowId = (data as { id: string } | null)?.id ?? null;
    }
  } else {
    console.warn("[seminar] Supabase not configured - lead not stored:", lead);
  }

  const alerted = await notifyTeam(`New seminar lead: ${full_name} (${university})`, [
    `Name: ${full_name}`,
    `Mobile: ${mobile}`,
    `Branch: ${branch || "-"}`,
    `University: ${university}`,
    `City: ${city || "-"}`,
    `Interested for: ${interested_for || "-"}`,
    "",
    stored ? "Saved to the Seminar Leads list." : "WARNING: could not be saved to the database.",
  ]);

  if (!stored && !alerted) {
    return fail("We couldn't submit that just now. Please call us and we'll help right away.", 503);
  }

  // Sent after the response: the student is shown their offer on screen
  // straight away and doesn't wait on the WhatsApp round-trip.
  after(async () => {
    const sent = await sendStudentMessage(mobile, {
      kind: "seminar",
      params: [full_name, university],
      text: `Hi ${full_name}, thank you for attending the Acumen Gate Academy seminar at ${university}. Our team will call you within 24 hours with the details for your college. Questions? Call ${PHONE_DISPLAY}.`,
    });
    if (supabase && rowId) await recordMessageOutcome(supabase, "seminar_leads", rowId, sent);
  });

  return ok({ offer });
}
