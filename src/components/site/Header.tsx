"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AmbientGlow from "@/components/ui/AmbientGlow";
import Magnetic from "@/components/ui/Magnetic";
import { GiftIcon } from "./DemoHooks";
import CoursesMenu, { MobileCoursesList } from "./CoursesMenu";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { displayPhone, telHref } from "@/lib/utils";
import ScrollProgress from "./ScrollProgress";
import WhatsAppLink from "./WhatsAppLink";
import { useSiteUI } from "./SiteUI";

/**
 * Global header (SRS 6.1). Sticky on desktop and mobile.
 *
 * Six nav items. "Courses" (Nov 2026) replaces the separate "Offline Courses"
 * and "Online Courses" popups: hovering or focusing it opens a menu of every
 * course page, and clicking it goes to /courses. "FAQ" is the new FAQ page.
 * "Contact Us" anchors the footer. A standalone "Faculty" tab and an "Enquire
 * for Batches" tab were both explicitly removed from the final structure - do
 * not add them back.
 *
 * "Free Demo" is the highlighted button in the bar: it opens the free demo
 * side panel, and is styled to stand apart from "Enquire Now" on purpose.
 *
 * On phones and tablets the menu is a full-screen panel rather than a narrow
 * drawer: large display-type items, numbered, sliding in from the right with a
 * short stagger, the ambient glow drifting behind them, and the actions
 * (call, WhatsApp, chat, enquire) pinned at the bottom inside the safe area. It
 * is the one screen every mobile visitor who explores will open, so it earns
 * the treatment.
 *
 * WhatsApp sits in the bar itself on every screen size, as a green badge next
 * to the phone icon: for this audience it is the contact method, not an
 * alternative one, so it is never more than one tap away.
 *
 * Desktop layout (from `xl`; below that the full nav and the grouped actions
 * would not fit on one line, so tablets get the phone treatment) is a
 * three-column grid - logo / nav / actions - so the nav is centred on the page
 * rather than trailing the logo. The right-hand side is
 * three visual units, not five controls: a contact pill (phone + WhatsApp
 * share one shape), "Chat with us" as a quiet text link, and the one solid red
 * button. Everything SRS 6.1 lists is still there; it is just grouped.
 */
export default function Header() {
  const { settings, openEnquiry, openDemo, setChatOpen } = useSiteUI();
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Compact the bar once the page has scrolled. Written as a data attribute
  // through one rAF-coalesced passive listener, so nothing re-renders; the
  // CSS does the rest with transforms, so the document never reflows.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let frame = 0;
    let scrolled = false;
    const update = () => {
      frame = 0;
      // Hysteresis: on past 24px, off again below 8px - no flicker at the edge.
      const next = scrolled ? window.scrollY > 8 : window.scrollY > 24;
      if (next !== scrolled) {
        scrolled = next;
        header.toggleAttribute("data-scrolled", scrolled);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

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
    { label: "About Us", href: "/about" },
    { label: "Courses", href: "/courses", menu: true },
    { label: "Results", href: "/results" },
    { label: "News & Updates", href: "/news" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact Us", href: "/#contact" },
  ];

  const isActive = (href: string) =>
    href === "/courses" ? pathname?.startsWith("/courses") : pathname === href;

  return (
    <header ref={headerRef} className="group/header pointer-events-none sticky top-0 z-50 h-[76px]">
      {/* The visible bar. It is what compacts: up 12px and a shadow when the
          page has scrolled. Named for the view transition so it stays put
          while pages cross-fade beneath it. */}
      <div
        className="pointer-events-auto absolute inset-x-0 top-0 h-[76px] border-b border-line/80
                   bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75
                   transition-[transform,box-shadow] duration-300 ease-smooth
                   group-data-[scrolled]/header:-translate-y-3 group-data-[scrolled]/header:shadow-card"
        style={{ viewTransitionName: "site-header" }}
      >
      <div
        className="container-site flex h-[76px] items-center justify-between gap-4
                   transition-transform duration-300 ease-smooth group-data-[scrolled]/header:translate-y-1.5
                   xl:grid xl:grid-cols-[1fr_auto_1fr]"
      >
        <Link href="/" className="flex shrink-0 items-center xl:justify-self-start" aria-label="Acumen Gate Academy home">
          {settings.logo_url ? (
            // Never recoloured or inverted via CSS filters (SRS 3.2).
            <Image
              src={settings.logo_url}
              alt="Acumen Gate Academy"
              width={200}
              height={80}
              priority
              className="h-12 w-auto max-w-none origin-left transition-transform duration-300 ease-smooth group-data-[scrolled]/header:scale-[0.85] sm:h-[52px]"
            />
          ) : (
            <LogoFallback />
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {navItems.map((item) =>
            item.menu ? (
              <CoursesMenu key={item.label} active={Boolean(isActive(item.href))} />
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200
                            after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full
                            after:bg-red after:transition-transform after:duration-300 after:ease-smooth
                            hover:text-red ${
                              isActive(item.href)
                                ? "text-red after:scale-x-100"
                                : "text-charcoal after:scale-x-0 hover:after:scale-x-100"
                            }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-4 xl:flex xl:justify-self-end">
          {/* Contact pill: phone and WhatsApp share one shape. */}
          <div className="flex items-center rounded-full border border-line bg-white p-1 pl-1.5 shadow-chip">
            <a
              href={telHref(settings.phone)}
              aria-label={`Call ${settings.phone}`}
              className="flex h-8 items-center gap-1.5 rounded-full px-2 text-sm font-bold text-charcoal transition-colors hover:text-red"
            >
              <PhoneIcon />
              <span className="hidden whitespace-nowrap 2xl:inline">{displayPhone(settings.phone)}</span>
            </a>
            <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />
            <WhatsAppLink ariaLabel="Message us on WhatsApp" className="whatsapp-badge h-8 w-8">
              <WhatsAppIcon size={17} />
            </WhatsAppLink>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="hidden whitespace-nowrap text-sm font-semibold text-charcoal underline-offset-4 transition-colors hover:text-red hover:underline 2xl:inline"
          >
            Chat with us
          </button>
          <button
            type="button"
            onClick={() => openEnquiry("Header")}
            className="whitespace-nowrap text-sm font-bold text-charcoal underline-offset-4 transition-colors hover:text-red hover:underline"
          >
            Enquire Now
          </button>
          <Magnetic>
            <DemoButton onClick={() => openDemo("Header button")} />
          </Magnetic>
        </div>

        <div className="flex items-center gap-1.5 xl:hidden">
          <button
            type="button"
            onClick={() => openDemo("Header button (mobile)")}
            className="relative mr-0.5 hidden min-h-10 items-center gap-1.5 overflow-hidden rounded-full bg-[length:200%_100%] bg-[linear-gradient(110deg,#E31E24,#A32D2D,#E31E24)] px-3.5 text-[13px] font-extrabold text-white shadow-red-glow animate-gradient-x min-[400px]:inline-flex"
          >
            <GiftIcon size={14} />
            Free Demo
          </button>
          <a
            href={telHref(settings.phone)}
            aria-label={`Call ${settings.phone}`}
            className="grid h-11 w-11 place-items-center rounded-md text-charcoal transition-colors hover:bg-offwhite"
          >
            <PhoneIcon />
          </a>
          <WhatsAppLink ariaLabel="Message us on WhatsApp" className="whatsapp-badge h-10 w-10">
            <WhatsAppIcon size={21} />
          </WhatsAppLink>
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
          className="fixed inset-0 z-[95] flex flex-col overflow-hidden bg-white animate-slideInRight xl:hidden"
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
                                 active:text-red ${isActive(item.href) ? "text-red" : "text-charcoal"}`;
              // Staggered so the list builds down the screen as the panel arrives.
              const style = { animationDelay: `${90 + i * 45}ms` };
              const label = (
                <span className="flex items-baseline gap-3">
                  <span className="text-xs font-semibold tabular-nums text-muted">0{i + 1}</span>
                  {item.label}
                </span>
              );

              if (item.menu) {
                return (
                  <div key={item.label} style={style} className="animate-reveal border-b border-line/70">
                    <button
                      type="button"
                      onClick={() => setMobileCoursesOpen((v) => !v)}
                      aria-expanded={mobileCoursesOpen}
                      className={`flex min-h-[3.75rem] w-full items-center justify-between gap-4 text-left font-display text-[1.7rem] font-bold leading-none tracking-tight ${
                        isActive(item.href) ? "text-red" : "text-charcoal"
                      }`}
                    >
                      {label}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        className={`shrink-0 text-red transition-transform duration-300 ${mobileCoursesOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {mobileCoursesOpen && <MobileCoursesList />}
                  </div>
                );
              }

              return (
                <Link key={item.label} href={item.href} style={style} className={itemClass}>
                  {label}
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-red">
                    <path d="M4 10h11m0 0l-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              );
            })}
          </nav>

          {/* Pinned actions. pb-safe keeps them above the iPhone home indicator. */}
          <div
            className="relative shrink-0 animate-reveal border-t border-line bg-white/90 px-5 pt-4 pb-safe backdrop-blur"
            style={{ animationDelay: "380ms" }}
          >
            <div className="grid grid-cols-3 gap-2.5">
              <a href={telHref(settings.phone)} className="btn-secondary px-2 text-sm">
                <PhoneIcon /> Call
              </a>
              <WhatsAppLink className="btn-whatsapp px-2 text-sm">
                <WhatsAppIcon /> WhatsApp
              </WhatsAppLink>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  setChatOpen(true);
                }}
                className="btn-secondary px-2 text-sm"
              >
                💬 Chat
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  openEnquiry("Mobile menu");
                }}
                className="btn-secondary col-span-3 min-[400px]:col-span-1"
              >
                Enquire
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  openDemo("Mobile menu");
                }}
                className="btn-primary col-span-3 min-[400px]:col-span-2"
              >
                <GiftIcon /> Book a Free Demo
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <ScrollProgress />
      </div>
    </header>
  );
}

/**
 * The highlighted "Free Demo" button: a slowly travelling red gradient, a
 * light sweep on hover, a gift that wiggles and a "FREE" tag - deliberately louder than
 * "Enquire Now" next to it, because a free class is the easier first step.
 */
function DemoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex min-h-10 items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl
                 bg-[length:200%_100%] bg-[linear-gradient(110deg,#E31E24,#A32D2D_45%,#E31E24)] px-4 text-sm font-extrabold
                 text-white shadow-red-glow transition-all duration-300 ease-smooth animate-gradient-x
                 hover:-translate-y-0.5 hover:shadow-lifted active:scale-[0.98]"
    >
      <span aria-hidden="true" className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-smooth group-hover:translate-x-full" />
      <span className="relative animate-wiggle">
        <GiftIcon />
      </span>
      <span className="relative">Free Demo Class</span>
      <span className="relative rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-red">
        Free
      </span>
    </button>
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
