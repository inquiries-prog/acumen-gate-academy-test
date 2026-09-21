"use client";

import { useEffect, useState } from "react";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { WHATSAPP_DEFAULT_MESSAGE, WHATSAPP_NUMBER } from "@/lib/defaults";
import { displayPhone, telHref, whatsappHref } from "@/lib/utils";
import { useSiteUI } from "./SiteUI";

/**
 * Guided chat widget (SRS 8.3).
 *
 * Explicitly NOT an AI chatbot. There is no free-text input anywhere in this
 * component: every path is a button leading to pre-written copy, so it cannot
 * produce an incorrect or embarrassing answer. Any path that isn't explicitly
 * handled routes to the counsellor fallback rather than guessing - and the
 * fallback is reachable from every menu, not only the main one.
 *
 * Adding free text or a real AI model here is a separately-scoped feature
 * (SRS 2.2) - do not quietly upgrade this widget.
 */

type Screen = "main" | "offline" | "online" | "seminar" | "fallback";

export default function ChatWidget() {
  const { chatOpen, setChatOpen, settings, push, openEnquiry } = useSiteUI();
  const [screen, setScreen] = useState<Screen>("main");

  useEffect(() => {
    if (!chatOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setChatOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chatOpen, setChatOpen]);

  // Always reopen on the main menu rather than mid-flow from last time.
  useEffect(() => {
    if (chatOpen) setScreen("main");
  }, [chatOpen]);

  if (!chatOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Chat with us"
      // Near-full-width sheet on a phone, floating panel from sm up, so it
      // never runs off-screen or covers the page content (SRS 3.4).
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[90] flex max-h-chat flex-col overflow-hidden
                 rounded-3xl border border-line bg-white shadow-lifted animate-sheetUp
                 ring-1 ring-charcoal/[0.06]
                 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[372px] sm:animate-slideUp"
    >
      <header className="flex items-center justify-between gap-3 bg-charcoal bg-dark-sheen px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red text-base font-bold text-white">
            A
          </span>
          <span>
            <span className="block font-display text-sm font-bold text-white">
              Acumen Gate Academy
            </span>
            <span className="flex items-center gap-1.5 text-xs text-white/60">
              {/* On-palette status dot - SRS 3.1 allows no colours outside its table. */}
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" aria-hidden="true" />
              Replies within 24 hours
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => setChatOpen(false)}
          aria-label="Close chat"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/80 transition-all duration-200 ease-smooth hover:bg-white/10 hover:text-white active:scale-95"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div className="relative flex-1 overflow-y-auto overscroll-contain bg-offwhite/50 px-4 py-5">
        <AmbientGlow />
        <div className="relative space-y-3">
        {screen === "main" && (
          <>
            <Bubble>Hi! How can we help you today?</Bubble>
            <Options>
              <Option onClick={() => setScreen("offline")}>🏫 Offline batch info</Option>
              <Option onClick={() => setScreen("online")}>💻 Online batch info</Option>
              <Option onClick={() => setScreen("seminar")}>🎓 I attended a seminar</Option>
              <Option onClick={() => setScreen("fallback")}>☎️ Talk to a counsellor</Option>
            </Options>
          </>
        )}

        {screen === "offline" && (
          <>
            <Bubble>
              Our offline GATE batches run at our Vadodara centre across all six branches — ME, CE,
              CSE, EE, EC and CH — with small batch sizes, a dedicated library, and schedules built
              around your college exams.
            </Bubble>
            <Options>
              <Option
                primary
                onClick={() => {
                  setChatOpen(false);
                  push({ kind: "batches", mode: "offline" });
                }}
              >
                See offline batches
              </Option>
              <Option onClick={() => setScreen("main")}>← Back to menu</Option>
              <Option onClick={() => setScreen("fallback")}>Something else</Option>
            </Options>
          </>
        )}

        {screen === "online" && (
          <>
            <Bubble>
              Our live online batches cover the same six branches and are built to keep real mentor
              access — you can call, message, or walk in to our Vadodara centre, not just watch
              recordings.
            </Bubble>
            <Options>
              <Option
                primary
                onClick={() => {
                  setChatOpen(false);
                  push({ kind: "batches", mode: "online" });
                }}
              >
                See online batches
              </Option>
              <Option onClick={() => setScreen("main")}>← Back to menu</Option>
              <Option onClick={() => setScreen("fallback")}>Something else</Option>
            </Options>
          </>
        )}

        {screen === "seminar" && (
          <>
            <Bubble>
              Great — students who attended one of our college seminars have an exclusive offer
              waiting. Share a few details and we&apos;ll show you the offer for your college.
            </Bubble>
            <Options>
              <Option
                primary
                onClick={() => {
                  setChatOpen(false);
                  push({ kind: "seminar" });
                }}
              >
                Know my offer
              </Option>
              <Option onClick={() => setScreen("main")}>← Back to menu</Option>
              <Option onClick={() => setScreen("fallback")}>Something else</Option>
            </Options>
          </>
        )}

        {screen === "fallback" && (
          <>
            <Bubble>
              For anything specific, our counsellors are best placed to help — call us directly, or
              fill a quick form and we&apos;ll reach out within 24 hours.
            </Bubble>
            <Options>
              <Option primary as="a" href={telHref(settings.phone)}>
                📞 Call {displayPhone(settings.phone)}
              </Option>
              <Option as="a" href={whatsappHref(WHATSAPP_NUMBER, WHATSAPP_DEFAULT_MESSAGE)}>
                💬 Message us on WhatsApp
              </Option>
              <Option
                onClick={() => {
                  setChatOpen(false);
                  openEnquiry("Chat widget");
                }}
              >
                📝 Fill the enquiry form
              </Option>
              <Option onClick={() => setScreen("main")}>← Back to menu</Option>
            </Options>
          </>
        )}
        </div>
      </div>
    </div>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-line bg-white px-4 py-3 text-sm leading-relaxed text-charcoal shadow-chip">
      {children}
    </div>
  );
}

function Options({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 pt-1">{children}</div>;
}

function Option({
  children,
  onClick,
  primary = false,
  as,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  primary?: boolean;
  as?: "a";
  href?: string;
}) {
  const className = `flex min-h-12 w-full items-center rounded-xl border px-4 text-left text-sm
                     font-semibold transition-all duration-200 ease-smooth ${
                       primary
                         ? "border-red bg-red text-white shadow-red-glow hover:bg-red-dark"
                         : "border-line bg-white text-charcoal hover:-translate-y-0.5 hover:border-red/40 hover:shadow-card"
                     }`;

  if (as === "a" && href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
