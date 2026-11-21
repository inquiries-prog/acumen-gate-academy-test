"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Celebration } from "@/components/art/Scenes";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { daysUntil, displayPhone, telHref } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";
import WhatsAppLink from "./WhatsAppLink";

/** Set once a visitor books, so the gentle prompts stop appearing. */
export const DEMO_BOOKED_KEY = "acumen-demo-booked";

const PERKS = [
  { icon: "live", title: "A real live class", body: "A core topic from your branch, taught by an Acumen mentor." },
  { icon: "doubt", title: "Doubt-clearing slot", body: "Ask anything - about the topic, GATE, or your preparation." },
  { icon: "plan", title: "A study plan for you", body: "Which batch fits your college schedule, and where to begin." },
] as const;

/**
 * The free demo class side panel.
 *
 * Slides in from the right over whatever page is open - a side panel rather
 * than a centred popup, so it reads as "a quick aside" and the page stays in
 * view behind it. On phones it is a full-height sheet.
 *
 * Four short fields: name, phone, branch, and online or in person, plus an
 * optional preferred time. Bookings go to their own lead list (Free demo
 * registrations in admin) via /api/demo.
 *
 * Every element that animates does so with transform and opacity only, and the
 * whole panel honours reduced motion through the global rule in globals.css.
 */
export default function DemoDrawer() {
  const { demo, closeDemo, settings, formOptions } = useSiteUI();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Kept mounted for the exit animation, then removed.
  const [render, setRender] = useState(false);
  const [instance, setInstance] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (demo.open) {
      setRender(true);
      return;
    }
    const t = window.setTimeout(() => {
      setRender(false);
      // Fresh form next time, so a reopened panel doesn't show the last success.
      setInstance((n) => n + 1);
    }, 320);
    return () => window.clearTimeout(t);
  }, [demo.open]);

  useFocusTrap(panelRef, demo.open, closeDemo);

  useEffect(() => {
    if (!demo.open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(
      () => panelRef.current?.querySelector<HTMLInputElement>("input[name=full_name]")?.focus(),
      350,
    );
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = overflow;
    };
  }, [demo.open]);

  if (!mounted || !render) return null;

  const days = daysUntil(settings.gate_exam_date);

  return createPortal(
    <div className="fixed inset-0 z-[110]" role="presentation">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={closeDemo}
        className={`absolute inset-0 bg-charcoal/50 backdrop-blur-[3px] transition-opacity duration-300 ${
          demo.open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="demo-title"
        className={`absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden bg-white shadow-lifted
                    transition-transform duration-[420ms] ease-smooth sm:max-w-[460px] sm:rounded-l-[28px]
                    ${demo.open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header band */}
        <div className="relative isolate shrink-0 overflow-hidden bg-charcoal bg-dark-sheen px-6 pb-7 pt-6 text-white sm:px-8">
          <div aria-hidden="true" className="grid-texture pointer-events-none absolute inset-0 opacity-[0.05]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-red/40 blur-3xl animate-glow-a"
          />

          <div className="relative flex items-start justify-between gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 ring-1 ring-white/15">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red" />
              </span>
              Free · No obligation
            </span>
            <button
              type="button"
              onClick={closeDemo}
              aria-label="Close the free demo panel"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-all duration-200 hover:rotate-90 hover:bg-white/20 active:scale-95"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <h2 id="demo-title" className="relative mt-5 font-display text-[1.65rem] font-extrabold leading-tight text-white">
            {settings.demo_heading || "Sit in on a free GATE demo class"}
          </h2>
          {settings.demo_subtext && (
            <p className="relative mt-2.5 text-sm leading-relaxed text-white/70">{settings.demo_subtext}</p>
          )}

          <div className="relative mt-5 flex flex-wrap gap-2 text-xs font-semibold">
            {days !== null && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-3 py-1.5 text-white shadow-red-glow">
                ⏳ {days} days to {settings.gate_exam_label || "GATE"}
              </span>
            )}
            {settings.google_rating && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/90 ring-1 ring-white/15">
                <span className="text-amber-400">★</span> {settings.google_rating} on Google
                {settings.google_reviews_count && (
                  <span className="text-white/55">({settings.google_reviews_count})</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-safe-6 pt-6 sm:px-8">
          <DemoForm key={instance} source={demo.source} prefill={demo.prefill} formOptions={formOptions} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DemoForm({
  source,
  prefill,
  formOptions,
}: {
  source: string;
  prefill?: { branch?: string; mode?: string };
  formOptions: Record<string, string[]>;
}) {
  const { settings, closeDemo } = useSiteUI();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  const branches = formOptions.branch ?? [];
  const modes = formOptions.enquiry_for?.length ? formOptions.enquiry_for : ["Online", "Offline at Vadodara"];
  const slots = formOptions.demo_slot ?? [];
  const [mode, setMode] = useState(prefill?.mode && modes.includes(prefill.mode) ? prefill.mode : modes[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setShowErrors(true);
      form.querySelector<HTMLElement>(":invalid")?.focus();
      return;
    }
    setError(null);
    setSubmitting(true);
    const fd = new FormData(form);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fd.get("full_name"),
          phone: fd.get("phone"),
          branch: fd.get("branch"),
          mode,
          preferred_slot: fd.get("preferred_slot"),
          source,
          company: fd.get("company"),
        }),
      });
      const body = (await res.json()) as { ok: boolean; smsSent?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong.");
      setSmsSent(Boolean(body.smsSent));
      setDone(true);
      try {
        localStorage.setItem(DEMO_BOOKED_KEY, "1");
      } catch {
        /* storage blocked - the prompts may show again, which is harmless */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't book that just now. Please call us instead.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="py-6 text-center">
        <Celebration />
        <h3 className="font-display text-2xl font-extrabold animate-reveal" style={{ animationDelay: "250ms" }}>
          Your seat is reserved!
        </h3>
        <p
          className="mx-auto mt-2.5 max-w-xs text-sm leading-relaxed text-body animate-reveal"
          style={{ animationDelay: "350ms" }}
        >
          Our team will call you shortly to confirm the date and time of your free demo class.
          {smsSent && " A confirmation has also been sent to your phone."}
        </p>
        <div className="mt-6 grid gap-2.5 animate-reveal" style={{ animationDelay: "450ms" }}>
          <WhatsAppLink className="btn-whatsapp" message="Hi Acumen Gate Academy, I've just booked a free demo class.">
            <WhatsAppIcon /> Say hello on WhatsApp
          </WhatsAppLink>
          <a href={telHref(settings.phone)} className="btn-secondary">
            Call {displayPhone(settings.phone)}
          </a>
          <button type="button" onClick={closeDemo} className="btn-ghost">
            Back to the website
          </button>
        </div>
      </div>
    );
  }

  const invalidRing = showErrors ? "[&:invalid]:border-red" : "";

  return (
    <>
      <ul className="space-y-3">
        {PERKS.map((perk, i) => (
          <li
            key={perk.title}
            className="flex items-start gap-3.5 animate-reveal"
            style={{ animationDelay: `${180 + i * 80}ms` }}
          >
            <span className="icon-tile h-10 w-10">
              <PerkIcon icon={perk.icon} />
            </span>
            <span>
              <span className="block text-sm font-bold text-charcoal">{perk.title}</span>
              <span className="block text-[13px] leading-snug text-body">{perk.body}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="rule-fade my-6" />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="demo-name" className="field-label">
              Full Name <span className="text-red">*</span>
            </label>
            <input
              id="demo-name"
              name="full_name"
              required
              minLength={2}
              autoComplete="name"
              placeholder="Your name"
              className={`field ${invalidRing}`}
            />
          </div>
          <div>
            <label htmlFor="demo-phone" className="field-label">
              Mobile <span className="text-red">*</span>
            </label>
            <input
              id="demo-phone"
              name="phone"
              required
              type="tel"
              inputMode="numeric"
              pattern="[0-9+\s-]{10,15}"
              autoComplete="tel"
              placeholder="10-digit number"
              className={`field ${invalidRing}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="demo-branch" className="field-label">
            Branch <span className="text-red">*</span>
          </label>
          <select
            id="demo-branch"
            name="branch"
            required
            defaultValue={prefill?.branch && branches.includes(prefill.branch) ? prefill.branch : ""}
            className={`field ${invalidRing}`}
          >
            <option value="" disabled>
              Select your branch
            </option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend className="field-label">Attend the demo</legend>
          <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-3">
            {modes.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`min-h-11 rounded-xl border px-3 text-[13px] font-semibold leading-tight transition-all duration-200 ease-smooth active:scale-[0.97] ${
                  mode === m
                    ? "border-red bg-red/[0.06] text-red shadow-chip"
                    : "border-line bg-white text-charcoal hover:border-charcoal/25"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        {slots.length > 0 && (
          <div>
            <label htmlFor="demo-slot" className="field-label">
              Preferred time <span className="font-normal text-muted">(optional)</span>
            </label>
            <select id="demo-slot" name="preferred_slot" defaultValue="" className="field">
              <option value="">Any time that suits you</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {showErrors && (
          <p className="text-xs font-medium text-red-dark animate-slideUp">
            Please fill in your name, a 10-digit mobile number and your branch.
          </p>
        )}

        {error && (
          <p className="rounded-md bg-red/5 px-3 py-2.5 text-sm text-red-dark" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full text-base">
          {submitting ? "Booking your seat…" : "Book my free seat"}
          {!submitting && (
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="animate-nudge-x">
              <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <p className="text-center text-xs leading-relaxed text-muted">
          We&apos;ll call to confirm your slot. No fee, no spam.
        </p>
      </form>
    </>
  );
}

function PerkIcon({ icon }: { icon: (typeof PERKS)[number]["icon"] }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", "aria-hidden": true } as const;
  if (icon === "live") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 9l4 2-4 2V9z" fill="currentColor" />
        <path d="M8 20h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === "doubt") {
    return (
      <svg {...common}>
        <path d="M4 5h16v10H9l-5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M10 8.5a2 2 0 113 1.7c-.6.4-1 .8-1 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="13.3" r=".9" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
