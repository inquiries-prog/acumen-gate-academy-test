"use client";

import { useEffect, useRef } from "react";

/**
 * A large, dim red glow that trails the cursor across a dark section.
 *
 * Same mechanics as Spotlight, scaled up for a whole band: the parent section
 * is the host, the glow fades in on enter and out on leave, and one transform
 * per frame moves it. Desktop only (hover + fine pointer) and hidden below
 * `lg` regardless, so phones never pay for it.
 */
export default function CursorGlow({ size = 840, alpha = 0.18 }: { size?: number; alpha?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rect: DOMRect | null = null;
    let x = 0;
    let y = 0;
    let frame = 0;
    const half = size / 2;

    const paint = () => {
      frame = 0;
      el.style.transform = `translate3d(${x - half}px, ${y - half}px, 0)`;
    };
    const onEnter = () => {
      rect = host.getBoundingClientRect();
      el.style.opacity = "1";
    };
    const onMove = (e: MouseEvent) => {
      if (!rect) rect = host.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      rect = null;
      el.style.opacity = "0";
    };

    host.addEventListener("mouseenter", onEnter);
    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseleave", onLeave);
    return () => {
      host.removeEventListener("mouseenter", onEnter);
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(frame);
    };
  }, [size]);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-0 hidden rounded-full opacity-0 transition-opacity duration-500 lg:block"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(227,30,36,${alpha}) 0%, rgba(227,30,36,0) 60%)`,
        transform: "translate3d(-9999px, 0, 0)",
      }}
    />
  );
}
