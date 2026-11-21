"use client";

import { useEffect, useRef, useState } from "react";

/**
 * In-page tabs for a course page (Overview, Syllabus, Batches...).
 *
 * A compact glass capsule rather than a full-width strip: it sits centred on
 * the bottom edge of the hero, straddling it, and once the page scrolls it
 * docks just under the header pill - same glass, same rounded shape, so the
 * two read as a stack rather than a bar slapped across the screen.
 *
 * The section being read gets a red pill that slides between tabs
 * (transform + width only). On phones the tabs scroll sideways inside the
 * capsule and the active one is kept in view.
 */
export default function CourseSectionNav({ sections }: { sections: Array<{ id: string; label: string }> }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ x: 0, w: 0, ready: false });

  // Which section is being read: the one crossing a band just below the header.
  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  // Move the highlight to the active tab, and keep it in view on phones.
  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLAnchorElement>(`[data-section="${active}"]`);
    if (!list || !tab) return;
    const place = () => setBar({ x: tab.offsetLeft, w: tab.offsetWidth, ready: true });
    place();
    list.scrollTo({ left: tab.offsetLeft - list.clientWidth / 2 + tab.offsetWidth / 2, behavior: "smooth" });
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  return (
    <nav
      aria-label="On this page"
      className="pointer-events-none sticky top-[calc(var(--hdr-pill-h)+22px)] z-40 -mt-7 px-3"
    >
      <div className="glass-pill pointer-events-auto mx-auto w-fit max-w-full rounded-full p-1.5">
        <div ref={listRef} className="no-scrollbar relative flex overflow-x-auto rounded-full">
          <span
            aria-hidden="true"
            className={`absolute inset-y-0 left-0 rounded-full bg-red shadow-red-glow transition-[transform,width,opacity] duration-500 ease-smooth ${
              bar.ready ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: `translateX(${bar.x}px)`, width: bar.w }}
          />
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-section={s.id}
              aria-current={active === s.id ? "true" : undefined}
              onClick={() => setActive(s.id)}
              className={`relative z-10 shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-bold transition-colors duration-300 sm:px-5 sm:text-sm ${
                active === s.id ? "text-white" : "text-charcoal hover:text-red"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
