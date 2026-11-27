/**
 * Student confirmations (SRS 10.2) and lead-alert email.
 *
 * Neither enquiry form collects an email address (SRS 8.1), so the student's
 * confirmation goes by WhatsApp (or SMS). Nothing else in the codebase knows
 * which provider is in use: callers describe WHAT happened (an enquiry, a demo
 * booking...) and the provider decides how to say it.
 *
 * WhatsApp (MESSAGING_PROVIDER=meta) uses the Meta Cloud API directly and
 * sends approved TEMPLATES, because Meta does not allow free text as the first
 * message to someone. The templates live in the academy's WhatsApp Manager;
 * the variables and buttons below must match them exactly.
 *
 * Replies do not come back here. The academy's existing Google Apps Script
 * webhook owns the WhatsApp number's replies and button taps, and answers the
 * buttons by their payload text - so the button payloads below must stay equal
 * to the keys of BUTTON_REPLIES in that script.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** What happened, which decides the template. */
export type MessageKind = "enquiry" | "demo" | "seminar" | "enrollment";

export interface StudentMessage {
  kind: MessageKind;
  /** Template variables {{1}}, {{2}}... in order. */
  params: string[];
  /** The same message as plain text, for SMS providers and the dev log. */
  text: string;
}

export interface SendResult {
  ok: boolean;
  /** Meta's message id (wamid...), when the provider returns one. */
  messageId?: string;
  detail?: string;
  /** Deliberately not sent (template switched off) - not an error. */
  skipped?: boolean;
}

export interface MessagingProvider {
  readonly name: string;
  readonly isLive: boolean;
  readonly channel: "whatsapp" | "sms" | "none";
  send(toPhone: string, message: StudentMessage): Promise<SendResult>;
}

// --- WhatsApp templates -----------------------------------------------------

interface TemplateSpec {
  /** Env var that can override the template name, or switch it off with "off". */
  env: string;
  defaultName: string;
  /** How many body variables the approved template has. */
  paramCount: number;
  /**
   * Quick-reply buttons, in the template's button order. Each payload must
   * match a BUTTON_REPLIES key in the Apps Script webhook, or the tap gets no
   * reply. A template with buttons rejects a send that leaves them out (Meta
   * error 132000), so this list must match the template exactly.
   */
  quickReplies: string[];
}

export const WHATSAPP_TEMPLATES: Record<MessageKind, TemplateSpec> = {
  // {{1}} name, {{2}} what they asked about
  enquiry: {
    env: "WHATSAPP_TEMPLATE_ENQUIRY",
    defaultName: "enquiry_received",
    paramCount: 2,
    quickReplies: ["I Have a Question", "View Complete Batch Plan"],
  },
  // {{1}} name, {{2}} branch, {{3}} online/classroom, {{4}} preferred slot
  demo: {
    env: "WHATSAPP_TEMPLATE_DEMO",
    defaultName: "demo_class_booked",
    paramCount: 4,
    quickReplies: ["I Have a Question", "View Complete Batch Plan"],
  },
  // {{1}} name, {{2}} college
  seminar: {
    env: "WHATSAPP_TEMPLATE_SEMINAR",
    defaultName: "seminar_registration",
    paramCount: 2,
    quickReplies: ["I Have a Question"],
  },
  // {{1}} name, {{2}} amount (no ₹ sign - the template has it), {{3}} batch, {{4}} invoice no.
  // No buttons: the webhook's button replies are written for prospects, and
  // this student has already paid.
  enrollment: {
    env: "WHATSAPP_TEMPLATE_ENROLLMENT",
    defaultName: "enrollment_confirmed",
    paramCount: 4,
    quickReplies: [],
  },
};

function templateName(kind: MessageKind): string | null {
  const spec = WHATSAPP_TEMPLATES[kind];
  const configured = process.env[spec.env]?.trim();
  if (configured === undefined || configured === "") return spec.defaultName;
  if (configured.toLowerCase() === "off") return null;
  return configured;
}

/**
 * Meta rejects a template variable that is empty, or that contains a newline,
 * a tab or more than four spaces in a row.
 */
function cleanParam(value: string): string {
  const flat = String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  return flat || "-";
}

const metaProvider: MessagingProvider = {
  name: "WhatsApp (Meta Cloud API)",
  isLive: true,
  channel: "whatsapp",
  async send(toPhone, message) {
    const token = cleanEnv(process.env.WHATSAPP_ACCESS_TOKEN);
    const phoneNumberId = cleanEnv(process.env.WHATSAPP_PHONE_NUMBER_ID);
    const version = cleanEnv(process.env.WHATSAPP_API_VERSION) || "v23.0";
    const language = cleanEnv(process.env.WHATSAPP_TEMPLATE_LANG) || "en";
    if (!token || !phoneNumberId) return { ok: false, detail: "WhatsApp credentials missing" };

    const name = templateName(message.kind);
    if (!name) return { ok: false, skipped: true, detail: `template for "${message.kind}" is switched off` };

    const spec = WHATSAPP_TEMPLATES[message.kind];
    const params = message.params.slice(0, spec.paramCount).map(cleanParam);
    while (params.length < spec.paramCount) params.push("-");

    const components: unknown[] = [
      { type: "body", parameters: params.map((text) => ({ type: "text", text })) },
      ...spec.quickReplies.map((payload, index) => ({
        type: "button",
        sub_type: "quick_reply",
        index: String(index),
        parameters: [{ type: "payload", payload }],
      })),
    ];

    try {
      const res = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: `91${normalisePhone(toPhone)}`,
          type: "template",
          template: { name, language: { code: language }, components },
        }),
        // Never hold a student's form open on a slow Graph API.
        signal: AbortSignal.timeout(10_000),
      });
      const body = (await res.json().catch(() => ({}))) as {
        messages?: { id?: string }[];
        error?: { code?: number; message?: string; error_data?: { details?: string } };
      };
      if (res.ok && body.messages?.[0]?.id) {
        return { ok: true, messageId: body.messages[0].id };
      }
      const err = body.error;
      const detail = err
        ? `(#${err.code ?? "?"}) ${err.error_data?.details || err.message || "rejected"}`
        : `HTTP ${res.status}`;
      return { ok: false, detail: `${name}: ${detail}` };
    } catch (err) {
      return { ok: false, detail: `${name}: ${String(err)}` };
    }
  },
};

// --- SMS providers (kept for completeness; not in use) ----------------------

const stubProvider: MessagingProvider = {
  name: "stub",
  isLive: false,
  channel: "none",
  async send(toPhone, message) {
    console.info(`[messaging:stub] would send "${message.kind}" to ${maskPhone(toPhone)}: ${message.text}`);
    return { ok: true, detail: "logged only - no provider configured" };
  },
};

const msg91Provider: MessagingProvider = {
  name: "msg91",
  isLive: true,
  channel: "sms",
  async send(toPhone, message) {
    const key = process.env.MESSAGING_API_KEY ?? "";
    const sender = process.env.MESSAGING_SENDER_ID ?? "";
    if (!key || !sender) return { ok: false, detail: "MSG91 credentials missing" };
    try {
      // NOTE: Indian SMS also requires a DLT-registered template before this
      // will deliver. Approval takes days - start it early.
      const res = await fetch("https://api.msg91.com/api/v2/sendsms", {
        method: "POST",
        headers: { "Content-Type": "application/json", authkey: key },
        body: JSON.stringify({
          sender,
          route: "4",
          country: "91",
          sms: [{ message: message.text, to: [normalisePhone(toPhone)] }],
        }),
      });
      return res.ok ? { ok: true } : { ok: false, detail: await res.text() };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};

const twilioProvider: MessagingProvider = {
  name: "twilio",
  isLive: true,
  channel: "sms",
  async send(toPhone, message) {
    const sid = process.env.MESSAGING_ACCOUNT_SID ?? "";
    const token = process.env.MESSAGING_API_KEY ?? "";
    const from = process.env.MESSAGING_SENDER_ID ?? "";
    if (!sid || !token || !from) return { ok: false, detail: "Twilio credentials missing" };
    try {
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        },
        body: new URLSearchParams({ To: `+91${normalisePhone(toPhone)}`, From: from, Body: message.text }),
      });
      return res.ok ? { ok: true } : { ok: false, detail: await res.text() };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};

export function getMessagingProvider(): MessagingProvider {
  switch ((process.env.MESSAGING_PROVIDER ?? "stub").trim().toLowerCase()) {
    case "meta":
    case "whatsapp":
      return metaProvider;
    case "msg91":
      return msg91Provider;
    case "twilio":
      return twilioProvider;
    default:
      return stubProvider;
  }
}

// --- Sending and recording --------------------------------------------------

export type LeadTableName = "general_enquiries" | "seminar_leads" | "demo_registrations" | "enrollments";

/**
 * Sends the student's confirmation, never throwing. `delivered` is true only
 * when a live provider accepted it - the stub logs without sending, and the
 * UI must not promise the student a message that was never sent.
 */
export async function sendStudentMessage(
  toPhone: string,
  message: StudentMessage,
): Promise<SendResult & { delivered: boolean; channel: MessagingProvider["channel"]; live: boolean }> {
  const provider = getMessagingProvider();
  let result: SendResult;
  try {
    result = await provider.send(toPhone, message);
  } catch (err) {
    result = { ok: false, detail: String(err) };
  }
  if (!result.ok && !result.skipped) {
    console.error(`[messaging] ${message.kind} confirmation to ${maskPhone(toPhone)} failed: ${result.detail}`);
  }
  return {
    ...result,
    delivered: result.ok && provider.isLive,
    channel: provider.channel,
    live: provider.isLive,
  };
}

let missingColumnsWarned = false;

/**
 * Writes the outcome onto the lead's row, so the admin lists show who got a
 * confirmation and why one failed. Needs migration 0009; until it has run this
 * logs one warning and does nothing.
 */
export async function recordMessageOutcome(
  supabase: SupabaseClient,
  table: LeadTableName,
  rowId: string,
  outcome: { ok: boolean; live: boolean; skipped?: boolean; messageId?: string; detail?: string },
): Promise<void> {
  // The short reason goes in the status itself, so the admin list shows why
  // without a second column; the full text is kept in confirmation_error.
  const status = !outcome.live
    ? "Not sent (no provider)"
    : outcome.skipped
      ? "Not sent (switched off)"
      : outcome.ok
      ? "Sent"
      : `Failed - ${(outcome.detail ?? "unknown error").slice(0, 90)}`;
  const { error } = await supabase
    .from(table)
    .update({
      confirmation_status: status,
      confirmation_message_id: outcome.messageId ?? "",
      confirmation_error: outcome.ok || outcome.skipped ? "" : (outcome.detail ?? "").slice(0, 500),
      confirmation_sent_at: outcome.ok && outcome.live ? new Date().toISOString() : null,
    })
    .eq("id", rowId);
  if (error) {
    if (/confirmation_/.test(error.message)) {
      if (!missingColumnsWarned) {
        missingColumnsWarned = true;
        console.warn("[messaging] confirmation columns missing - run migration 0009.");
      }
    } else {
      console.error(`[messaging] could not record outcome on ${table}:`, error.message);
    }
  }
}

// --- Helpers -----------------------------------------------------------------

/** Tolerates values pasted with quotes or stray whitespace into the host's env UI. */
function cleanEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

/** Strips spaces/punctuation and any +91 / 0 prefix down to 10 digits. */
function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

function maskPhone(phone: string): string {
  const d = normalisePhone(phone);
  return d.length === 10 ? `${d.slice(0, 3)}****${d.slice(-3)}` : "**********";
}

// --- Lead alert email to the client's team (SRS 10.2) ---------------------

/**
 * Sent to LEAD_NOTIFICATION_EMAIL, which is pending from the client (SRS 12).
 * Uses SMTP if configured, otherwise logs - a missing mail server must never
 * cause a lead submission to fail.
 *
 * Returns whether the alert was genuinely delivered. Callers use this to decide
 * whether a lead was captured anywhere at all, so it must not report success
 * for a logged-only or failed send.
 */
export async function notifyTeam(subject: string, lines: string[]): Promise<boolean> {
  const to = process.env.LEAD_NOTIFICATION_EMAIL?.trim();
  const body = lines.join("\n");

  if (!to || !process.env.SMTP_HOST) {
    console.info(`[notify:stub] ${subject}\n${body}`);
    return false;
  }

  try {
    // nodemailer is intentionally imported lazily so the dependency is only
    // required once the client has actually chosen a mail provider.
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
      to,
      subject,
      text: body,
    });
    return true;
  } catch (err) {
    console.error("[notify] failed to send lead alert:", err);
    return false;
  }
}
