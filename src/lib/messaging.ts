/**
 * SMS / WhatsApp adapter (SRS 10.2) and lead-alert email.
 *
 * Neither enquiry form collects an email address (SRS 8.1), so the student's
 * confirmation must go by SMS or WhatsApp. The provider is undecided (SRS 12)
 * and carries an ongoing per-message cost the client has to approve, so the
 * default provider logs instead of sending. Nothing else in the codebase knows
 * which provider is in use.
 */

export interface MessagingProvider {
  readonly name: string;
  readonly isLive: boolean;
  send(toPhone: string, message: string): Promise<{ ok: boolean; detail?: string }>;
}

const stubProvider: MessagingProvider = {
  name: "stub",
  isLive: false,
  async send(toPhone, message) {
    console.info(`[messaging:stub] would send to ${maskPhone(toPhone)}: ${message}`);
    return { ok: true, detail: "logged only - no provider configured" };
  },
};

const msg91Provider: MessagingProvider = {
  name: "msg91",
  isLive: true,
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
          sms: [{ message, to: [normalisePhone(toPhone)] }],
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
        body: new URLSearchParams({ To: `+91${normalisePhone(toPhone)}`, From: from, Body: message }),
      });
      return res.ok ? { ok: true } : { ok: false, detail: await res.text() };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};

export function getMessagingProvider(): MessagingProvider {
  switch ((process.env.MESSAGING_PROVIDER ?? "stub").toLowerCase()) {
    case "msg91":
      return msg91Provider;
    case "twilio":
      return twilioProvider;
    default:
      return stubProvider;
  }
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
