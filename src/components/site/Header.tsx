"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { telHref } from "@/lib/utils";
import ScrollProgress from "./ScrollProgress";
import { useSiteUI } from "./SiteUI";

/**
 * Global header (SRS 6.1). Sticky on desktop and mobile.
 *
 * Six nav items. "Offline Courses" and "Online Courses" are not pages - they
 * open the batches popup directly (SRS 5). "Contact Us" anchors the footer.
 * A standalone "Faculty" tab and an "Enquire for Batches" tab were both
 * explicitly removed from the final structure - do not add them back.
 *
 * On phones and tablets the menu is a full-screen panel rather than a narrow
 * drawer: large display-type items, numbered, sliding in from the right with a
 * short stagger, the ambient glow drifting behind them, and the three actions
 * (call, chat, enquire) pinned at the bottom inside the safe area. It is the
 * one screen every mobile visitor who explores will open, so it earns the
 * treatment.
 */
export default function Header() {
  const { settings, push, openEnquiry, setChatOpen } = useSiteUI();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Close the menu on navigation, otherwise it stays open over the new page.
  useEffect(() => setDrawerOpen(false), [pathname]);

  // Tab stays inside the menu, Escape closes it, focus returns to the
  // hamburger afterwards - shared with the modal shell.
  useFocusTrap(menuRef, drawerOpen, closeDrawer);

  useEffect(() => {
    if (!drawerOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 40);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  const navItems = [
    { label: "About Us", href: "/about" as const },
    { label: "Offline Courses", action: () => push({ kind: "batches", mode: "offline" as const }) },
    { label: "Online Courses", action: () => push({ kind: "batches", mode: "online" as const }) },
    { label: "Results", href: "/results" as const },
    { label: "News & Updates", href: "/news" as const },
    { label: "Contact Us", href: "/#contact" as const },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
      <div className="container-site flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Acumen Gate Academy home">
          {settings.logo_url ? (
            // Never recoloured or inverted via CSS filters (SRS 3.2).
            <Image
              src={settings.logo_url}
              alt="Acumen Gate Academy"
              width={190}
              height={52}
              priority
              className="h-10 w-auto sm:h-11"
            />
          ) : (
            <LogoFallback />
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200
                            after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full
                            after:bg-red after:transition-transform after:duration-300 after:ease-smooth
                            hover:text-red ${
                              pathname === item.href
                                ? "text-red after:scale-x-100"
                                : "text-charcoal after:scale-x-0 hover:after:scale-x-100"
                            }`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={item.action}
                className="relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-charcoal
                           transition-colors duration-200 after:absolute after:inset-x-3 after:-bottom-0.5
                           after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-red
                           after:transition-transform after:duration-300 after:ease-smooth
                           hover:text-red hover:after:scale-x-100"
              >
                {item.label}
              </button>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={telHref(settings.phone)}
            className="flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-bold text-charcoal transition-colors hover:text-red"
          >
            <PhoneIcon />
            <span className="hidden whitespace-nowrap 2xl:inline">{settings.phone}</span>
          </a>
          <button type="button" onClick={() => setChatOpen(true)} className="btn-secondary btn-sm">
            💬 Chat with us
          </button>
          <button type="button" onClick={() => openEnquiry("Header")} className="btn-primary btn-sm px-5">
            Enquire Now
          </button>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <a
            href={telHref(settings.phone)}
            aria-label={`Call ${settings.phone}`}
            className="grid h-11 w-11 place-items-center rounded-md text-charcoal transition-colors hover:bg-offwhite"
          >
            <PhoneIcon />
          </a>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className="grid h-11 w-11 place-items-center rounded-md text-charcoal transition-colors hover:bg-offwhite"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Full-screen mobile menu: same six items plus click-to-call (SRS 6.1).
          Portalled to <body>: the header's backdrop-filter would otherwise act
          as the containing block and pin a fixed panel to the 76px bar. */}
      {drawerOpen &&
        createPortal(
        <div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[95] flex flex-col overflow-hidden bg-white animate-slideInRight lg:hidden"
        >
          <AmbientGlow />

          <div className="relative flex h-[76px] shrink-0 items-center justify-between border-b border-line px-5">
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-red">
              Menu
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={closeDrawer}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center rounded-full text-charcoal transition-all duration-200 ease-smooth hover:bg-offwhite active:scale-95"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile" className="relative flex-1 overflow-y-auto overscroll-contain px-5 pt-3">
            {navItems.map((item, i) => {
              const itemClass = `animate-reveal flex min-h-[3.75rem] w-full items-center justify-between gap-4
                                 border-b border-line/70 text-left font-display text-[1.7rem] font-bold
                                 leading-none tracking-tight transition-colors duration-200
                                 active:text-red ${
                                   item.href && pathname === item.href ? "text-red" : "text-charcoal"
                                 }`;
              // Staggered so the list builds down the screen as the panel arrives.
              const style = { animationDelay: `${90 + i * 45}ms` };
              const inner = (
                <>
                  <span className="flex items-baseline gap-3">
                    <span className="text-xs font-semibold tabular-nums text-muted">0{i + 1}</span>
                    {item.label}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-red">
                    <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </>
              );

              return item.href ? (
                <Link key={item.label} href={item.href} style={style} className={itemClass}>
                  {inner}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  style={style}
                  onClick={() => {
                    closeDrawer();
                    item.action?.();
                  }}
                  className={itemClass}
                >
                  {inner}
                </button>
              );
            })}
          </nav>

          {/* Pinned actions. pb-safe keeps them above the iPhone home indicator. */}
          <div
            className="relative shrink-0 animate-reveal border-t border-line bg-white/90 px-5 pt-4 pb-safe backdrop-blur"
            style={{ animationDelay: "380ms" }}
          >
            <div className="grid grid-cols-2 gap-2.5">
              <a href={telHref(settings.phone)} className="btn-secondary">
                <PhoneIcon /> Call
              </a>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  setChatOpen(true);
                }}
                className="btn-secondary"
              >
                💬 Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  openEnquiry("Mobile menu");
                }}
                className="btn-primary col-span-2"
              >
                Enquire Now
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <ScrollProgress />
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 3h3l1.5 4-2 1.5a12 12 0 006.5 6.5L17 13l4 1.5v3a2 2 0 01-2.2 2A17 17 0 014 5.2 2 2 0 016 3z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Used until the client's real logo file is uploaded (SRS 12). */
function LogoFallback() {
  return (
    <span className="flex flex-col leading-none">
      <span className="text-xl font-extrabold tracking-tight text-charcoal sm:text-2xl">
        acumen
      </span>
      <span className="mt-0.5 rounded bg-red px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white">
        Gate Academy
      </span>
    </span>
  );
}
