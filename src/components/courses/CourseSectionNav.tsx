"use client";

import { useEffect, useRef, useState } from "react";

/**
 * In-page tabs for a course page (Overview, Syllabus, Batches...). Sticks under
 * the header, highlights whichever section is being read, and keeps the active
 * tab scrolled into view on phones where the row scrolls sideways.
 *
 * The highlight is one sliding underline positioned from the active tab's
 * box - transform only.
 */
export default function CourseSectionNav({ sections }: { sections: Array<{ id: string; label: string }> }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const listRef = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter((n): n is HTMLElement => Boolean(n));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const list = listRef.current;
    const tab = list?.querySelector<HTMLAnchorElement>(`[data-section="${active}"]`);
    if (!list || !tab) return;
    setBar({ x: tab.offsetLeft, w: tab.offsetWidth });
    const left = tab.offsetLeft - list.clientWidth / 2 + tab.offsetWidth / 2;
    list.scrollTo({ left, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="On this page"
      className="sticky top-[76px] z-40 border-b border-line bg-white/85 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75"
    >
      <div className="container-site">
        <div ref={listRef} className="no-scrollbar relative flex gap-1 overflow-x-auto">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              data-section={s.id}
              aria-current={active === s.id ? "true" : undefined}
              className={`shrink-0 whitespace-nowrap px-3.5 py-4 text-sm font-bold transition-colors duration-200 ${
                active === s.id ? "text-red" : "text-charcoal hover:text-red"
              }`}
            >
              {s.label}
            </a>
          ))}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[3px] rounded-full bg-red transition-[transform,width] duration-500 ease-smooth"
            style={{ transform: `translateX(${bar.x}px)`, width: bar.w }}
          />
        </div>
      </div>
    </nav>
  );
}
