import type { Metadata } from "next";
import CheckoutClient from "./CheckoutClient";
import { getPaymentProvider } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Complete your payment",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ order?: string; enrollment?: string }>;

/**
 * Checkout hand-off page (SRS 11.3).
 *
 * With a real gateway this mounts the provider's hosted/tokenised checkout, so
 * card details never touch our servers (SRS 14). While the provider is still
 * undecided, the stub renders a clearly-labelled simulator so the whole
 * enrollment flow - success, failure and abandonment - can be tested end to end.
 */
export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const { order = "", enrollment = "" } = await searchParams;
  const provider = getPaymentProvider();

  return (
    <div className="container-site max-w-lg py-14 md:py-20">
      <CheckoutClient
        orderId={order}
        enrollmentId={enrollment}
        providerName={provider.name}
        isLive={provider.isLive}
      />
    </div>
  );
}
