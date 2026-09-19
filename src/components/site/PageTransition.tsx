"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/**
 * Cross-fades the page content on client-side navigation.
 *
 * Uses React's ViewTransition, which Next 16 ships with no configuration. The
 * `key` on the pathname is what fires an exit for the old page and an enter for
 * the new one; hash and query changes do not re-key, so anchors and filters
 * never trigger it. Animation lives in globals.css under the `page-enter` /
 * `page-exit` class names, with the sticky header pinned so it stays still
 * while the page moves beneath it. Browsers without the View Transitions API
 * simply swap instantly.
 *
 * Mounted only in the public site's layout - the admin panel is untouched.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      <div>{children}</div>
    </ViewTransition>
  );
}
