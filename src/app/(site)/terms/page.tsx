import type { Metadata } from "next";
import LegalPageView from "@/components/site/LegalPageView";
import { getLegalPage } from "@/lib/content";

/**
 * Content comes from the database, so this page must not stay frozen at the
 * value it had when the site was built (SRS 9.3 - no content change may need a
 * redeploy). Saving in the admin panel calls revalidatePath for an instant
 * update; this is the safety net for anything that changes the database by
 * another route.
 */
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms that apply to using the Acumen Gate Academy website and enrolling online.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};

export default async function TermsPage() {
  const page = await getLegalPage("terms");
  return <LegalPageView title={page?.title || "Terms & Conditions"} content={page?.content ?? ""} />;
}
