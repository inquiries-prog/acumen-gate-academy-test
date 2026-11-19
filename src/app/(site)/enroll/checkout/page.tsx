import type { Metadata } from "next";
import CheckoutClient, { type RazorpayCheckout } from "./CheckoutClient";
import { getPaymentProvider, toPaise } from "@/lib/payments";
import { getServiceClient } from "@/lib/supabase";
import type { Enrollment } from "@/lib/types";

export const metadata: Metadata = {
  title: "Complete your payment",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ order?: string; enrollment?: string }>;

/**
 * Checkout hand-off page (SRS 11.3).
 *
 * With Razorpay this opens Razorpay Checkout, so card and UPI details never
 * touch our servers (SRS 14). The amount, name and contact shown in Checkout
 * come from the enrollment row on the server, not from the URL - the URL only
 * says which enrollment, and the order id must match the one we stored.
 *
 * With the stub provider it renders a clearly-labelled simulator so the whole
 * enrollment flow - success, failure and abandonment - can be tested end to end.
 */
export default async function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
  const { order = "", enrollment: enrollmentId = "" } = await searchParams;
  const provider = getPaymentProvider();

  let razorpay: RazorpayCheckout | null = null;
  let alreadyPaid = false;

  if (provider.name === "razorpay" && enrollmentId) {
    const supabase = getServiceClient();
    const { data } = supabase
      ? await supabase.from("enrollments").select("*").eq("id", enrollmentId).maybeSingle()
      : { data: null };
    const enrollment = data as Enrollment | null;

    if (enrollment?.status === "paid") {
      alreadyPaid = true;
    } else if (enrollment && enrollment.payment_ref === order && process.env.PAYMENT_KEY_ID) {
      razorpay = {
        // The Key ID is public by design; the secret never leaves the server.
        keyId: process.env.PAYMENT_KEY_ID,
        orderId: order,
        amountPaise: toPaise(Number(enrollment.total_amount)),
        description: enrollment.batch_label,
        prefill: {
          name: enrollment.full_name,
          email: enrollment.email,
          contact: `+91${enrollment.phone.replace(/\D/g, "").slice(-10)}`,
        },
      };
    }
  }

  return (
    <div className="container-site max-w-lg py-14 md:py-20">
      <CheckoutClient
        orderId={order}
        enrollmentId={enrollmentId}
        providerName={provider.name}
        isLive={provider.isLive}
        razorpay={razorpay}
        alreadyPaid={alreadyPaid}
      />
    </div>
  );
}
