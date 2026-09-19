"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Admin navigation (SRS 9.1).
 *
 * Grouped and labelled in plain language, so the client can find "Mentors" or
 * "Seminar offers by college" without knowing what a table is. Collapses to a
 * drawer on small screens - the client should be able to change a batch date or
 * check leads from a phone.
 */

interface NavItem {
  href: string;
  label: string;
}

const groups: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Leads",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/leads/enquiries", label: "General enquiries" },
      { href: "/admin/leads/seminar", label: "Seminar leads" },
      { href: "/admin/leads/enrollments", label: "Paid enrollments" },
    ],
  },
  {
    heading: "Homepage",
    items: [
      { href: "/admin/settings", label: "Banner, hero & contact details" },
      { href: "/admin/c/gallery", label: "Result & press images" },
      { href: "/admin/c/courses", label: "Our Courses cards" },
      { href: "/admin/c/why-choose", label: "Why Choose Acumen cards" },
      { href: "/admin/c/testimonials", label: "Success stories" },
      { href: "/admin/c/mentors", label: "Mentors" },
    ],
  },
  {
    heading: "Courses & batches",
    items: [
      { href: "/admin/batches", label: "Batches, dates & fees" },
      { href: "/admin/c/pedagogy", label: "What every batch includes" },
    ],
  },
  {
    heading: "Pages",
    items: [
      { href: "/admin/about", label: "About Us text" },
      { href: "/admin/c/ecosystem", label: "Ecosystem cards" },
      { href: "/admin/c/centers", label: "Our centers" },
      { href: "/admin/c/faq", label: "FAQ" },
      { href: "/admin/results", label: "Results page" },
      { href: "/admin/c/news", label: "News & Updates" },
    ],
  },
  {
    heading: "Forms & setup",
    items: [
      { href: "/admin/c/seminar-offers", label: "Seminar offers by college" },
      { href: "/admin/c/form-options", label: "Form dropdown choices" },
      { href: "/admin/c/seo", label: "Page titles for Google" },
      { href: "/admin/c/legal", label: "Privacy Policy & Terms" },
      { href: "/admin/setup", label: "First-time setup" },
    ],
  },
];

export default function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="text-sm font-bold text-charcoal">
          Acumen admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="btn-secondary"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        className={`w-full shrink-0 border-r border-line bg-white lg:block lg:w-64 ${
          open ? "block" : "hidden"
        }`}
      >
        <div className="hidden items-center gap-2 border-b border-line px-5 py-4 lg:flex">
          <span className="text-base font-extrabold tracking-tight text-charcoal">acumen</span>
          <span className="rounded bg-red px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Admin
          </span>
        </div>

        <nav className="max-h-[calc(100vh-64px)] overflow-y-auto px-3 py-4 lg:sticky lg:top-0">
          {groups.map((group) => (
            <div key={group.heading} className="mb-5">
              <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
                {group.heading}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex min-h-10 items-center rounded-md px-2.5 text-[13px] font-medium leading-snug transition-colors ${
                          active
                            ? "bg-red/10 font-bold text-red"
                            : "text-charcoal hover:bg-offwhite"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className="mt-2 border-t border-line px-2 pt-4">
            <p className="truncate text-xs text-muted" title={email}>
              {email}
            </p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link href="/" target="_blank" className="text-xs font-semibold text-charcoal hover:text-red">
                View the website ↗
              </Link>
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="text-xs font-semibold text-red hover:underline">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
