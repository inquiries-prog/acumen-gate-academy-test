import type { Metadata } from "next";
import Link from "next/link";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { displayPhone, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * 404. Kept useful rather than decorative - a student who lands here is still a
 * prospect, so it points at the pages they were most likely looking for.
 */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-red">404</p>
      <h1 className="mt-3 text-2xl font-bold sm:text-3xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-body">
        It may have moved, or the link may be out of date. Here&apos;s where most people are
        heading:
      </p>

      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link href="/" className="btn-primary">
          Go to the homepage
        </Link>
        <Link href="/results" className="btn-secondary">
          See our results
        </Link>
      </div>

      <p className="mt-6 text-sm text-body">
        Or just call us on{" "}
        <a href={telHref(PHONE_DISPLAY)} className="font-bold text-red hover:underline">
          {displayPhone(PHONE_DISPLAY)}
        </a>
        .
      </p>
    </div>
  );
}
