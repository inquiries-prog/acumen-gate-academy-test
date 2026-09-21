import type { Metadata } from "next";
import Link from "next/link";
import { PHONE_DISPLAY } from "@/lib/defaults";
import { displayPhone, telHref } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Enrollment status",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ state?: string }>;

/**
 * Post-payment landing page.
 *
 * Purely informational - the enrollment is marked paid by the gateway webhook,
 * not by the visitor arriving here, so a closed tab never loses a payment.
 */
export default async function EnrollStatusPage({ searchParams }: { searchParams: SearchParams }) {
  const { state } = await searchParams;
  const paid = state === "paid";

  return (
    <div className="container-site max-w-lg py-14 md:py-20">
      <div className="card p-8 text-center">
        <div
          className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${
            paid ? "bg-red/10" : "bg-offwhite"
          }`}
        >
          <span className="text-2xl" aria-hidden="true">
            {paid ? "✅" : "⚠️"}
          </span>
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          {paid ? "Payment received — welcome to Acumen!" : "That payment didn't go through"}
        </h1>

        <p className="mt-3 text-[15px] leading-relaxed text-body">
          {paid ? (
            <>
              Your enrollment is confirmed. Your GST invoice has been emailed to you, and our team
              will contact you shortly with your batch joining details.
            </>
          ) : (
            <>
              Nothing has been charged. Your details are saved, so you can either try again or call
              us and we&apos;ll complete your enrollment with you over the phone.
            </>
          )}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <a href={telHref(PHONE_DISPLAY)} className={paid ? "btn-secondary" : "btn-primary"}>
            Call {displayPhone(PHONE_DISPLAY)}
          </a>
          <Link href="/" className={paid ? "btn-primary" : "btn-secondary"}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
